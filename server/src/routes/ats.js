import { Router } from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { analyse } from '../controllers/atsController.js';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post('/analyse', auth, upload.single('resume'), analyse);

export default router;
