import { Router } from 'express';
import auth from '../middleware/auth.js';
import { generate, save, history } from '../controllers/quizController.js';

const router = Router();

router.post('/generate', auth, generate);
router.post('/save', auth, save);
router.get('/history', auth, history);

export default router;
