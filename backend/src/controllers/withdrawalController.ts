
import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Withdrawal from '../models/Withdrawal';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/interfaces';

// Create withdrawal request (user-facing)
export const createWithdrawal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id as Types.ObjectId;
    const { currency, amount, toAddress } = req.body;

    console.log('🔄 Creating withdrawal request:', { userId, currency, amount, toAddress });

    // Validate input
    if (!currency || !amount || !toAddress) {
      sendErrorResponse(res, 'Currency, amount, and address are required', 400);
      return;
    }

    if (amount <= 0) {
      sendErrorResponse(res, 'Amount must be positive', 400);
      return;
    }

    // Validate user wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      sendErrorResponse(res, 'Wallet not found', 404);
      return;
    }

    const balance = wallet.balances.get(currency.toUpperCase()) || 0;
    
    // Calculate fee (you can implement dynamic fee calculation here)
    const fee = calculateWithdrawalFee(currency.toUpperCase(), amount);
    const totalRequired = amount + fee;

    if (balance < totalRequired) {
      sendErrorResponse(res, `Insufficient balance. Required: ${totalRequired} ${currency}, Available: ${balance} ${currency}`, 400);
      return;
    }

    // Check for minimum withdrawal amount
    const minWithdrawal = getMinimumWithdrawal(currency.toUpperCase());
    if (amount < minWithdrawal) {
      sendErrorResponse(res, `Minimum withdrawal amount is ${minWithdrawal} ${currency}`, 400);
      return;
    }

    // Deduct from wallet immediately (reserved for withdrawal)
    wallet.balances.set(currency.toUpperCase(), balance - totalRequired);
    await wallet.save();

    // Determine priority based on amount
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (amount >= 10000) priority = 'high';
    else if (amount <= 100) priority = 'low';

    // Create withdrawal record (status: pending for admin processing)
    const withdrawal = await Withdrawal.create({
      userId,
      currency: currency.toUpperCase(),
      amount,
      fee,
      toAddress: toAddress.trim(),
      status: 'pending', // Admin will process this
      priority
    });

    console.log('✅ Withdrawal request created:', withdrawal._id);

    // Create initial transaction record
    await Transaction.create({
      userId,
      type: 'withdrawal',
      status: 'pending',
      fromCurrency: currency.toUpperCase(),
      amount,
      fee,
      description: `Withdrawal request to ${toAddress.slice(0, 10)}...`,
      metadata: {
        withdrawalId: withdrawal._id,
        toAddress,
        priority
      }
    });

    // TODO: Send notification to admin about new withdrawal request
    console.log(`🔔 New withdrawal request requires admin approval: ${withdrawal._id} - ${amount} ${currency} - Priority: ${priority}`);

    sendSuccessResponse(res, {
      withdrawal: {
        id: withdrawal._id,
        currency: withdrawal.currency,
        amount: withdrawal.amount,
        fee: withdrawal.fee,
        toAddress: withdrawal.toAddress,
        status: withdrawal.status,
        priority: withdrawal.priority,
        createdAt: withdrawal.createdAt
      }
    }, 'Withdrawal request created successfully. It will be processed by our team.', 201);

  } catch (error) {
    console.error('❌ Create withdrawal error:', error);
    next(error);
  }
};

// Get user's withdrawal history
export const getUserWithdrawals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 10, status, currency } = req.query;

    console.log('🔄 Fetching user withdrawals:', { userId, status, currency });

    const query: any = { userId };
    if (status) query.status = status;
    if (currency) query.currency = currency;

    const withdrawals = await Withdrawal.find(query)
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Withdrawal.countDocuments(query);

    // Calculate total withdrawn
    const totalWithdrawn = await Withdrawal.aggregate([
      { $match: { userId: new Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    sendSuccessResponse(res, {
      withdrawals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      summary: {
        totalWithdrawn: totalWithdrawn[0]?.total || 0
      }
    }, 'Withdrawals retrieved successfully');

  } catch (error) {
    console.error('❌ Get user withdrawals error:', error);
    next(error);
  }
};

// Get single withdrawal details
export const getWithdrawalDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { withdrawalId } = req.params;

    console.log('🔄 Fetching withdrawal details:', { userId, withdrawalId });

    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, userId })
      .populate('processedBy', 'firstName lastName');

    if (!withdrawal) {
      sendErrorResponse(res, 'Withdrawal not found', 404);
      return;
    }

    sendSuccessResponse(res, { withdrawal }, 'Withdrawal details retrieved successfully');

  } catch (error) {
    console.error('❌ Get withdrawal details error:', error);
    next(error);
  }
};

