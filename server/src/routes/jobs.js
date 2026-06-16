import { Router } from 'express';
import auth from '../middleware/auth.js';
import Job from '../models/Job.js';
import { researchCompany } from '../agents/research.js';

const router = Router();

// All routes in this file are protected
router.use(auth);

/**
 * GET /api/jobs
 * Get all job applications for the logged-in user
 */
router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.find({ userId: req.user.id })
      .sort({ appliedAt: -1 })
      .lean();
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/jobs
 * Create a new job application
 */
router.post('/', async (req, res, next) => {
  const { role, company } = req.body;

  if (!role || !company) {
    return res.status(400).json({ error: 'Role and company are required fields' });
  }

  try {
    const newJob = new Job({
      ...req.body,
      userId: req.user.id,
    });

    const savedJob = await newJob.save();

    // Fire-and-forget company research
    researchCompany(savedJob);

    res.status(201).json(savedJob);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/:id
 * Get a single job application by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/jobs/:id
 * Update a job application
 */
router.patch('/:id', async (req, res, next) => {
  const { role, company, jobDesc, stage, url, notes } = req.body;
  const allowedUpdates = { role, company, jobDesc, stage, url, notes };

  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to edit it' });
    }

    // Handle stage history
    if (stage && job.stage !== stage) {
      job.stageHistory.push({
        fromStage: job.stage,
        toStage: stage,
        changedAt: new Date(),
      });
    }
    
    // Apply updates
    Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] !== undefined) {
            job[key] = allowedUpdates[key];
        }
    });

    const updatedJob = await job.save();

    res.status(200).json(updatedJob);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job application
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Job.deleteOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to delete it' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;

