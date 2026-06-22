import { generateRoadmap } from '../agents/roadmap.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generate = asyncHandler(async (req, res) => {
  req.setTimeout(90000);

  const result = await generateRoadmap(req.user.id);

  res.status(200).json(result);
});
