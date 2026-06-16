import mongoose from 'mongoose';

/**
 * @typedef {object} QuizResult
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user who took the quiz.
 * @property {string} topic - The topic of the quiz.
 * @property {number} score - The user's score.
 * @property {number} total - The total number of questions.
 * @property {Date} takenAt - The timestamp when the quiz was taken.
 */
const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
    default: 5,
  },
  takenAt: {
    type: Date,
    default: Date.now,
  },
});

QuizResultSchema.index({ userId: 1, takenAt: -1 });

export default mongoose.model('QuizResult', QuizResultSchema);
