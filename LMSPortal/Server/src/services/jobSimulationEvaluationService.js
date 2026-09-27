import JobSimulation from '../models/JobSimulation.js';
import JobSimulationSubmission from '../models/JobSimulationSubmission.js';
import { recordSkillEvidence } from './skillService.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * Objective, rubric-based evaluator for Job Simulation submissions.
 * Analyzes deliverables against task criteria and validation rules.
 */
export const evaluateSubmission = async (submissionId, evaluatorId = null) => {
  const submission = await JobSimulationSubmission.findById(submissionId).populate('simulation');
  if (!submission) {
    throw new ErrorResponse('Simulation submission not found', 404);
  }

  const simulation = submission.simulation;
  const tasks = simulation.tasks || [];
  const criteria = simulation.evaluationCriteria || [];

  const taskProgressMap = new Map();
  submission.taskProgress.forEach((tp) => {
    taskProgressMap.set(tp.taskId, tp);
  });

  // 1. Evaluate individual tasks against their validation rules and deliverable quality
  let totalTaskPointsEarned = 0;
  let totalTaskPointsPossible = 0;

  const taskResults = tasks.map((task) => {
    const userTask = taskProgressMap.get(task.id) || { content: '', status: 'Not Started' };
    const content = (userTask.content || '').trim();
    const maxPoints = task.maxScore || 20;
    totalTaskPointsPossible += maxPoints;

    let points = 0;
    const ruleFeedback = [];

    if (!content) {
      points = 0;
      ruleFeedback.push('No deliverable submitted for this milestone.');
    } else {
      // Baseline points for non-empty deliverable
      points += maxPoints * 0.4;

      // Check validation rules if present
      if (task.validationRules && task.validationRules.length > 0) {
        let rulesPassed = 0;
        task.validationRules.forEach((rule) => {
          let passed = false;
          const expected = (rule.expected || '').toLowerCase();
          const contentLower = content.toLowerCase();

          switch (rule.ruleType) {
            case 'contains_keyword':
              passed = contentLower.includes(expected);
              break;
            case 'regex':
              try {
                const reg = new RegExp(rule.expected, 'i');
                passed = reg.test(content);
              } catch {
                passed = contentLower.includes(expected);
              }
              break;
            case 'min_length':
              passed = content.length >= (parseInt(rule.expected, 10) || 50);
              break;
            case 'json_valid':
              try {
                JSON.parse(content);
                passed = true;
              } catch {
                passed = false;
              }
              break;
            case 'sql_select':
              passed = contentLower.includes('select') && contentLower.includes('from');
              break;
            case 'not_empty':
            default:
              passed = content.length > 20;
              break;
          }

          if (passed) {
            rulesPassed++;
          } else {
            ruleFeedback.push(rule.message || `Validation criteria unmet: ${rule.ruleType}`);
          }
        });

        const ruleFraction = rulesPassed / task.validationRules.length;
        points += maxPoints * 0.6 * ruleFraction;
      } else {
        // Quality heuristic based on structure and length
        if (content.length > 100) points += maxPoints * 0.3;
        if (content.length > 300) points += maxPoints * 0.3;
      }
    }

    const earned = Math.min(maxPoints, Math.round(points));
    totalTaskPointsEarned += earned;

    // Update in submission taskProgress
    const existingIndex = submission.taskProgress.findIndex((tp) => tp.taskId === task.id);
    if (existingIndex >= 0) {
      submission.taskProgress[existingIndex].taskScore = earned;
      submission.taskProgress[existingIndex].status = earned > 0 ? 'Completed' : 'In Progress';
      submission.taskProgress[existingIndex].taskFeedback = ruleFeedback.length > 0
        ? ruleFeedback.join('; ')
        : 'Deliverable satisfied all milestone specification checks.';
    }

    return {
      taskId: task.id,
      title: task.title,
      score: earned,
      maxScore: maxPoints,
      feedback: ruleFeedback,
    };
  });

  // Task execution ratio (0 - 1)
  const taskExecutionRatio = totalTaskPointsPossible > 0
    ? totalTaskPointsEarned / totalTaskPointsPossible
    : 0;

  // 2. Evaluate against Configurable Evaluation Criteria
  let totalCriterionWeight = 0;
  let weightedCriterionScore = 0;

  const criteriaScores = criteria.map((crit) => {
    const weight = crit.weight || 1;
    totalCriterionWeight += weight;
    const maxScore = crit.maxScore || 25;

    // Base score determined by technical task completeness
    let critRatio = taskExecutionRatio;

    // Additional credit for executive summary quality
    const execSummary = (submission.finalExecutiveSummary || '').trim();
    if (crit.criterion.toLowerCase().includes('summary') || crit.criterion.toLowerCase().includes('communication') || crit.criterion.toLowerCase().includes('business')) {
      if (execSummary.length > 150) critRatio = Math.min(1.0, critRatio + 0.15);
      if (execSummary.length < 40) critRatio = Math.max(0.2, critRatio - 0.2);
    }

    const earnedScore = Math.min(maxScore, Math.max(0, Math.round(maxScore * critRatio)));
    weightedCriterionScore += (earnedScore / maxScore) * 100 * weight;

    let critFeedback = '';
    const percentage = Math.round((earnedScore / maxScore) * 100);
    if (percentage >= 85) {
      critFeedback = `Outstanding execution. Demonstrated deep competence in ${crit.criterion.toLowerCase()} aligned with enterprise industry standards.`;
    } else if (percentage >= 65) {
      critFeedback = `Solid baseline in ${crit.criterion.toLowerCase()}. Covers key operational requirements with room for deeper optimization and thoroughness.`;
    } else {
      critFeedback = `Needs development. Several core deliverables for ${crit.criterion.toLowerCase()} were incomplete or missed essential verification checks.`;
    }

    return {
      criterion: crit.criterion,
      score: earnedScore,
      maxScore,
      weight,
      feedback: critFeedback,
    };
  });

  const finalOverallScore = totalCriterionWeight > 0
    ? Math.round(weightedCriterionScore / totalCriterionWeight)
    : Math.round(taskExecutionRatio * 100);

  const passed = finalOverallScore >= 60;

  // 3. Generate strengths & areas for improvement
  const strengths = [];
  const areasForImprovement = [];

  criteriaScores.forEach((cs) => {
    const pct = (cs.score / cs.maxScore) * 100;
    if (pct >= 75) {
      strengths.push(`${cs.criterion}: Strong execution (${Math.round(pct)}%)`);
    } else {
      areasForImprovement.push(`${cs.criterion}: Opportunity to deepen rigor (${Math.round(pct)}%)`);
    }
  });

  if (submission.finalExecutiveSummary && submission.finalExecutiveSummary.length > 100) {
    strengths.push('Professional documentation and executive stakeholder synthesis');
  } else {
    areasForImprovement.push('Provide a more comprehensive final executive summary for business stakeholders');
  }

  // General synthesis feedback
  let generalFeedback = '';
  if (finalOverallScore >= 85) {
    generalFeedback = `Exceptional performance in the role of ${simulation.role} at ${simulation.companyScenario.companyName}. You demonstrated production-ready engineering capabilities, systematic troubleshooting, and high-impact business communication.`;
  } else if (finalOverallScore >= 70) {
    generalFeedback = `Competent workplace performance. You successfully addressed the primary technical milestones for ${simulation.companyScenario.companyName}. Review the itemized feedback below to refine your edge-case handling and technical depth.`;
  } else {
    generalFeedback = `Partial completion of the simulation. While several foundations were attempted, the business deliverables require deeper verification, full task implementations, and structured stakeholder reporting.`;
  }

  // 4. Save evaluation back to submission
  submission.status = 'Evaluated';
  submission.evaluatedAt = new Date();
  if (evaluatorId) {
    submission.evaluation.evaluatedBy = evaluatorId;
    submission.evaluation.isAutomatedRubric = false;
  } else {
    submission.evaluation.isAutomatedRubric = true;
  }
  submission.evaluation.criteriaScores = criteriaScores;
  submission.evaluation.overallScore = finalOverallScore;
  submission.evaluation.passed = passed;
  submission.evaluation.generalFeedback = generalFeedback;
  submission.evaluation.strengths = strengths;
  submission.evaluation.areasForImprovement = areasForImprovement;

  await submission.save();

  // 5. Update Simulation aggregate stats
  const allEvaluated = await JobSimulationSubmission.find({
    simulation: simulation._id,
    status: 'Evaluated',
  });
  if (allEvaluated.length > 0) {
    const avg = Math.round(
      allEvaluated.reduce((sum, s) => sum + s.evaluation.overallScore, 0) / allEvaluated.length
    );
    simulation.averageScore = avg;
    simulation.completedCount = allEvaluated.length;
    await simulation.save();
  }

  // 6. FEED SIMULATION RESULTS INTO SKILL ENGINE!
  // Send verified evidence for each required skill defined in the simulation
  const skillUpdateResults = [];
  if (simulation.requiredSkills && simulation.requiredSkills.length > 0) {
    for (const reqSkill of simulation.requiredSkills) {
      if (reqSkill.skill) {
        try {
          const evidenceRecord = await recordSkillEvidence({
            userId: submission.user,
            skillId: reqSkill.skill,
            type: 'job_simulation',
            title: `Job Simulation: ${simulation.title} (${simulation.role})`,
            score: finalOverallScore,
            maxScore: 100,
            weight: 2.0, // High weight for real-world workplace simulations
            referenceId: String(submission._id),
            trigger: 'job_simulation_completion',
          });
          skillUpdateResults.push({
            skillId: reqSkill.skill,
            skillName: reqSkill.skillName,
            updatedOverallScore: evidenceRecord.overallScore,
            proficiencyLevel: evidenceRecord.proficiencyLevel,
          });
        } catch (err) {
          console.warn(`[JobSimulation] Could not feed skill evidence for ${reqSkill.skillName}:`, err.message);
        }
      }
    }
  }

  // 7. Dispatch in-app notification
  try {
    await createNotification({
      recipient: submission.user,
      type: 'achievement',
      title: `Job Simulation Evaluated: ${simulation.title}`,
      message: `Your workplace simulation for "${simulation.role}" at ${simulation.companyScenario.companyName} scored ${finalOverallScore}% (${passed ? 'PASSED' : 'NEEDS REVISION'}). Demonstrated skills have been updated.`,
      link: `/student/simulations/${simulation.slug}`,
    });
  } catch (err) {
    // Non-blocking notification failure
  }

  return {
    submission,
    finalOverallScore,
    passed,
    criteriaScores,
    skillUpdateResults,
  };
};
