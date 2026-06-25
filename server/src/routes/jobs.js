import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getAllJobs,
  createJob,
  getJob,
  updateJob,
  deleteJob,
  retryResearch,
} from '../controllers/jobsController.js';

const router = Router();

router.use(auth);

router.get('/', getAllJobs);
router.post('/', createJob);
router.get('/:id', getJob);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/research', retryResearch);

export default router;
