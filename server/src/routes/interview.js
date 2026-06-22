import { Router } from 'express';
import auth from '../middleware/auth.js';
import { question, evaluate } from '../controllers/interviewController.js';

const router = Router();

router.post('/question', auth, question);
router.post('/evaluate', auth, evaluate);

export default router;
