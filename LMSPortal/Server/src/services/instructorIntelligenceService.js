import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Project from '../models/Project.js';
import ProjectSubmission from '../models/ProjectSubmission.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import CodingChallenge from '../models/CodingChallenge.js';
import CodingSubmission from '../models/CodingSubmission.js';
import LearnerSkillProgress from '../models/LearnerSkillProgress.js';
import AdaptiveIntervention from '../models/AdaptiveIntervention.js';
import JobSimulationSubmission from '../models/JobSimulationSubmission.js';

/**
 * Calculates Learning Intelligence for an Instructor
 * @param {Object} params
 * @param {string} params.instructorId - ID of authenticated instructor
 * @param {string} params.role - User role ('instructor' or 'admin')
 * @param {string} [params.courseId] - Optional course filter
 * @param {string} [params.skillId] - Optional skill filter
 * @param {string} [params.studentQuery] - Search term for student name/email
 * @param {string} [params.performanceFilter] - 'all' | 'high_risk' | 'needs_attention' | 'moderate_risk' | 'on_track' | 'high_performer'
 * @param {string} [params.dateFilter] - 'all' | '7d' | '30d' | '90d'
 */
export async function getInstructorLearningIntelligence({
  instructorId,
  role = 'instructor',
  courseId,
  skillId,
  studentQuery,
  performanceFilter = 'all',
  dateFilter = 'all',
}) {
  // 1. Identify Courses in Scope
  const courseQuery = role === 'admin' ? {} : { instructor: instructorId };
  if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
    courseQuery._id = new mongoose.Types.ObjectId(courseId);
  }
  const coursesInScope = await Course.find(courseQuery).select('_id title category thumbnail price isPublished published').lean();
  const courseIds = coursesInScope.map((c) => c._id);

  if (courseIds.length === 0) {
    return {
      summary: {
        totalStudents: 0,
        avgCourseProgress: 0,
        avgPracticalScore: 0,
        avgSkillScore: 0,
        avgAssessmentPassRate: 0,
        studentsAtRiskCount: 0,
        divergenceCount: 0,
      },
      students: [],
      divergenceAlerts: [],
      skillGapRisks: [],
      skillDistribution: [],
      mostDifficultSkills: [],
      mostFailedAssessments: [],
      recommendedInterventions: [],
      courses: [],
      skillsList: [],
    };
  }

  // 2. Date Threshold for submissions/attempts
  let dateThreshold = null;
  const now = new Date();
  if (dateFilter === '7d') {
    dateThreshold = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  } else if (dateFilter === '30d') {
    dateThreshold = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  } else if (dateFilter === '90d') {
    dateThreshold = new Date(now.getTime() - 90 * 24 * 3600 * 1000);
  }

  // 3. Fetch Enrollments in Scope
  const enrollmentQuery = { course: { $in: courseIds } };
  if (dateThreshold) {
    enrollmentQuery.createdAt = { $gte: dateThreshold };
  }
  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate('student', '_id name email avatar profileImage headline')
    .populate('course', '_id title category')
    .lean();

  // Distinct Student IDs
  const studentMap = {};
  for (const enr of enrollments) {
    if (!enr.student?._id) continue;
    const sId = enr.student._id.toString();
    if (!studentMap[sId]) {
      studentMap[sId] = {
        student: enr.student,
        enrollments: [],
      };
    }
    studentMap[sId].enrollments.push(enr);
  }

  const studentIds = Object.keys(studentMap).map((id) => new mongoose.Types.ObjectId(id));

  // 4. Fetch All Telemetry In Parallel (Assignments, Projects, Quizzes, Coding Challenges, Skills, Interventions)
  const [
    assignments,
    assignmentSubmissions,
    projects,
    projectSubmissions,
    quizzes,
    quizAttempts,
    codingSubmissions,
    jobSimSubmissions,
    learnerSkills,
    activeInterventions,
    allSkills,
  ] = await Promise.all([
    Assignment.find({ courseId: { $in: courseIds } }).select('_id title difficulty courseId').lean(),
    AssignmentSubmission.find({
      user: { $in: studentIds },
      ...(dateThreshold ? { submittedAt: { $gte: dateThreshold } } : {}),
    })
      .populate('assignment', 'title difficulty courseId')
      .lean(),
    Project.find({ courseId: { $in: courseIds } }).select('_id title difficulty courseId').lean(),
    ProjectSubmission.find({
      userId: { $in: studentIds },
      ...(dateThreshold ? { submittedAt: { $gte: dateThreshold } } : {}),
    })
      .populate('projectId', 'title difficulty courseId')
      .lean(),
    Quiz.find({ course: { $in: courseIds } }).select('_id title totalMarks passPercentage course').lean(),
    QuizAttempt.find({
      student: { $in: studentIds },
      course: { $in: courseIds },
      ...(dateThreshold ? { attemptedAt: { $gte: dateThreshold } } : {}),
    })
      .populate('quiz', 'title course totalMarks passPercentage')
      .lean(),
    CodingSubmission.find({
      user: { $in: studentIds },
      ...(dateThreshold ? { submittedAt: { $gte: dateThreshold } } : {}),
    })
      .populate('challenge', 'title difficulty category')
      .lean(),
    JobSimulationSubmission.find({
      user: { $in: studentIds },
      ...(dateThreshold ? { submittedAt: { $gte: dateThreshold } } : {}),
    }).lean(),
    LearnerSkillProgress.find({ user: { $in: studentIds } })
      .populate('skill', 'name slug category difficulty')
      .lean(),
    AdaptiveIntervention.find({
      user: { $in: studentIds },
      status: { $in: ['Active', 'Pending_Review'] },
    })
      .populate('skill', 'name slug')
      .lean(),
    Skill.find().select('_id name slug category difficulty').lean(),
  ]);

  // Index telemetry by student ID
  const studentData = {};
  for (const sId of Object.keys(studentMap)) {
    studentData[sId] = {
      student: studentMap[sId].student,
      enrollments: studentMap[sId].enrollments,
      assignmentSubmissions: [],
      projectSubmissions: [],
      quizAttempts: [],
      codingSubmissions: [],
      jobSimSubmissions: [],
      skills: [],
      activeInterventions: [],
    };
  }

  for (const as of assignmentSubmissions) {
    const sId = (as.user?._id || as.user)?.toString();
    if (studentData[sId]) studentData[sId].assignmentSubmissions.push(as);
  }

  for (const ps of projectSubmissions) {
    const sId = (ps.userId?._id || ps.userId)?.toString();
    if (studentData[sId]) studentData[sId].projectSubmissions.push(ps);
  }

  for (const qa of quizAttempts) {
    const sId = (qa.student?._id || qa.student)?.toString();
    if (studentData[sId]) studentData[sId].quizAttempts.push(qa);
  }

  for (const cs of codingSubmissions) {
    const sId = (cs.user?._id || cs.user)?.toString();
    if (studentData[sId]) studentData[sId].codingSubmissions.push(cs);
  }

  for (const js of jobSimSubmissions) {
    const sId = (js.user?._id || js.user)?.toString();
    if (studentData[sId]) studentData[sId].jobSimSubmissions.push(js);
  }

  for (const ls of learnerSkills) {
    const sId = (ls.user?._id || ls.user)?.toString();
    if (studentData[sId]) studentData[sId].skills.push(ls);
  }

  for (const ai of activeInterventions) {
    const sId = (ai.user?._id || ai.user)?.toString();
    if (studentData[sId]) studentData[sId].activeInterventions.push(ai);
  }

  // 5. Compute Detailed Student Analytics & Risk Status
  const computedStudents = [];
  const divergenceAlerts = [];
  const skillGapRisks = [];

  for (const sId of Object.keys(studentData)) {
    const data = studentData[sId];
    const { student, enrollments, assignmentSubmissions, projectSubmissions, quizAttempts, codingSubmissions, jobSimSubmissions, skills, activeInterventions } = data;

    // Course Progress
    const totalProg = enrollments.reduce((acc, e) => acc + (e.completionPercentage || 0), 0);
    const courseProgress = enrollments.length > 0 ? Math.round(totalProg / enrollments.length) : 0;

    // Practical Score Calculation (Assignments + Projects + Coding + Simulations + Skill Practical)
    const practicalComponents = [];
    assignmentSubmissions.forEach((a) => {
      if (typeof a.score === 'number' && !isNaN(a.score)) practicalComponents.push(a.score);
    });
    projectSubmissions.forEach((p) => {
      if (typeof p.score === 'number' && !isNaN(p.score)) practicalComponents.push(p.score);
    });
    codingSubmissions.forEach((c) => {
      if (typeof c.score === 'number' && !isNaN(c.score)) practicalComponents.push(c.score);
      else if (c.passed) practicalComponents.push(100);
      else if (c.passed === false) practicalComponents.push(40);
    });
    jobSimSubmissions.forEach((j) => {
      if (typeof j.overallScore === 'number' && !isNaN(j.overallScore)) practicalComponents.push(j.overallScore);
    });
    skills.forEach((s) => {
      if (typeof s.practicalScore === 'number' && s.practicalScore > 0) practicalComponents.push(s.practicalScore);
    });

    const practicalScore = practicalComponents.length > 0
      ? Math.round(practicalComponents.reduce((a, b) => a + b, 0) / practicalComponents.length)
      : 50; // Neutral baseline if no practical tasks yet

    // Skill Score Calculation
    const skillComponents = skills.map((s) => s.overallScore).filter((sc) => typeof sc === 'number' && !isNaN(sc));
    const skillScore = skillComponents.length > 0
      ? Math.round(skillComponents.reduce((a, b) => a + b, 0) / skillComponents.length)
      : Math.round(practicalScore * 0.9);

    // Assessment Performance
    const passedQuizzes = quizAttempts.filter((q) => q.passed || (q.percentage || 0) >= 70);
    const quizPassRate = quizAttempts.length > 0 ? Math.round((passedQuizzes.length / quizAttempts.length) * 100) : 100;
    const failedQuizCount = quizAttempts.filter((q) => q.passed === false || (q.percentage || 0) < 60).length;

    // Project Performance
    const evaluatedProjects = projectSubmissions.filter((p) => p.status === 'Evaluated' || typeof p.score === 'number');
    const avgProjectScore = evaluatedProjects.length > 0
      ? Math.round(evaluatedProjects.reduce((a, b) => a + (b.score || 0), 0) / evaluatedProjects.length)
      : null;

    // -------------------------------------------------------------
    // DATA-DRIVEN RISK STATUS CALCULATION
    // Example from Prompt:
    // Course progress: 85%, Practical performance: 48% -> Needs Attention (Curriculum Illusion)
    // -------------------------------------------------------------
    let riskStatus = 'On Track';
    let riskReason = 'Demonstrating balanced learning progress and consistent practical execution.';
    let riskBadge = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    let riskLevel = 1; // 1: Low/On Track, 2: Moderate, 3: Needs Attention, 4: High Risk / Divergence

    const isDivergent = (courseProgress >= 60 && practicalScore < 55) || (courseProgress >= 80 && practicalScore < 60);

    if (isDivergent) {
      riskStatus = 'High Risk';
      riskReason = `Curriculum Illusion Divergence: Course progress is ${courseProgress}%, but practical execution is only ${practicalScore}%.`;
      riskBadge = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      riskLevel = 4;
      divergenceAlerts.push({
        studentId: student._id,
        studentName: student.name,
        email: student.email,
        avatar: student.avatar || student.profileImage,
        courseProgress,
        practicalScore,
        gap: courseProgress - practicalScore,
        enrolledCourses: enrollments.map((e) => e.course?.title).filter(Boolean),
      });
    } else if (failedQuizCount >= 2 || practicalScore < 50 || skillScore < 50 || activeInterventions.length > 0) {
      riskStatus = 'Needs Attention';
      riskReason = failedQuizCount >= 2
        ? `Repeated assessment failures (${failedQuizCount} failed tests); foundational practical concepts not consolidating.`
        : activeInterventions.length > 0
        ? `Active Adaptive Remediation in progress for ${activeInterventions[0].skill?.name || 'core skill'}.`
        : `Practical score (${practicalScore}%) critically lagging below minimum threshold.`;
      riskBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      riskLevel = 3;
    } else if (practicalScore < 68 || skillScore < 65 || courseProgress < 30) {
      riskStatus = 'Moderate Risk';
      riskReason = `Moderate skill latency: practical execution score at ${practicalScore}%.`;
      riskBadge = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      riskLevel = 2;
    } else if (practicalScore >= 80 && skillScore >= 80) {
      riskStatus = 'High Performer';
      riskReason = `Exemplary practical mastery (${practicalScore}%) and sustained conceptual skill benchmark (${skillScore}%).`;
      riskBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      riskLevel = 0;
    }

    // Check for students at risk of skill gaps
    const weakSkills = skills.filter((s) => (s.overallScore || 0) < 65 || (s.practicalScore || 0) < 60);
    if (weakSkills.length > 0 || activeInterventions.length > 0) {
      skillGapRisks.push({
        studentId: student._id,
        studentName: student.name,
        email: student.email,
        weakSkills: weakSkills.map((s) => ({
          name: s.skill?.name || 'General Skill',
          score: s.overallScore,
          practical: s.practicalScore,
        })),
        activeInterventionsCount: activeInterventions.length,
      });
    }

    computedStudents.push({
      id: student._id,
      name: student.name || 'Anonymous Scholar',
      email: student.email,
      avatar: student.avatar || student.profileImage || '',
      headline: student.headline || 'NOVA Scholar',
      courseProgress,
      practicalScore,
      skillScore,
      quizPassRate,
      totalQuizzesAttempted: quizAttempts.length,
      failedQuizCount,
      avgProjectScore,
      riskStatus,
      riskReason,
      riskBadge,
      riskLevel,
      enrolledCourses: enrollments.map((e) => ({
        id: e.course?._id,
        title: e.course?.title,
        progress: e.completionPercentage || 0,
      })),
      skillsOverview: skills.map((s) => ({
        id: s.skill?._id,
        name: s.skill?.name,
        overall: s.overallScore,
        practical: s.practicalScore,
      })),
      activeInterventions: activeInterventions.map((ai) => ({
        id: ai._id,
        skillName: ai.skill?.name,
        stage: ai.currentStageIndex + 1,
        totalStages: ai.stages?.length || 4,
        severity: ai.severity,
      })),
    });
  }

  // 6. Apply In-Memory Student Filters
  let filteredStudents = computedStudents;

  if (studentQuery && studentQuery.trim()) {
    const q = studentQuery.toLowerCase().trim();
    filteredStudents = filteredStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }

  if (skillId && mongoose.Types.ObjectId.isValid(skillId)) {
    filteredStudents = filteredStudents.filter((s) =>
      s.skillsOverview.some((so) => so.id?.toString() === skillId)
    );
  }

  if (performanceFilter !== 'all') {
    if (performanceFilter === 'high_risk') {
      filteredStudents = filteredStudents.filter((s) => s.riskStatus === 'High Risk');
    } else if (performanceFilter === 'needs_attention') {
      filteredStudents = filteredStudents.filter((s) => s.riskStatus === 'Needs Attention' || s.riskStatus === 'High Risk');
    } else if (performanceFilter === 'moderate_risk') {
      filteredStudents = filteredStudents.filter((s) => s.riskStatus === 'Moderate Risk');
    } else if (performanceFilter === 'on_track') {
      filteredStudents = filteredStudents.filter((s) => s.riskStatus === 'On Track');
    } else if (performanceFilter === 'high_performer') {
      filteredStudents = filteredStudents.filter((s) => s.riskStatus === 'High Performer');
    }
  }

  // Sort: High Risk & Needs Attention first, then by practical score ascending
  filteredStudents.sort((a, b) => b.riskLevel - a.riskLevel || a.practicalScore - b.practicalScore);

  // 7. Aggregate Skill Distribution & Most Difficult Skills
  const skillAggregates = {};
  for (const s of learnerSkills) {
    if (!s.skill?._id) continue;
    const skId = s.skill._id.toString();
    if (!skillAggregates[skId]) {
      skillAggregates[skId] = {
        id: s.skill._id,
        name: s.skill.name,
        category: s.skill.category || 'Software Engineering',
        scores: [],
        practicalScores: [],
        noviceCount: 0,
        developingCount: 0,
        proficientCount: 0,
        masteredCount: 0,
      };
    }
    const score = s.overallScore || 0;
    skillAggregates[skId].scores.push(score);
    if (s.practicalScore) skillAggregates[skId].practicalScores.push(s.practicalScore);

    if (score >= 85) skillAggregates[skId].masteredCount++;
    else if (score >= 70) skillAggregates[skId].proficientCount++;
    else if (score >= 50) skillAggregates[skId].developingCount++;
    else skillAggregates[skId].noviceCount++;
  }

  const skillDistributionList = Object.values(skillAggregates).map((sk) => {
    const avgScore = sk.scores.length > 0 ? Math.round(sk.scores.reduce((a, b) => a + b, 0) / sk.scores.length) : 0;
    const avgPractical = sk.practicalScores.length > 0
      ? Math.round(sk.practicalScores.reduce((a, b) => a + b, 0) / sk.practicalScores.length)
      : avgScore;
    return {
      id: sk.id,
      name: sk.name,
      category: sk.category,
      avgScore,
      avgPractical,
      scholarCount: sk.scores.length,
      mastered: sk.masteredCount,
      proficient: sk.proficientCount,
      developing: sk.developingCount,
      novice: sk.noviceCount,
      strugglingPercentage: sk.scores.length > 0
        ? Math.round(((sk.noviceCount + sk.developingCount) / sk.scores.length) * 100)
        : 0,
    };
  });

  // Sort most difficult skills: lowest avg practical score and highest struggling %
  const mostDifficultSkills = [...skillDistributionList]
    .sort((a, b) => b.strugglingPercentage - a.strugglingPercentage || a.avgPractical - b.avgPractical)
    .slice(0, 5);

  // 8. Most Failed Assessments
  const assessmentFails = {};
  for (const qa of quizAttempts) {
    if (!qa.quiz?._id) continue;
    const qId = qa.quiz._id.toString();
    if (!assessmentFails[qId]) {
      assessmentFails[qId] = {
        id: qa.quiz._id,
        title: qa.quiz.title,
        type: 'Quiz / Practical Assessment',
        totalAttempts: 0,
        failedAttempts: 0,
        totalScores: 0,
      };
    }
    assessmentFails[qId].totalAttempts++;
    assessmentFails[qId].totalScores += (qa.percentage || 0);
    if (qa.passed === false || (qa.percentage || 0) < 60) {
      assessmentFails[qId].failedAttempts++;
    }
  }

  for (const as of assignmentSubmissions) {
    if (!as.assignment?._id) continue;
    const aId = as.assignment._id.toString();
    if (!assessmentFails[aId]) {
      assessmentFails[aId] = {
        id: as.assignment._id,
        title: as.assignment.title,
        type: 'Practical Assignment',
        totalAttempts: 0,
        failedAttempts: 0,
        totalScores: 0,
      };
    }
    assessmentFails[aId].totalAttempts++;
    assessmentFails[aId].totalScores += (as.score || 0);
    if (as.status === 'Failed' || (as.score !== null && as.score < 60)) {
      assessmentFails[aId].failedAttempts++;
    }
  }

  const mostFailedAssessments = Object.values(assessmentFails)
    .map((af) => {
      const failRate = af.totalAttempts > 0 ? Math.round((af.failedAttempts / af.totalAttempts) * 100) : 0;
      const avgScore = af.totalAttempts > 0 ? Math.round(af.totalScores / af.totalAttempts) : 0;
      return {
        ...af,
        failRate,
        avgScore,
      };
    })
    .sort((a, b) => b.failRate - a.failRate || b.failedAttempts - a.failedAttempts)
    .slice(0, 5);

  // 9. Recommended Instructor Interventions (Data-driven, explainable, actionable)
  const recommendedInterventions = [];

  // Intervention Rule 1: Divergence Alert (Curriculum Illusion)
  if (divergenceAlerts.length > 0) {
    const topDivergent = divergenceAlerts[0];
    recommendedInterventions.push({
      id: 'intervention-div-1',
      type: 'CURRICULUM_DIVERGENCE_ALERT',
      priority: 'CRITICAL',
      title: `Hands-On Lab Checkpoint for ${topDivergent.studentName}`,
      description: `Student achieved ${topDivergent.courseProgress}% lesson completion but practical assignment performance dropped to ${topDivergent.practicalScore}%.`,
      targetEntity: topDivergent.studentName,
      targetEmail: topDivergent.email,
      suggestedAction: 'Schedule a code review session or trigger Adaptive Remediation for practical exercises.',
      actionLabel: 'Assign Practical Review',
    });
  }

  // Intervention Rule 2: Difficult Skill Focus
  if (mostDifficultSkills.length > 0 && mostDifficultSkills[0].strugglingPercentage > 30) {
    const hardSkill = mostDifficultSkills[0];
    recommendedInterventions.push({
      id: 'intervention-skill-1',
      type: 'SKILL_WORKSHOP',
      priority: 'HIGH',
      title: `Conduct Targeted Workshop on ${hardSkill.name}`,
      description: `${hardSkill.strugglingPercentage}% of evaluated scholars are currently in Novice/Developing proficiency tiers (Class practical average: ${hardSkill.avgPractical}%).`,
      targetEntity: hardSkill.name,
      suggestedAction: 'Deploy a guided live-coding lab covering edge cases and common anti-patterns in this skill.',
      actionLabel: 'Create Practical Lab',
    });
  }

  // Intervention Rule 3: High Failure Assessment
  if (mostFailedAssessments.length > 0 && mostFailedAssessments[0].failRate >= 40) {
    const hardTest = mostFailedAssessments[0];
    recommendedInterventions.push({
      id: 'intervention-test-1',
      type: 'ASSESSMENT_CALIBRATION',
      priority: 'MEDIUM',
      title: `Review Rubric & Clarify Prerequisites for "${hardTest.title}"`,
      description: `Failure rate stands at ${hardTest.failRate}% across ${hardTest.totalAttempts} submissions with an average score of ${hardTest.avgScore}%.`,
      targetEntity: hardTest.title,
      suggestedAction: 'Inspect rubric criteria, clarify problem specifications, or provide diagnostic starter templates.',
      actionLabel: 'Calibrate Rubric',
    });
  }

  // Intervention Rule 4: Active Adaptive Intervention Monitoring
  const scholarsInAdaptive = computedStudents.filter((s) => s.activeInterventions.length > 0);
  if (scholarsInAdaptive.length > 0) {
    recommendedInterventions.push({
      id: 'intervention-adaptive-1',
      type: 'ADAPTIVE_SUPERVISION',
      priority: 'MEDIUM',
      title: `Monitor ${scholarsInAdaptive.length} Active Adaptive Learning Ladders`,
      description: `${scholarsInAdaptive.map((s) => s.name).join(', ')} currently progressing through progressive remediation ladders.`,
      targetEntity: 'Adaptive Remediation Cohort',
      suggestedAction: 'Review stage completions and verify real-world project task submissions before graduation.',
      actionLabel: 'View Active Ladders',
    });
  }

  // 10. Cohort Aggregates Summary
  const totalStudents = computedStudents.length;
  const avgCourseProgress = totalStudents > 0
    ? Math.round(computedStudents.reduce((a, b) => a + b.courseProgress, 0) / totalStudents)
    : 0;
  const avgPracticalScore = totalStudents > 0
    ? Math.round(computedStudents.reduce((a, b) => a + b.practicalScore, 0) / totalStudents)
    : 0;
  const avgSkillScore = totalStudents > 0
    ? Math.round(computedStudents.reduce((a, b) => a + b.skillScore, 0) / totalStudents)
    : 0;
  const totalQuizzes = quizAttempts.length;
  const avgAssessmentPassRate = totalQuizzes > 0
    ? Math.round((quizAttempts.filter((q) => q.passed || (q.percentage || 0) >= 70).length / totalQuizzes) * 100)
    : 85;

  const studentsAtRiskCount = computedStudents.filter(
    (s) => s.riskStatus === 'High Risk' || s.riskStatus === 'Needs Attention'
  ).length;

  return {
    summary: {
      totalStudents,
      avgCourseProgress,
      avgPracticalScore,
      avgSkillScore,
      avgAssessmentPassRate,
      studentsAtRiskCount,
      divergenceCount: divergenceAlerts.length,
      practicalBreakdown: {
        high: computedStudents.filter((s) => s.practicalScore >= 80).length,
        moderate: computedStudents.filter((s) => s.practicalScore >= 60 && s.practicalScore < 80).length,
        low: computedStudents.filter((s) => s.practicalScore < 60).length,
      },
    },
    students: filteredStudents,
    divergenceAlerts,
    skillGapRisks,
    skillDistribution: skillDistributionList,
    mostDifficultSkills,
    mostFailedAssessments,
    recommendedInterventions,
    courses: coursesInScope.map((c) => ({
      id: c._id,
      title: c.title,
      category: c.category,
    })),
    skillsList: allSkills.map((s) => ({
      id: s._id,
      name: s.name,
      category: s.category,
    })),
  };
}
