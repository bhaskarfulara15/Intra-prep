import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
  getInterviewReport,
  deleteInterview,
  createInterviewSchema,
  submitAnswerSchema,
} from '../controllers/interviewController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateRequest(createInterviewSchema), createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/:id/answer', validateRequest(submitAnswerSchema), submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/:id/report', getInterviewReport);
router.delete('/:id', deleteInterview);

export default router;
