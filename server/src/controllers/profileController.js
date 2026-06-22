import User from '../models/User.js';
import { embedAndStore } from '../agents/embeddings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const updateResume = asyncHandler(async (req, res) => {
  const { resume } = req.body;

  if (resume === undefined) {
    throw new ApiError(400, 'resume is required');
  }

  await User.findByIdAndUpdate(req.user.id, { resume });
  await embedAndStore(req.user.id, resume || '');

  res.status(200).json({ message: 'Resume saved and embeddings generated' });
});
