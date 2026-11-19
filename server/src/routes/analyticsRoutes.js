import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardAnalytics);

export default router;
