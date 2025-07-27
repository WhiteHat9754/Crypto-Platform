import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createDeposit, getDeposits, getDepositStatus, handleWebhook } from '../controllers/depositController';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createDepositValidation = Joi.object({
  currency: Joi.string().uppercase().required(),
  amount: Joi.number().positive().required(),
  payCurrency: Joi.string().uppercase().required()
});

// Webhook route (no authentication required)
router.post('/webhook', handleWebhook);

// Authenticated routes
router.use(authenticate);

router.post('/', validateRequest(createDepositValidation), createDeposit);
router.get('/', getDeposits);
router.get('/:depositId/status', getDepositStatus);

export default router;
