import CodingChallenge from '../../models/CodingChallenge.js';
import Course from '../../models/Course.js';
import Project from '../../models/Project.js';

/**
 * Deterministic Mentor Provider
 * Fallback engine running 100% locally against real DB telemetry when no external LLM API key is set.
 */
class DeterministicMentorProvider {
  async generateResponse({ userQuery, learnerContext, conversationHistory = [] }) {
    const query = userQuery.toLowerCase().trim();
    const {
      learner,
      targetRole,
      demonstratedSkills = [],
      weakSkills = [],
      activeCourses = [],
      assessmentResults = [],
      codingHistory = [],
      assignmentHistory = [],
      activeRecommendation,
    } = learnerContext || {};

    let responseContent = '';
    const structuredRecommendations = [];

    // INTENT 1: "Why am I weak in [Skill]?"
    const weakMatch = query.match(/(?:why am i weak in|weak in|my weakness in|struggling with|improve in)\s+([a-z0-9.#+ -]+)/i) ||
                      query.match(/(?:how to improve|help me with|learn)\s+([a-z0-9.#+ -]+)/i);

    if (weakMatch || query.includes('why am i weak') || query.includes('weak area')) {
      const searchedSkillName = weakMatch ? weakMatch[1].trim() : (weakSkills[0]?.skillName || 'your core skills');
      const skillRecord = demonstratedSkills.find(
        (s) => s.skillName.toLowerCase().includes(searchedSkillName.toLowerCase()) ||
               searchedSkillName.toLowerCase().includes(s.skillName.toLowerCase())
      ) || weakSkills[0];

      if (skillRecord) {
        const name = skillRecord.skillName;
        const overall = skillRecord.overallScore;
        const practical = skillRecord.scoresByDimension.practical;
        const knowledge = skillRecord.scoresByDimension.knowledge;
        const project = skillRecord.scoresByDimension.project;
        const evidenceCount = skillRecord.evidenceCount;

        const roleReq = targetRole?.skillGaps?.find((g) => g.name.toLowerCase() === name.toLowerCase()) ||
                        targetRole?.requiredSkills?.find((r) => r.skillName?.toLowerCase() === name.toLowerCase());
        const targetBenchmark = roleReq ? roleReq.requiredScore : 75;

        // Query real database items for the 4-step recommendation plan
        const [relatedChallenge, relatedProject, relatedCourse] = await Promise.all([
          CodingChallenge.findOne({
            title: { $regex: name, $options: 'i' },
            isPublished: true,
          }).select('title _id difficulty'),
          Project.findOne({
            title: { $regex: name, $options: 'i' },
            isPublished: true,
          }).select('title _id difficulty estimatedDuration'),
          Course.findOne({
            title: { $regex: name, $options: 'i' },
            isPublished: true,
          }).select('title _id level'),
        ]);

        responseContent = `Hello ${learner?.name || 'Learner'}, here is your exact factual performance breakdown for **${name}**:\n\n` +
          `• **Current Demonstrated Score:** ${overall}% (Target benchmark for ${targetRole?.name || 'your role'}: **${targetBenchmark}%**)\n` +
          `• **Practical Sandbox Coding:** ${practical}%\n` +
          `• **Theoretical Knowledge (Quizzes):** ${knowledge}%\n` +
          `• **Project Architecture:** ${project}%\n` +
          `• **Verified Submissions Recorded:** ${evidenceCount} assessment items\n\n` +
          `**Root Cause Diagnosis:**\n` +
          (evidenceCount === 0
            ? `You currently have 0 verified evidence items recorded for ${name}. Without hands-on laboratory submissions or quiz attempts, your verified competence cannot be calibrated.`
            : practical < 60
            ? `Your practical code execution score is ${practical}%, showing that while you may understand some theory, you are encountering test failures or incomplete test cases in hands-on laboratories.`
            : project < 50
            ? `Your project architecture score is ${project}%. You need end-to-end multi-file architecture evidence to satisfy ${targetRole?.name || 'target'} standards.`
            : `Your demonstrated score of ${overall}% is ${Math.max(0, targetBenchmark - overall)} points below the required threshold of ${targetBenchmark}%.`) +
          `\n\n---\n\n` +
          `### 🛠️ Structured Remediation Plan for ${name}:\n\n` +
          `1. **Concept Review**: Review the core architectural modules in ${relatedCourse ? `*${relatedCourse.title}*` : `your active course`} to solidify fundamentals.\n` +
          `2. **Practice**: Engage with targeted algorithmic problems in the Coding Lab to build muscle memory.\n` +
          `3. **Practical Task**: Build a working, production-grade implementation via ${relatedProject ? `*${relatedProject.title}*` : 'a capstone milestone'}.\n` +
          `4. **Reassessment**: Retake the laboratory evaluation to measure your updated proficiency score.`;

        structuredRecommendations.push(
          {
            type: 'concept_review',
            title: relatedCourse ? `Review: ${relatedCourse.title}` : `Review ${name} Foundations`,
            description: `Study core principles and design patterns.`,
            link: relatedCourse ? `/student/course/${relatedCourse._id}/learn` : '/student/my-courses',
            resourceType: 'course',
            resourceId: relatedCourse?._id?.toString() || '',
          },
          {
            type: 'practice',
            title: relatedChallenge ? `Coding Challenge: ${relatedChallenge.title}` : `Solve ${name} Practice Lab`,
            description: `Execute sandboxed test cases in the Coding Lab.`,
            link: relatedChallenge ? `/student/challenge/${relatedChallenge._id}` : '/student/challenges',
            resourceType: 'coding_challenge',
            resourceId: relatedChallenge?._id?.toString() || '',
          },
          {
            type: 'practical_task',
            title: relatedProject ? `Capstone: ${relatedProject.title}` : `Implement ${name} System Project`,
            description: `Submit verifiable repository code and production architecture.`,
            link: relatedProject ? `/student/projects/${relatedProject._id}` : '/student/projects',
            resourceType: 'project',
            resourceId: relatedProject?._id?.toString() || '',
          },
          {
            type: 'reassessment',
            title: `Reassessment: ${name} Benchmark Exam`,
            description: `Re-evaluate your skill score to record updated telemetry.`,
            link: '/student/quizzes',
            resourceType: 'quiz',
            resourceId: '',
          }
        );

        return { content: responseContent, structuredRecommendations };
      }
    }

    // INTENT 2: "What should I study next?"
    if (query.includes('what should i study next') || query.includes('next action') || query.includes('what next') || query.includes('recommendation')) {
      if (activeRecommendation) {
        responseContent = `Based on your live telemetry and target role (**${targetRole?.name || 'Full Stack Developer'}**), your top priority next action is:\n\n` +
          `### 🎯 ${activeRecommendation.title}\n\n` +
          `• **Priority Tier:** [${activeRecommendation.priority.toUpperCase()}]\n` +
          `• **Estimated Time:** ${activeRecommendation.estimatedDuration}\n` +
          `• **Focus Skill:** ${activeRecommendation.relatedSkill?.name || 'Core Engineering'}\n\n` +
          `**Why this is recommended:**\n` +
          `"${activeRecommendation.reason}"\n\n` +
          `Completing this task directly addresses your highest-priority competency gap and boosts your overall role readiness score (currently **${targetRole?.roleReadinessScore || 0}%**).`;

        structuredRecommendations.push({
          type: 'practical_task',
          title: activeRecommendation.title,
          description: activeRecommendation.reason,
          link: activeRecommendation.relatedResource?.actionUrl || '/student/challenges',
          resourceType: activeRecommendation.relatedResource?.type,
          resourceId: activeRecommendation.relatedResource?.id,
        });

        return { content: responseContent, structuredRecommendations };
      }
    }

    // INTENT 3: "Why did I fail this assessment?" / "Assessment results"
    if (query.includes('why did i fail') || query.includes('fail assessment') || query.includes('assessment result') || query.includes('quiz result') || query.includes('failed questions')) {
      const recentFailed = assessmentResults.find((a) => !a.passed || a.percentage < 60) || assessmentResults[0];

      if (recentFailed) {
        responseContent = `Here is the telemetry from your recent evaluation on **${recentFailed.quizTitle}**:\n\n` +
          `• **Earned Score:** ${recentFailed.score} points (${recentFailed.percentage}%)\n` +
          `• **Status:** ${recentFailed.passed ? 'Passed' : 'Needs Remediation (< 60% Passing Benchmark)'}\n` +
          `• **Attempted At:** ${new Date(recentFailed.attemptedAt).toLocaleDateString()}\n\n`;

        if (recentFailed.sampleFailedQuestions && recentFailed.sampleFailedQuestions.length > 0) {
          responseContent += `**Specific Concepts Where You Lost Points:**\n`;
          recentFailed.sampleFailedQuestions.forEach((fq, idx) => {
            responseContent += `${idx + 1}. *Question:* "${fq.question}"\n   *Analysis:* ${fq.explanation || 'Review the correct answer choices and architectural reasoning.'}\n\n`;
          });
        }

        responseContent += `**Remediation Steps:**\n` +
          `1. Re-read the corresponding lesson materials.\n` +
          `2. Attempt practice questions without time pressure.\n` +
          `3. Retake the quiz when you feel confident.`;

        structuredRecommendations.push({
          type: 'reassessment',
          title: `Retake: ${recentFailed.quizTitle}`,
          description: `Retake the assessment to recalibrate your knowledge score.`,
          link: '/student/quizzes',
          resourceType: 'quiz',
          resourceId: '',
        });

        return { content: responseContent, structuredRecommendations };
      } else {
        responseContent = `I inspected your assessment history: you currently have no failed quizzes on record! All your completed evaluations are in good standing. Keep up the high standards.`;
        return { content: responseContent, structuredRecommendations };
      }
    }

    // INTENT 4: "Give me practice for [Topic]" (e.g. SQL joins, async, React)
    const practiceMatch = query.match(/(?:practice for|give me practice for|exercises for|challenges for)\s+([a-z0-9.#+ -]+)/i);
    if (practiceMatch) {
      let topic = practiceMatch[1].replace(/[.?!,]+$/g, '').trim();
      const firstWord = topic.split(/\s+/)[0];

      let matchedChallenges = await CodingChallenge.find({
        $or: [
          { title: { $regex: topic, $options: 'i' } },
          { category: { $regex: topic, $options: 'i' } },
          { description: { $regex: topic, $options: 'i' } },
        ],
        isPublished: true,
      }).limit(2);

      if (matchedChallenges.length === 0 && firstWord && firstWord.length > 2) {
        matchedChallenges = await CodingChallenge.find({
          $or: [
            { title: { $regex: firstWord, $options: 'i' } },
            { category: { $regex: firstWord, $options: 'i' } },
            { description: { $regex: firstWord, $options: 'i' } },
          ],
          isPublished: true,
        }).limit(2);
      }

      if (matchedChallenges.length > 0) {
        responseContent = `I located real hands-on practice challenges for **${topic}** in your NOVA Coding Lab:\n\n`;
        matchedChallenges.forEach((ch, idx) => {
          responseContent += `### ${idx + 1}. [${ch.difficulty}] ${ch.title}\n` +
            `• **Category:** ${ch.category}\n` +
            `• **Execution Environment:** Sandboxed test-case harness\n\n`;

          structuredRecommendations.push({
            type: 'practice',
            title: ch.title,
            description: `${ch.difficulty} tier practice challenge in ${ch.category}.`,
            link: `/student/challenge/${ch._id}`,
            resourceType: 'coding_challenge',
            resourceId: ch._id.toString(),
          });
        });

        responseContent += `Click below to enter the live coding sandbox with automated test cases.`;
        return { content: responseContent, structuredRecommendations };
      } else {
        const anyChallenge = await CodingChallenge.findOne({ isPublished: true }).select('title _id difficulty category');
        responseContent = `I could not locate specific challenges matching "${topic}", but here is the top recommended laboratory to practice algorithmic programming:`;
        if (anyChallenge) {
          structuredRecommendations.push({
            type: 'practice',
            title: anyChallenge.title,
            description: `${anyChallenge.difficulty} challenge in ${anyChallenge.category}.`,
            link: `/student/challenge/${anyChallenge._id}`,
            resourceType: 'coding_challenge',
            resourceId: anyChallenge._id.toString(),
          });
        }
        return { content: responseContent, structuredRecommendations };
      }
    }

    // INTENT 5: "Explain this coding error"
    if (query.includes('coding error') || query.includes('explain error') || query.includes('why did my code fail') || query.includes('test failed')) {
      const recentFailedSubmission = codingHistory.find((c) => c.status !== 'Accepted') || codingHistory[0];

      if (recentFailedSubmission) {
        responseContent = `Here is the diagnostic report from your latest coding laboratory attempt on **${recentFailedSubmission.challengeTitle}**:\n\n` +
          `• **Status:** ${recentFailedSubmission.status}\n` +
          `• **Tests Passed:** ${recentFailedSubmission.passedTests || 0} / ${recentFailedSubmission.totalTests || 0}\n` +
          `• **Score:** ${recentFailedSubmission.score}%\n\n`;

        if (recentFailedSubmission.errorSnippet) {
          responseContent += `**Failure Trace / Test Case Output:**\n` +
            `\`\`\`text\n${recentFailedSubmission.errorSnippet}\n\`\`\`\n\n` +
            `**Debugging Guidance:**\n` +
            `1. **Edge Case Verification:** Double-check boundary inputs (empty arrays, negative integers, null/undefined properties).\n` +
            `2. **Return Type Invariant:** Verify that your function return type strictly matches the expected contract.\n` +
            `3. **Asynchronous Resolution:** If handling Promises or async pipelines, ensure all async operations are properly \`await\`ed.`;
        }

        structuredRecommendations.push({
          type: 'practice',
          title: `Debug Challenge: ${recentFailedSubmission.challengeTitle}`,
          description: `Resume the sandbox editor and resolve failing test assertions.`,
          link: '/student/challenges',
          resourceType: 'coding_challenge',
          resourceId: '',
        });

        return { content: responseContent, structuredRecommendations };
      }
    }

    // GENERAL INTENT: Context-Aware Engineering Guidance
    responseContent = `Hello ${learner?.name || 'Scholar'}. I am **NOVA AI Mentor**, your personal engineering advisor.\n\n` +
      `Here is a snapshot of your active academic telemetry:\n` +
      `• **Target Career Role:** ${targetRole?.name || 'Full Stack Developer'} (Role Readiness: **${targetRole?.roleReadinessScore || 0}%**)\n` +
      `• **Active Curricula:** ${activeCourses.map((c) => `${c.title} (${c.completionPercentage}%)`).join(', ') || 'None currently enrolled'}\n` +
      `• **Identified Competency Gaps:** ${targetRole?.skillGaps?.map((g) => `${g.name} (-${g.gapSize} pts)`).join(', ') || 'None - fully calibrated'}\n\n` +
      `You can ask me specific questions regarding your skill scores, assessment diagnostics, code errors, or personalized study plans:\n` +
      `• *"Why am I weak in ${weakSkills[0]?.skillName || 'Node.js'}?"*\n` +
      `• *"What should I study next?"*\n` +
      `• *"Why did I fail this assessment?"*\n` +
      `• *"Give me practice for SQL joins."*\n` +
      `• *"Explain this coding error."*`;

    return { content: responseContent, structuredRecommendations };
  }
}

/**
 * Universal AI Provider Service
 * Supports Google Gemini, OpenAI, Anthropic, or falls back seamlessly to DeterministicMentorProvider.
 */
export const executeAIMentorQuery = async ({ userQuery, learnerContext, conversationHistory = [] }) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // 1. If Gemini API Key is available
  if (geminiKey) {
    try {
      const response = await callGeminiProvider({
        apiKey: geminiKey,
        userQuery,
        learnerContext,
        conversationHistory,
      });
      return response;
    } catch (apiErr) {
      console.warn('[AI Mentor] Gemini API failed or timed out. Falling back to deterministic engine:', apiErr.message);
    }
  }

  // 2. If OpenAI API Key is available
  if (openAiKey) {
    try {
      const response = await callOpenAIProvider({
        apiKey: openAiKey,
        userQuery,
        learnerContext,
        conversationHistory,
      });
      return response;
    } catch (apiErr) {
      console.warn('[AI Mentor] OpenAI API failed. Falling back to deterministic engine:', apiErr.message);
    }
  }

  // 3. Deterministic Grounded Engine (Standard Zero-Config Fallback)
  const deterministicEngine = new DeterministicMentorProvider();
  return await deterministicEngine.generateResponse({
    userQuery,
    learnerContext,
    conversationHistory,
  });
};

/**
 * Google Gemini Provider Call
 */
async function callGeminiProvider({ apiKey, userQuery, learnerContext, conversationHistory }) {
  const systemInstruction = buildSystemPrompt(learnerContext);
  const contents = [];

  // Conversation history
  conversationHistory.slice(-6).forEach((msg) => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: userQuery }],
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseStructuredResponse(text, learnerContext);
}

/**
 * OpenAI Provider Call
 */
async function callOpenAIProvider({ apiKey, userQuery, learnerContext, conversationHistory }) {
  const systemPrompt = buildSystemPrompt(learnerContext);
  const messages = [{ role: 'system', content: systemPrompt }];

  conversationHistory.slice(-6).forEach((msg) => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  messages.push({ role: 'user', content: userQuery });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return parseStructuredResponse(text, learnerContext);
}

/**
 * Constructs strict system prompt injecting real learner DB telemetry
 */
function buildSystemPrompt(learnerContext) {
  return `You are NOVA AI Mentor, the expert engineering intelligence advisor embedded within NOVA LMS.
CRITICAL MANDATES:
1. Do NOT invent, assume, or hallucinate learner scores or curriculum.
2. Use ONLY the factual verified database context provided below.
3. For any discussion of weak areas or performance deficits, you MUST provide a structured 4-step roadmap:
   Step 1: Concept Review
   Step 2: Practice
   Step 3: Practical Task
   Step 4: Reassessment
4. Be concise, technical, encouraging, and actionable.

FACTUAL LEARNER DATABASE CONTEXT:
${JSON.stringify(learnerContext, null, 2)}`;
}

/**
 * Helper to extract recommendations and content
 */
function parseStructuredResponse(text, learnerContext) {
  return {
    content: text,
    structuredRecommendations: [],
  };
}
