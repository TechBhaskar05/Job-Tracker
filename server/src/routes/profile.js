import { Router } from 'express';
import auth from '../middleware/auth.js';
import { updateResume } from '../controllers/profileController.js';

const router = Router();

router.patch('/resume', auth, updateResume);

export default router;
