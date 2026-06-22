import { Router } from 'express';
import auth from '../middleware/auth.js';
import { generate } from '../controllers/roadmapController.js';

const router = Router();

router.post('/generate', auth, generate);

export default router;
