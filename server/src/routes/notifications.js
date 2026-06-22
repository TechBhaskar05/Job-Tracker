import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getNotifications,
  getCount,
  markRead,
  markAllRead,
} from '../controllers/notificationsController.js';

const router = Router();

router.get('/', auth, getNotifications);
router.get('/count', auth, getCount);
router.patch('/:id/read', auth, markRead);
router.post('/mark-all-read', auth, markAllRead);

export default router;
