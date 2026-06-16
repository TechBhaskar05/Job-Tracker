import mongoose from 'mongoose';

const companyInfoSchema = new mongoose.Schema({
    summary: { type: String, default: '' },
    culture: { type: String, default: '' },
    news: { type: String, default: '' },
    fetchedAt: { type: Date, default: null }
}, { _id: false });

const stageHistorySchema = new mongoose.Schema({
    fromStage: { type: String },
    toStage: { type: String },
    changedAt: { type: Date, default: Date.now }
}, { _id: false });

/**
 * @typedef {object} Job
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user who owns this job application.
 * @property {string} role - The job title or role.
 * @property {string} company - The company name.
 * @property {string} [jobDesc] - The job description.
 * @property {string} stage - The current stage of the application.
 * @property {string} [url] - The URL of the job posting.
 * @property {string} [notes] - User's notes about the job.
 * @property {string} [tailoredResume] - The tailored resume text for this application.
 * @property {number} [atsScore] - The Applicant Tracking System (ATS) score.
 * @property {boolean} roadmapGenerated - Whether an interview prep roadmap has been generated.
 * @property {object} [companyInfo] - AI-generated information about the company.
 * @property {string} [companyInfo.summary] - A summary of the company.
 * @property {string} [companyInfo.culture] - Information about the company's culture.
 * @property {string} [companyInfo.news] - Recent news about the company.
 * @property {Date} [companyInfo.fetchedAt] - When the company info was fetched.
 * @property {Array<object>} [stageHistory] - A history of stage changes for the application.
 * @property {string} [stageHistory.fromStage] - The previous stage.
 * @property {string} [stageHistory.toStage] - The new stage.
 * @property {Date} [stageHistory.changedAt] - The date of the stage change.
 * @property {Date} appliedAt - The date the application was submitted.
 * @property {Date} createdAt - The timestamp when the job was created.
 * @property {Date} updatedAt - The timestamp when the job was last updated.
 */
const JobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    role: {
        type: String,
        required: [true, 'Please provide a role'],
        trim: true,
    },
    company: {
        type: String,
        required: [true, 'Please provide a company name'],
        trim: true,
    },
    jobDesc: {
        type: String,
        default: '',
    },
    stage: {
        type: String,
        enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'],
        default: 'APPLIED',
    },
    url: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    tailoredResume: {
        type: String,
        default: '',
    },
    atsScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
    },
    roadmapGenerated: {
        type: Boolean,
        default: false,
    },
    companyInfo: {
        type: companyInfoSchema,
        default: () => ({})
    },
    stageHistory: [stageHistorySchema],
    appliedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

JobSchema.index({ userId: 1, appliedAt: -1 });
JobSchema.index({ userId: 1, stage: 1 });

export default mongoose.model('Job', JobSchema);
