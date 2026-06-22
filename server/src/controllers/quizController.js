import QuizResult from '../models/QuizResult.js';
import { generateQuiz } from '../agents/quiz.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const generate = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string') {
    throw new ApiError(400, 'topic is required');
  }

  const questions = await generateQuiz(topic);

  res.status(200).json({ questions });
});

export const save = asyncHandler(async (req, res) => {
  const { topic, score, total } = req.body;

  if (!topic || score == null || total == null) {
    throw new ApiError(400, 'topic, score, and total are required');
  }

  const result = await QuizResult.create({ userId: req.user.id, topic, score, total });

  res.status(201).json({ result });
});

export const history = asyncHandler(async (req, res) => {
  const quizHistory = await QuizResult.find({ userId: req.user.id })
    .sort({ takenAt: -1 })
    .limit(20)
    .lean();

  res.status(200).json({ history: quizHistory });
});
