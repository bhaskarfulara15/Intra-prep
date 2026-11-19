import express from 'express';
import { 
  uploadResumeHandler, 
  getResumes, 
  getResumeById, 
  deleteResume 
} from '../controllers/resumeController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/upload', uploadResume.single('resume'), uploadResumeHandler);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;
