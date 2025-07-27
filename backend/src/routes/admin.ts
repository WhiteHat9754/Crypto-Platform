import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth';
import { validateRequest } from '../middleware/validation';
import {
  adminLogin,
  adminLogout,
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  getPendingWithdrawals,
  processWithdrawal,
  updateWithdrawalPriority,
  getWithdrawalHistory,
  getDepositHistory,
  updateUserStatus,
  adjustUserBalance,
  getAdminProfile
} from '../controllers/adminController';
import Joi from 'joi';

// ✅ FIXED: Properly typed router
const router = express.Router();

// Validation schemas
const adminLoginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const processWithdrawalValidation = Joi.object({
  action: Joi.string().valid('approve', 'reject', 'processing').required(),
  txHash: Joi.string().when('action', { 
    is: 'approve', 
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  failureReason: Joi.string().when('action', { 
    is: 'reject', 
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  adminNotes: Joi.string().optional()
});

const updatePriorityValidation = Joi.object({
  priority: Joi.string().valid('low', 'medium', 'high').required()
});

const updateUserStatusValidation = Joi.object({
  isActive: Joi.boolean().required()
});

const adjustBalanceValidation = Joi.object({
  currency: Joi.string().uppercase().required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('add', 'subtract').required(),
  reason: Joi.string().required()
});

// ✅ FIXED: Public admin routes (no authentication required)
router.post('/login', validateRequest(adminLoginValidation), adminLogin);

// ✅ FIXED: Protected admin routes (authentication required)
router.use(authenticateAdmin);

// Profile routes
router.get('/profile', getAdminProfile);
router.post('/logout', adminLogout);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/status', validateRequest(updateUserStatusValidation), updateUserStatus);
router.put('/users/:userId/balance', validateRequest(adjustBalanceValidation), adjustUserBalance);

// Withdrawal management routes
router.get('/withdrawals/pending', getPendingWithdrawals);
router.get('/withdrawals/history', getWithdrawalHistory);
router.put('/withdrawals/:withdrawalId/process', validateRequest(processWithdrawalValidation), processWithdrawal);
router.put('/withdrawals/:withdrawalId/priority', validateRequest(updatePriorityValidation), updateWithdrawalPriority);

// Deposit management routes
router.get('/deposits/history', getDepositHistory);

export default router;
