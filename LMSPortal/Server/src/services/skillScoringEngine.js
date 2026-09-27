/**
 * NOVA LMS — Skill Scoring Engine
 * 
 * Scalable, demonstrated-performance scoring engine.
 * Computes skill proficiency exclusively from demonstrated learner performance:
 * - Quizzes (Knowledge/Theory)
 * - Coding Challenges (Practical execution)
 * - Projects (Milestones/Capstones)
 * - Practical Assessments & Assignments (Evaluated assessments)
 */

export const SKILL_CONFIG = {
  // Configurable component weights
  weights: {
    knowledge: 0.25,
    practical: 0.30,
    project: 0.25,
    assessment: 0.20,
  },

  // Configurable proficiency level thresholds
  thresholds: {
    expert: 90,
    advanced: 75,
    intermediate: 50,
    beginner: 0,
  },

  // Confidence based on evidence count
  confidence: {
    high: 7,
    medium: 3,
  },

  // Significant delta threshold for trend detection
  trendDeltaThreshold: 3,
};

/**
 * Maps an evidence item to its scoring dimension
 * @param {string} evidenceType
 * @returns {'knowledge' | 'practical' | 'project' | 'assessment'}
 */
export const mapEvidenceTypeToDimension = (evidenceType) => {
  switch (evidenceType) {
    case 'quiz':
      return 'knowledge';
    case 'coding_challenge':
      return 'practical';
    case 'project':
    case 'job_simulation':
      return 'project';
    case 'practical_assessment':
    case 'assignment':
    default:
      return 'assessment';
  }
};

/**
 * Calculates proficiency level string based on configured thresholds
 * @param {number} score - Overall score from 0 to 100
 * @param {Object} [customThresholds]
 * @returns {'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'}
 */
export const calculateProficiencyLevel = (score, customThresholds = SKILL_CONFIG.thresholds) => {
  const rounded = Math.round(Number(score) || 0);
  if (rounded >= customThresholds.expert) return 'Expert';
  if (rounded >= customThresholds.advanced) return 'Advanced';
  if (rounded >= customThresholds.intermediate) return 'Intermediate';
  return 'Beginner';
};

/**
 * Calculates confidence level based on number of evidence items
 * @param {number} evidenceCount
 * @param {Object} [customConfidence]
 * @returns {'Low' | 'Medium' | 'High'}
 */
export const calculateConfidenceLevel = (evidenceCount, customConfidence = SKILL_CONFIG.confidence) => {
  const count = Number(evidenceCount) || 0;
  if (count >= customConfidence.high) return 'High';
  if (count >= customConfidence.medium) return 'Medium';
  return 'Low';
};

/**
 * Calculates trend compared to previous score
 * @param {number} currentScore
 * @param {number|null} previousScore
 * @param {number} [threshold]
 * @returns {'improving' | 'steady' | 'declining' | 'new'}
 */
export const calculateTrend = (
  currentScore,
  previousScore,
  threshold = SKILL_CONFIG.trendDeltaThreshold
) => {
  if (previousScore === null || previousScore === undefined) return 'new';
  const delta = currentScore - previousScore;
  if (delta >= threshold) return 'improving';
  if (delta <= -threshold) return 'declining';
  return 'steady';
};

/**
 * Pure calculation function: processes a list of evidence items and computes scores.
 * 
 * Supports dynamic proportional reweighting: if a learner has only some categories of evidence,
 * the active categories are proportionally reweighted so learners are evaluated accurately on
 * their demonstrated work without being penalized with zeros for unassigned work.
 * 
 * @param {Array<Object>} evidenceList - List of evidence objects
 * @param {Object} [options] - Optional custom config overrides
 * @returns {Object} Calculated metrics
 */
export const calculateSkillScore = (evidenceList = [], options = {}) => {
  const weights = { ...SKILL_CONFIG.weights, ...(options.weights || {}) };
  const thresholds = { ...SKILL_CONFIG.thresholds, ...(options.thresholds || {}) };

  if (!Array.isArray(evidenceList) || evidenceList.length === 0) {
    return {
      knowledgeScore: 0,
      practicalScore: 0,
      projectScore: 0,
      assessmentScore: 0,
      overallScore: 0,
      proficiencyLevel: 'Beginner',
      confidenceLevel: 'Low',
      evidenceCount: 0,
      dimensionBreakdown: {
        knowledge: { count: 0, score: 0 },
        practical: { count: 0, score: 0 },
        project: { count: 0, score: 0 },
        assessment: { count: 0, score: 0 },
      },
    };
  }

  // Bucket evidence items into dimensions
  const buckets = {
    knowledge: [],
    practical: [],
    project: [],
    assessment: [],
  };

  evidenceList.forEach((item) => {
    const dimension = mapEvidenceTypeToDimension(item.type);
    const percentage = Math.min(
      100,
      Math.max(
        0,
        item.percentage !== undefined
          ? Number(item.percentage)
          : item.maxScore > 0
          ? (Number(item.score) / Number(item.maxScore)) * 100
          : 0
      )
    );
    const weight = Number(item.weight) > 0 ? Number(item.weight) : 1.0;

    buckets[dimension].push({
      percentage,
      weight,
    });
  });

  // Calculate weighted average for each dimension
  const dimensionScores = {};
  const presentDimensions = [];

  ['knowledge', 'practical', 'project', 'assessment'].forEach((dim) => {
    const items = buckets[dim];
    if (items.length > 0) {
      const totalWeight = items.reduce((sum, it) => sum + it.weight, 0);
      const weightedSum = items.reduce((sum, it) => sum + it.percentage * it.weight, 0);
      const score = Math.round(weightedSum / totalWeight);
      dimensionScores[dim] = score;
      presentDimensions.push(dim);
    } else {
      dimensionScores[dim] = 0;
    }
  });

  // Dynamic proportional reweighting for overall score
  let overallScore = 0;
  if (presentDimensions.length > 0) {
    const totalPresentBaseWeight = presentDimensions.reduce(
      (sum, dim) => sum + weights[dim],
      0
    );

    if (totalPresentBaseWeight > 0) {
      const composite = presentDimensions.reduce((sum, dim) => {
        const proportionalWeight = weights[dim] / totalPresentBaseWeight;
        return sum + dimensionScores[dim] * proportionalWeight;
      }, 0);
      overallScore = Math.round(composite);
    }
  }

  const proficiencyLevel = calculateProficiencyLevel(overallScore, thresholds);
  const confidenceLevel = calculateConfidenceLevel(evidenceList.length);

  return {
    knowledgeScore: dimensionScores.knowledge,
    practicalScore: dimensionScores.practical,
    projectScore: dimensionScores.project,
    assessmentScore: dimensionScores.assessment,
    overallScore,
    proficiencyLevel,
    confidenceLevel,
    evidenceCount: evidenceList.length,
    dimensionBreakdown: {
      knowledge: { count: buckets.knowledge.length, score: dimensionScores.knowledge },
      practical: { count: buckets.practical.length, score: dimensionScores.practical },
      project: { count: buckets.project.length, score: dimensionScores.project },
      assessment: { count: buckets.assessment.length, score: dimensionScores.assessment },
    },
  };
};

export default {
  SKILL_CONFIG,
  mapEvidenceTypeToDimension,
  calculateProficiencyLevel,
  calculateConfidenceLevel,
  calculateTrend,
  calculateSkillScore,
};
