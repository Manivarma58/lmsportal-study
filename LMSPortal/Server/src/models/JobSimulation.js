import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    format: {
      type: String,
      enum: ['csv', 'json', 'sql', 'log', 'markdown', 'txt'],
      default: 'json',
    },
    urlOrContent: { type: String }, // Raw data or link
    sampleData: { type: mongoose.Schema.Types.Mixed }, // Structured sample preview
    downloadUrl: { type: String },
    columns: [
      {
        name: { type: String },
        type: { type: String },
        description: { type: String },
      },
    ],
  },
  { _id: true }
);

const validationRuleSchema = new mongoose.Schema(
  {
    ruleType: {
      type: String,
      enum: [
        'contains_keyword',
        'regex',
        'min_length',
        'json_valid',
        'sql_select',
        'not_empty',
      ],
      default: 'not_empty',
    },
    expected: { type: String },
    message: { type: String },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    taskNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    deliverableType: {
      type: String,
      enum: ['code', 'sql', 'dataset', 'text', 'file', 'report', 'json'],
      default: 'code',
    },
    starterTemplate: { type: String, default: '' },
    placeholderText: { type: String, default: '' },
    rubricHint: { type: String, default: '' },
    weight: { type: Number, default: 1, min: 0.1 },
    maxScore: { type: Number, default: 20, min: 1 },
    validationRules: [validationRuleSchema],
  },
  { _id: true }
);

const evaluationCriterionSchema = new mongoose.Schema(
  {
    criterion: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    maxScore: { type: Number, default: 25, min: 1 },
    weight: { type: Number, default: 1, min: 0.1 },
  },
  { _id: true }
);

const jobSimulationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job simulation title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Target professional role is required'],
      trim: true,
      // e.g. "Junior Data Analyst", "Junior Backend Engineer", "SQL Analytics Specialist"
    },
    companyScenario: {
      companyName: { type: String, required: true, trim: true },
      industry: { type: String, default: 'Tech & E-Commerce' },
      context: { type: String, required: true }, // The backstory and business challenge
      stakes: { type: String, default: 'High production impact' }, // What happens if this fails / succeeds
      mentorPersona: {
        name: { type: String, default: 'Alex Mercer' },
        role: { type: String, default: 'Lead Engineering Manager' },
        avatar: { type: String, default: '💼' },
        welcomeMessage: { type: String, default: 'Welcome to the team! Here is your onboarding ticket.' },
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    estimatedTime: {
      type: String,
      default: '90 mins',
    },
    simulationType: {
      type: String,
      enum: [
        'Data Analysis',
        'Software Development',
        'SQL',
        'Debugging',
        'API Development',
        'Business Case',
      ],
      required: [true, 'Simulation type is required'],
    },
    requiredSkills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        skillName: { type: String, required: true },
        minProficiency: { type: Number, default: 50 },
      },
    ],
    datasets: [datasetSchema],
    tasks: [taskSchema],
    evaluationCriteria: [evaluationCriterionSchema],
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published',
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    completedCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

jobSimulationSchema.index({ role: 1 });
jobSimulationSchema.index({ simulationType: 1 });
jobSimulationSchema.index({ difficulty: 1 });

const JobSimulation =
  mongoose.models.JobSimulation ||
  mongoose.model('JobSimulation', jobSimulationSchema);

export default JobSimulation;
