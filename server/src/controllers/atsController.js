import { analyseResume } from '../agents/ats.js';
import Job from '../models/Job.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const analyse = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a PDF resume');
  }

  if (!req.body.jobDesc) {
    throw new ApiError(400, 'Job description is required');
  }

  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse(new Uint8Array(req.file.buffer));
  await parser.load();
  const { text: resumeText } = await parser.getText();

  if (resumeText.trim().length < 50) {
    throw new ApiError(400, 'Could not extract text from PDF');
  }

  const result = await analyseResume(resumeText, req.body.jobDesc);

  if (req.body.jobId) {
    await Job.findOneAndUpdate(
      { _id: req.body.jobId, userId: req.user.id },
      { atsScore: result.score }
    );
  }

  res.status(200).json(result);
});
