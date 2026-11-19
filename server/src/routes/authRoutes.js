import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  registerSchema, 
  loginSchema 
} from '../controllers/authController.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
