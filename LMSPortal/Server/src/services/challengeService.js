import CodingChallenge from '../models/CodingChallenge.js';
import CodingSubmission from '../models/CodingSubmission.js';
import { executeCode } from './codeExecutionService.js';
import { recordSkillEvidence } from './skillService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Get all coding challenges with filtering and user status
 */
export const getChallenges = async (query = {}, userId = null) => {
  const { difficulty, category, skillId, search, page = 1, limit = 20 } = query;
  const filter = { isPublished: true };

  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty;
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (skillId && skillId !== 'All') {
    filter.skills = skillId;
  }
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [challenges, total] = await Promise.all([
    CodingChallenge.find(filter)
      .populate('skills', 'name slug category difficulty')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    CodingChallenge.countDocuments(filter),
  ]);

  // Sanitize test cases and attach user submission status
  let userSubmissionsMap = {};
  if (userId) {
    const submissions = await CodingSubmission.aggregate([
      { $match: { user: userId } },
      { $sort: { submittedAt: -1 } },
      {
        $group: {
          _id: '$challenge',
          bestScore: { $max: '$score' },
          latestStatus: { $first: '$status' },
          submissionCount: { $sum: 1 },
        },
      },
    ]);
    submissions.forEach((s) => {
      userSubmissionsMap[s._id.toString()] = s;
    });
  }

  const sanitized = challenges.map((c) => {
    const totalCases = (c.testCases || []).length;
    const sampleCases = (c.testCases || []).filter((tc) => !tc.isHidden).length;
    const userStatus = userSubmissionsMap[c._id.toString()];

    // Remove full test cases from list view
    delete c.testCases;

    return {
      ...c,
      totalTestCases: totalCases,
      sampleTestCases: sampleCases,
      userProgress: userStatus
        ? {
            isSolved: userStatus.latestStatus === 'Accepted' || userStatus.bestScore === 100,
            bestScore: userStatus.bestScore,
            status: userStatus.latestStatus,
            attempts: userStatus.submissionCount,
          }
        : null,
    };
  });

  return {
    challenges: sanitized,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
};

/**
 * Get single challenge details
 * SECURITY: Strips all hidden test cases for regular users
 */
export const getChallengeDetails = async (idOrSlug, userId = null, isInstructorOrAdmin = false) => {
  let challenge = null;
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    challenge = await CodingChallenge.findById(idOrSlug)
      .populate('skills', 'name slug category difficulty icon')
      .populate('createdBy', 'name email')
      .lean();
  }
  if (!challenge) {
    challenge = await CodingChallenge.findOne({ slug: idOrSlug.toLowerCase() })
      .populate('skills', 'name slug category difficulty icon')
      .populate('createdBy', 'name email')
      .lean();
  }

  if (!challenge) {
    throw new ErrorResponse('Coding challenge not found.', 404);
  }

  // Count total and hidden cases
  const totalCases = (challenge.testCases || []).length;
  const hiddenCount = (challenge.testCases || []).filter((tc) => tc.isHidden).length;

  // SECURITY: Never expose hidden test cases to regular users
  if (!isInstructorOrAdmin) {
    challenge.testCases = (challenge.testCases || []).filter((tc) => !tc.isHidden);
  }

  // Get user's latest submission if authenticated
  let userSubmission = null;
  if (userId) {
    userSubmission = await CodingSubmission.findOne({
      challenge: challenge._id,
      user: userId,
    })
      .sort({ submittedAt: -1 })
      .lean();
  }

  return {
    challenge: {
      ...challenge,
      stats: {
        totalTestCases: totalCases,
        sampleTestCases: totalCases - hiddenCount,
        hiddenTestCases: hiddenCount,
      },
    },
    userSubmission,
  };
};

/**
 * Run code against sample/public test cases only
 */
export const runChallengeCode = async ({ challengeId, language = 'javascript', sourceCode, customInput = null }) => {
  const challenge = await CodingChallenge.findById(challengeId);
  if (!challenge) {
    throw new ErrorResponse('Challenge not found.', 404);
  }

  let testCasesToRun = [];

  if (customInput) {
    testCasesToRun = [
      {
        input: customInput,
        expectedOutput: '',
        isHidden: false,
      },
    ];
  } else {
    // Only run visible sample test cases
    testCasesToRun = (challenge.testCases || []).filter((tc) => !tc.isHidden);
  }

  if (testCasesToRun.length === 0) {
    testCasesToRun = (challenge.testCases || []).slice(0, 2);
  }

  const result = await executeCode({
    language,
    sourceCode,
    testCases: testCasesToRun,
    timeLimit: challenge.timeLimit || 5000,
    memoryLimit: challenge.memoryLimit || 128,
  });

  return result;
};

/**
 * Submit code for full evaluation against all test cases (public + hidden)
 * Evaluates correctness, saves submission, and feeds skill evidence
 */