// Cancel pending withdrawal (user can only cancel pending withdrawals)
export const cancelWithdrawal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { withdrawalId } = req.params;

    console.log('🔄 Cancelling withdrawal:', { userId, withdrawalId });

    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId, userId });
    if (!withdrawal) {
      sendErrorResponse(res, 'Withdrawal not found', 404);
      return;
    }

    if (withdrawal.status !== 'pending') {
      sendErrorResponse(res, 'Can only cancel pending withdrawals', 400);
      return;
    }

    // Refund to user's wallet
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      const currentBalance = wallet.balances.get(withdrawal.currency) || 0;
      wallet.balances.set(withdrawal.currency, currentBalance + withdrawal.amount + withdrawal.fee);
      await wallet.save();
    }

    // Update withdrawal status
    withdrawal.status = 'cancelled';
    await withdrawal.save();

    // Create refund transaction record
    await Transaction.create({
      userId,
      type: 'deposit',
      status: 'completed',
      toCurrency: withdrawal.currency,
      amount: withdrawal.amount + withdrawal.fee,
      description: `Withdrawal cancellation refund`,
      metadata: {
        withdrawalId: withdrawal._id,
        cancellation: true
      }
    });

    console.log('✅ Withdrawal cancelled and refunded:', withdrawalId);

    sendSuccessResponse(res, { withdrawal }, 'Withdrawal cancelled successfully');

  } catch (error) {
    console.error('❌ Cancel withdrawal error:', error);
    next(error);
  }
};

// Get withdrawal fees (public endpoint)
export const getWithdrawalFees = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fees = {
      BTC: { fee: 0.0005, minimum: 0.001 },
      ETH: { fee: 0.01, minimum: 0.01 },
      USDT: { fee: 1, minimum: 10 },
      USDC: { fee: 1, minimum: 10 },
      SOL: { fee: 0.01, minimum: 0.1 },
      ADA: { fee: 0.5, minimum: 1 },
      DOT: { fee: 0.1, minimum: 1 },
      DOGE: { fee: 1, minimum: 10 }
    };

    sendSuccessResponse(res, { fees }, 'Withdrawal fees retrieved successfully');

  } catch (error) {
    next(error);
  }
};

// Get withdrawal statistics for user
export const getWithdrawalStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    console.log('🔄 Fetching withdrawal statistics:', userId);

    const stats = await Withdrawal.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fee' }
        }
      }
    ]);

    const monthlyStats = await Withdrawal.aggregate([
      { 
        $match: { 
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        } 
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount,
        totalFees: stat.totalFees
      };
      return acc;
    }, {});

    sendSuccessResponse(res, {
      allTime: formattedStats,
      lastMonth: monthlyStats[0] || { count: 0, totalAmount: 0 }
    }, 'Withdrawal statistics retrieved successfully');

  } catch (error) {
    console.error('❌ Get withdrawal stats error:', error);
    next(error);
  }
};

// Helper functions
const calculateWithdrawalFee = (currency: string, amount: number): number => {
  const feeRates: { [key: string]: number } = {
    'BTC': 0.0005,
    'ETH': 0.01,
    'USDT': 1,
    'USDC': 1,
    'SOL': 0.01,
    'ADA': 0.5,
    'DOT': 0.1,
    'DOGE': 1
  };

  return feeRates[currency] || 0.001;
};

const getMinimumWithdrawal = (currency: string): number => {
  const minimums: { [key: string]: number } = {
    'BTC': 0.001,
    'ETH': 0.01,
    'USDT': 10,
    'USDC': 10,
    'SOL': 0.1,
    'ADA': 1,
    'DOT': 1,
    'DOGE': 10
  };

  return minimums[currency] || 0.01;
};

// Validate withdrawal address format (basic validation)
const validateAddress = (currency: string, address: string): boolean => {
  const patterns: { [key: string]: RegExp } = {
    'BTC': /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
    'ETH': /^0x[a-fA-F0-9]{40}$/,
    'USDT': /^0x[a-fA-F0-9]{40}$/, // ERC-20 USDT
    'USDC': /^0x[a-fA-F0-9]{40}$/, // ERC-20 USDC
    'SOL': /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    'ADA': /^addr1[a-z0-9]+$/,
    'DOT': /^1[a-km-zA-HJ-NP-Z1-9]+$/,
    'DOGE': /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/
  };

  return patterns[currency]?.test(address) || false;
};

// Admin function: Update withdrawal status (called from admin controller)
export const updateWithdrawalStatus = async (
  withdrawalId: string, 
  status: 'processing' | 'completed' | 'failed',
  txHash?: string,
  failureReason?: string,
  processedBy?: Types.ObjectId
): Promise<void> => {
  try {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    withdrawal.status = status;
    withdrawal.processedAt = new Date();
    
    if (txHash) withdrawal.txHash = txHash;
    if (failureReason) withdrawal.failureReason = failureReason;
    if (processedBy) withdrawal.processedBy = processedBy;

    await withdrawal.save();

    // Update transaction record
    await Transaction.updateOne(
      { 'metadata.withdrawalId': withdrawalId },
      { 
        status: status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'processing',
        txHash: txHash || undefined,
        updatedAt: new Date()
      }
    );

    console.log('✅ Withdrawal status updated:', { withdrawalId, status });

  } catch (error) {
    console.error('❌ Update withdrawal status error:', error);
    throw error;
  }
};
