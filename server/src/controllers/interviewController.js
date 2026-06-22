import { generateQuestion, evaluateAnswer } from '../agents/interview.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const question = asyncHandler(async (req, res) => {
  const { role, company, history } = req.body;

  if (!role || !company) {
    throw new ApiError(400, 'role and company are required');
  }

  const result = await generateQuestion(role, company, history || []);

  res.status(200).json({ question: result });
});

export const evaluate = asyncHandler(async (req, res) => {
  const { question, answer, role } = req.body;

  if (!question || !answer || !role) {
    throw new ApiError(400, 'question, answer, and role are required');
  }

  const feedback = await evaluateAnswer(question, answer, role);

  res.status(200).json({ feedback });
});
