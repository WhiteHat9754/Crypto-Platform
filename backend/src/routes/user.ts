import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateProfileValidation, changePasswordValidation } from '../utils/validation';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/userController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileValidation), updateProfile);
router.put('/change-password', validateRequest(changePasswordValidation), changePassword);
router.delete('/account', deleteAccount);

export default router;
