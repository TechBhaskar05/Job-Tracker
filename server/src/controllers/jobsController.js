import Job from '../models/Job.js';
import { researchCompany } from '../agents/research.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ userId: req.user.id })
    .sort({ appliedAt: -1 })
    .lean();

  res.status(200).json(jobs);
});

export const createJob = asyncHandler(async (req, res) => {
  const { role, company } = req.body;

  if (!role || !company) {
    throw new ApiError(400, 'Role and company are required fields');
  }

  const newJob = new Job({ ...req.body, userId: req.user.id });
  const savedJob = await newJob.save();

  researchCompany(savedJob);

  res.status(201).json(savedJob);
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).lean();

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  res.status(200).json(job);
});

export const updateJob = asyncHandler(async (req, res) => {
  const { role, company, jobDesc, stage, url, notes } = req.body;
  const allowedUpdates = { role, company, jobDesc, stage, url, notes };

  const job = await Job.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!job) {
    throw new ApiError(404, 'Job not found or you do not have permission to edit it');
  }

  if (stage && job.stage !== stage) {
    job.stageHistory.push({
      fromStage: job.stage,
      toStage: stage,
      changedAt: new Date(),
    });
  }

  Object.keys(allowedUpdates).forEach(key => {
    if (allowedUpdates[key] !== undefined) {
      job[key] = allowedUpdates[key];
    }
  });

  const updatedJob = await job.save();

  res.status(200).json(updatedJob);
});

export const retryResearch = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  await Job.findByIdAndUpdate(job._id, {
    companyInfo: { summary: '', culture: '', news: '', fetchedAt: null },
  });

  researchCompany(job);

  res.status(200).json({ message: 'Research triggered' });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const result = await Job.deleteOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'Job not found or you do not have permission to delete it');
  }

  res.status(200).json({ message: 'Job deleted successfully' });
});
