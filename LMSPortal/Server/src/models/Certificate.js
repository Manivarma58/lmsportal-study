import mongoose from 'mongoose';

const demonstratedSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    level: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      trim: true,
    },
    evidenceSummary: { type: String, default: '', trim: true },
    category: { type: String, default: 'Engineering', trim: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  },
  { _id: false }
);

const practicalProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    difficulty: { type: String, default: 'Intermediate', trim: true },
    repoUrl: { type: String, default: '', trim: true },
    deploymentUrl: { type: String, default: '', trim: true },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const codingAssessmentItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    category: { type: String, default: 'Algorithms', trim: true },
    passedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobSimulationItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, default: 'Software Engineer', trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const capstoneProjectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    score: { type: Number, default: 0, min: 0, max: 100 },
    difficulty: { type: String, default: 'Advanced', trim: true },
    repoUrl: { type: String, default: '', trim: true },
    deploymentUrl: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    certificateType: {
      type: String,
      enum: ['course_completion', 'proof_of_skill'],
      default: 'course_completion',
      index: true,
    },
    // Optional for proof-of-skill, required for course completion
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: function () {
        return this.certificateType === 'course_completion';
      },
      index: true,
    },
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      index: true,
      alias: 'certificateCode',
    },
    issueDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: String,
      default: 'Verified Skill Mastery',
      trim: true,
    },
    instructorName: {
      type: String,
      default: 'NOVA Academic & Industry Evaluation Board',
      trim: true,
    },

    // --- Proof-of-Skill Specific Verified Attributes ---
    learnerName: {
      type: String,
      default: '',
      trim: true,
    },
    roleOrSkillTitle: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    targetRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TargetRole',
    },
    demonstratedSkills: {
      type: [demonstratedSkillSchema],
      default: [],
    },
    skillLevels: {
      type: [
        {
          name: { type: String, trim: true },
          level: { type: String, trim: true },
          score: { type: Number, min: 0, max: 100 },
        },
      ],
      default: [],
    },
    practicalProjects: {
      type: [practicalProjectSchema],
      default: [],
    },
    codingAssessmentsCount: {
      type: Number,
      default: 0,
    },
    codingAssessments: {
      type: [codingAssessmentItemSchema],
      default: [],
    },
    jobSimulationsCount: {
      type: Number,
      default: 0,
    },
    jobSimulations: {
      type: [jobSimulationItemSchema],
      default: [],
    },
    capstoneProject: {
      type: capstoneProjectSchema,
      default: null,
    },
    verificationUrl: {
      type: String,
      default: '',
      trim: true,
    },
    merkleProof: {
      type: String,
      default: '',
      trim: true,
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['valid', 'revoked'],
      default: 'valid',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique compound index for course completion certificates (only when course is present)
certificateSchema.index(
  { student: 1, course: 1 },
  {
    unique: true,
    partialFilterExpression: { course: { $exists: true, $type: 'objectId' } },
  }
);

// Index for student proof-of-skill certificates
certificateSchema.index({ student: 1, roleOrSkillTitle: 1 });
certificateSchema.index({ student: 1, certificateType: 1 });

export default mongoose.model('Certificate', certificateSchema);