export const submitChallengeCode = async ({ challengeId, userId, language = 'javascript', sourceCode }) => {
  const challenge = await CodingChallenge.findById(challengeId);
  if (!challenge) {
    throw new ErrorResponse('Challenge not found.', 404);
  }

  if (!sourceCode || !sourceCode.trim()) {
    throw new ErrorResponse('Source code cannot be empty.', 400);
  }

  // Execute against all test cases in isolated environment
  const execution = await executeCode({
    language,
    sourceCode,
    testCases: challenge.testCases,
    timeLimit: challenge.timeLimit || 5000,
    memoryLimit: challenge.memoryLimit || 128,
  });

  // Mask hidden test case outputs in the stored payload and returned payload
  const sanitizedResults = (execution.testResults || []).map((tr) => {
    if (tr.isHidden) {
      return {
        testCaseIndex: tr.testCaseIndex,
        passed: tr.passed,
        actualOutput: '[Hidden Test Case]',
        expectedOutput: '[Hidden Test Case]',
        executionTime: tr.executionTime,
        error: tr.error ? 'Runtime Error in hidden test case' : '',
        isHidden: true,
      };
    }
    return tr;
  });

  // Create submission record with sanitized test results
  const submission = await CodingSubmission.create({
    challenge: challenge._id,
    user: userId,
    language,
    sourceCode,
    status: execution.status,
    passedTests: execution.passedTests,
    totalTests: execution.totalTests,
    executionTime: execution.executionTime,
    memoryUsed: execution.memoryUsed,
    score: execution.score,
    testResults: sanitizedResults,
  });

  // Ingest into Skill Tracking Engine if any points earned
  let skillUpdates = [];
  if (execution.score > 0 && Array.isArray(challenge.skills) && challenge.skills.length > 0) {
    const weightMap = {
      Easy: 0.8,
      Medium: 1.0,
      Hard: 1.3,
      Expert: 1.5,
    };
    const challengeWeight = weightMap[challenge.difficulty] || 1.0;

    for (const skillId of challenge.skills) {
      try {
        const progress = await recordSkillEvidence({
          userId,
          skillId,
          type: 'coding_challenge',
          title: `Coding Challenge: ${challenge.title}`,
          score: execution.score,
          maxScore: 100,
          weight: challengeWeight,
          referenceId: submission._id.toString(),
          trigger: 'challenge_evaluation',
        });
        skillUpdates.push({
          skillId,
          newScore: progress.overallScore,
          proficiencyLevel: progress.proficiencyLevel,
        });
      } catch (skillErr) {
        console.warn(`[Skill Evidence Ingestion Warning]:`, skillErr.message);
      }
    }
  }

  return {
    submissionId: submission._id,
    status: submission.status,
    score: submission.score,
    passedTests: submission.passedTests,
    totalTests: submission.totalTests,
    executionTime: submission.executionTime,
    memoryUsed: submission.memoryUsed,
    testResults: sanitizedResults,
    submittedAt: submission.submittedAt,
    skillUpdates,
  };
};

/**
 * Sanitizes a submission document to guarantee no hidden test cases leak
 */
const sanitizeSubmissionDoc = (sub) => {
  if (!sub) return sub;
  const doc = sub.toObject ? sub.toObject() : { ...sub };
  if (Array.isArray(doc.testResults)) {
    doc.testResults = doc.testResults.map((tr) => {
      if (tr.isHidden) {
        return {
          ...tr,
          actualOutput: '[Hidden Test Case]',
          expectedOutput: '[Hidden Test Case]',
          error: tr.error ? 'Runtime Error in hidden test case' : '',
        };
      }
      return tr;
    });
  }
  return doc;
};

/**
 * Get submissions for a challenge by a user
 */
export const getChallengeSubmissions = async (challengeId, userId) => {
  const submissions = await CodingSubmission.find({
    challenge: challengeId,
    user: userId,
  })
    .sort({ submittedAt: -1 })
    .lean();

  return submissions.map(sanitizeSubmissionDoc);
};

/**
 * Get all submissions by a user
 */
export const getMySubmissions = async (userId) => {
  const submissions = await CodingSubmission.find({ user: userId })
    .populate('challenge', 'title slug difficulty category')
    .sort({ submittedAt: -1 })
    .limit(50)
    .lean();

  return submissions.map(sanitizeSubmissionDoc);
};

/**
 * Create a new coding challenge (Instructor or Admin)
 */
export const createChallenge = async (data, creatorId) => {
  const {
    title,
    description,
    difficulty,
    category,
    supportedLanguages,
    starterCode,
    testCases,
    timeLimit,
    memoryLimit,
    skills,
    hints,
    isPublished,
  } = data;

  if (!title || !description || !testCases || testCases.length === 0) {
    throw new ErrorResponse('Title, description, and at least one test case are required.', 400);
  }

  const challenge = await CodingChallenge.create({
    title: title.trim(),
    description: description.trim(),
    difficulty: difficulty || 'Medium',
    category: category || 'Algorithms & Data Structures',
    supportedLanguages: supportedLanguages || ['javascript', 'python'],
    starterCode: starterCode || {
      javascript: 'function solution(input) {\n  // Write your code here\n  return input;\n}',
      python: 'def solution(input):\n    # Write your code here\n    return input\n',
    },
    testCases,
    timeLimit: timeLimit || 5000,
    memoryLimit: memoryLimit || 128,
    skills: skills || [],
    hints: hints || [],
    isPublished: isPublished !== undefined ? isPublished : true,
    createdBy: creatorId,
  });

  return challenge;
};

export default {
  getChallenges,
  getChallengeDetails,
  runChallengeCode,
  submitChallengeCode,
  getChallengeSubmissions,
  getMySubmissions,
  createChallenge,
};
