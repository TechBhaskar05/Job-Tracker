import { tailorResume } from '../agents/tailor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const tailor = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  if (!jobId) {
    throw new ApiError(400, 'jobId is required');
  }

  const result = await tailorResume(jobId, req.user.id);

  res.status(200).json(result);
});
