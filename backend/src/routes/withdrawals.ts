import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createWithdrawal,
  getUserWithdrawals,
  getWithdrawalDetails,
  cancelWithdrawal,
  getWithdrawalFees,
  getWithdrawalStats
} from '../controllers/withdrawalController';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createWithdrawalValidation = Joi.object({
  currency: Joi.string().uppercase().required(),
  amount: Joi.number().positive().required(),
  toAddress: Joi.string().required().min(10).max(100)
});

// Public routes
router.get('/fees', getWithdrawalFees);

// Authenticated routes
router.use(authenticate);

router.post('/', validateRequest(createWithdrawalValidation), createWithdrawal);
router.get('/', getUserWithdrawals);
router.get('/stats', getWithdrawalStats);
router.get('/:withdrawalId', getWithdrawalDetails);
router.put('/:withdrawalId/cancel', cancelWithdrawal);

export default router;
