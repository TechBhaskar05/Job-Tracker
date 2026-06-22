import { Router } from 'express';
import auth from '../middleware/auth.js';
import { tailor } from '../controllers/agentsController.js';

const router = Router();

router.post('/tailor', auth, tailor);

export default router;
