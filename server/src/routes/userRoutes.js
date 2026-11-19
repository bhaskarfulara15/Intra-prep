import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  updateProfileSchema 
} from '../controllers/userController.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);

export default router;
