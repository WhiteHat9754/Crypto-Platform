import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Admin from '../models/Admin';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Withdrawal from '../models/Withdrawal';
import Deposit from '../models/Deposit';
import Transaction from '../models/Transaction';
import { generateAccessToken, generateRefreshToken, setTokenCookie } from '../utils/jwt';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responses';
import { AdminAuthenticatedRequest } from '../types/interfaces';

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔄 Admin login attempt:', email);

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      console.log('❌ Admin not found:', email);
      sendErrorResponse(res, 'Invalid credentials', 401);
      return;
    }

    if (!admin.isActive) {
      console.log('❌ Admin account deactivated:', email);
      sendErrorResponse(res, 'Account is deactivated', 401);
      return;
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for admin:', email);
      sendErrorResponse(res, 'Invalid credentials', 401);
      return;
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const tokenPayload = {
      userId: String(admin._id),
      email: admin.email,
      role: 'admin'
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    setTokenCookie(res, accessToken, 'access');
    setTokenCookie(res, refreshToken, 'refresh');

    console.log('✅ Admin login successful:', email);

    sendSuccessResponse(res, {
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLoginAt: admin.lastLoginAt
      },
      accessToken,
      refreshToken
    }, 'Admin login successful');

  } catch (error) {
    console.error('❌ Admin login error:', error);
    next(error);
  }
};

export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    console.log('✅ Admin logout successful');
    sendSuccessResponse(res, null, 'Admin logout successful');

  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminReq = req as AdminAuthenticatedRequest;
    const admin = adminReq.user!;
    
    sendSuccessResponse(res, {
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLoginAt: admin.lastLoginAt
    }, 'Admin profile retrieved successfully');

  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔄 Fetching dashboard stats...');

    const totalUsers = await User.countDocuments({ isActive: true });
    const totalInactiveUsers = await User.countDocuments({ isActive: false });
    const newUsersToday = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const totalDeposits = await Deposit.countDocuments();
    const completedDeposits = await Deposit.countDocuments({ status: 'finished' });
    const pendingDeposits = await Deposit.countDocuments({ status: 'waiting' });

    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const processingWithdrawals = await Withdrawal.countDocuments({ status: 'processing' });
    const completedWithdrawals = await Withdrawal.countDocuments({ status: 'completed' });
    const failedWithdrawals = await Withdrawal.countDocuments({ status: 'failed' });

    const wallets = await Wallet.find({});
    let totalPlatformBalance = 0;
    const currencyBalances: { [key: string]: number } = {};
    
    wallets.forEach(wallet => {
      if (wallet.balances) {
        for (const [currency, balance] of wallet.balances) {
          totalPlatformBalance += balance * 1;
          currencyBalances[currency] = (currencyBalances[currency] || 0) + balance;
        }
      }
    });

    const recentDeposits = await Deposit.find({ status: 'finished' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentWithdrawals = await Withdrawal.find({})
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    const highPriorityWithdrawals = await Withdrawal.find({ 
      status: 'pending', 
      priority: 'high' 
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .limit(5);

    console.log('✅ Dashboard stats retrieved successfully');

    sendSuccessResponse(res, {
      stats: {
        users: {
          total: totalUsers,
          inactive: totalInactiveUsers,
          newToday: newUsersToday
        },
        deposits: {
          total: totalDeposits,
          completed: completedDeposits,
          pending: pendingDeposits
        },
        withdrawals: {
          total: totalWithdrawals,
          pending: pendingWithdrawals,
          processing: processingWithdrawals,
          completed: completedWithdrawals,
          failed: failedWithdrawals
        },
        platform: {
          totalBalance: totalPlatformBalance,
          currencyBalances
        }
      },
      recentDeposits,
      recentWithdrawals,
      highPriorityWithdrawals
    }, 'Dashboard stats retrieved successfully');

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    console.log('🔄 Fetching users with filters:', { search, status, sortBy, sortOrder });

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    const usersWithBalances = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        const totalDeposits = await Deposit.countDocuments({ userId: user._id, status: 'finished' });
        const totalWithdrawals = await Withdrawal.countDocuments({ userId: user._id });
        
        return {
          ...user.toJSON(),
          walletBalances: wallet ? Object.fromEntries(wallet.balances) : {},
          stats: {
            totalDeposits,
            totalWithdrawals
          }
        };
      })
    );

    console.log('✅ Users retrieved successfully:', usersWithBalances.length);

    sendSuccessResponse(res, {
      users: usersWithBalances,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Users retrieved successfully');

  } catch (error) {
    console.error('❌ Get users error:', error);
    next(error);
  }
};

export const getUserDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    console.log('🔄 Fetching user details:', userId);

    const user = await User.findById(userId);
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    const wallet = await Wallet.findOne({ userId });
    const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 }).limit(20);
    const withdrawals = await Withdrawal.find({ userId })
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(20);

    const totalDeposited = await Deposit.aggregate([
      { $match: { userId: user._id, status: 'finished' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWithdrawn = await Withdrawal.aggregate([
      { $match: { userId: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    console.log('✅ User details retrieved successfully');

    sendSuccessResponse(res, {
      user: {
        ...user.toJSON(),
        walletBalances: wallet ? Object.fromEntries(wallet.balances) : {},
        statistics: {
          totalDeposited: totalDeposited[0]?.total || 0,
          totalWithdrawn: totalWithdrawn[0]?.total || 0,
          totalDeposits: deposits.length,
          totalWithdrawals: withdrawals.length
        }
      },
      deposits,
      withdrawals,
      transactions
    }, 'User details retrieved successfully');

  } catch (error) {
    console.error('❌ Get user details error:', error);
    next(error);
  }
};

export const getPendingWithdrawals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, priority, currency, sortBy = 'priority' } = req.query;

    console.log('🔄 Fetching pending withdrawals with filters:', { priority, currency, sortBy });

    const query: any = { status: 'pending' };
    if (priority) query.priority = priority;
    if (currency) query.currency = currency;

    const sortOptions: any = {};
    if (sortBy === 'priority') {
      sortOptions.priority = -1;
      sortOptions.createdAt = 1;
    } else {
      sortOptions[sortBy as string] = 1;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'firstName lastName email')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Withdrawal.countDocuments(query);

    const priorityCounts = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    console.log('✅ Pending withdrawals retrieved successfully:', withdrawals.length);

    sendSuccessResponse(res, {
      withdrawals,
      priorityCounts: priorityCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Pending withdrawals retrieved successfully');

  } catch (error) {
    console.error('❌ Get pending withdrawals error:', error);
    next(error);
  }
};

export const processWithdrawal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminReq = req as AdminAuthenticatedRequest;
    const adminId = adminReq.user!._id as Types.ObjectId;
    const { withdrawalId } = req.params;
    const { action, txHash, failureReason, adminNotes } = req.body;

    console.log('🔄 Processing withdrawal:', { withdrawalId, action, adminId });

    const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');
    if (!withdrawal) {
      sendErrorResponse(res, 'Withdrawal not found', 404);
      return;
    }

    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      sendErrorResponse(res, 'Withdrawal has already been processed', 400);
      return;
    }

    if (action === 'approve') {
      if (!txHash) {
        sendErrorResponse(res, 'Transaction hash is required for approval', 400);
        return;
      }

      withdrawal.status = 'completed';
      withdrawal.txHash = txHash;
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = adminId;
      withdrawal.adminNotes = adminNotes;

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'withdrawal',
        status: 'completed',
        fromCurrency: withdrawal.currency,
        amount: withdrawal.amount,
        fee: withdrawal.fee,
        txHash: txHash,
        description: `Withdrawal processed by admin`,
        metadata: {
          withdrawalId: withdrawal._id,
          processedBy: adminId,
          adminNotes
        }
      });

      console.log('✅ Withdrawal approved:', withdrawalId);

    } else if (action === 'reject') {
      if (!failureReason) {
        sendErrorResponse(res, 'Failure reason is required for rejection', 400);
        return;
      }

      withdrawal.status = 'failed';
      withdrawal.failureReason = failureReason;
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = adminId;
      withdrawal.adminNotes = adminNotes;

      const wallet = await Wallet.findOne({ userId: withdrawal.userId });
      if (wallet) {
        const currentBalance = wallet.balances.get(withdrawal.currency) || 0;
        wallet.balances.set(withdrawal.currency, currentBalance + withdrawal.amount + withdrawal.fee);
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'deposit',
        status: 'completed',
        toCurrency: withdrawal.currency,
        amount: withdrawal.amount + withdrawal.fee,
        description: `Withdrawal refund - ${failureReason}`,
        metadata: {
          withdrawalId: withdrawal._id,
          refund: true,
          processedBy: adminId
        }
      });

      console.log('✅ Withdrawal rejected and refunded:', withdrawalId);

    } else if (action === 'processing') {
      withdrawal.status = 'processing';
      withdrawal.processedBy = adminId;
      withdrawal.adminNotes = adminNotes;

      console.log('✅ Withdrawal marked as processing:', withdrawalId);
    }

    await withdrawal.save();

    sendSuccessResponse(res, { withdrawal }, 'Withdrawal processed successfully');

  } catch (error) {
    console.error('❌ Process withdrawal error:', error);
    next(error);
  }
};

export const updateWithdrawalPriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { withdrawalId } = req.params;
    const { priority } = req.body;

    console.log('🔄 Updating withdrawal priority:', { withdrawalId, priority });

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      sendErrorResponse(res, 'Withdrawal not found', 404);
      return;
    }

    withdrawal.priority = priority;
    await withdrawal.save();

    console.log('✅ Withdrawal priority updated successfully');

    sendSuccessResponse(res, { withdrawal }, 'Withdrawal priority updated successfully');

  } catch (error) {
    console.error('❌ Update withdrawal priority error:', error);
    next(error);
  }
};

export const getWithdrawalHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, currency, processedBy, dateFrom, dateTo } = req.query;

    console.log('🔄 Fetching withdrawal history with filters:', { status, currency, processedBy });

    const query: any = {};
    if (status) query.status = status;
    if (currency) query.currency = currency;
    if (processedBy) query.processedBy = processedBy;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Withdrawal.countDocuments(query);

    const summaryStats = await Withdrawal.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fee' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    console.log('✅ Withdrawal history retrieved successfully:', withdrawals.length);

    sendSuccessResponse(res, {
      withdrawals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      summary: summaryStats[0] || {
        totalAmount: 0,
        totalFees: 0,
        averageAmount: 0
      }
    }, 'Withdrawal history retrieved successfully');

  } catch (error) {
    console.error('❌ Get withdrawal history error:', error);
    next(error);
  }
};

export const getDepositHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, currency, dateFrom, dateTo } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (currency) query.currency = currency;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const deposits = await Deposit.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Deposit.countDocuments(query);

    sendSuccessResponse(res, {
      deposits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Deposit history retrieved successfully');

  } catch (error) {
    console.error('❌ Get deposit history error:', error);
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    console.log('🔄 Updating user status:', { userId, isActive });

    const user = await User.findById(userId);
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    user.isActive = isActive;
    await user.save();

    console.log('✅ User status updated successfully');

    sendSuccessResponse(res, { user }, 'User status updated successfully');

  } catch (error) {
    console.error('❌ Update user status error:', error);
    next(error);
  }
};

export const adjustUserBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminReq = req as AdminAuthenticatedRequest;
    const adminId = adminReq.user!._id as Types.ObjectId;
    const { userId } = req.params;
    const { currency, amount, reason, type } = req.body;

    console.log('🔄 Adjusting user balance:', { userId, currency, amount, type, reason });

    const user = await User.findById(userId);
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balances: new Map(),
        addresses: new Map()
      });
    }

    const currentBalance = wallet.balances.get(currency.toUpperCase()) || 0;
    const adjustmentAmount = type === 'add' ? Math.abs(amount) : -Math.abs(amount);
    const newBalance = Math.max(0, currentBalance + adjustmentAmount);

    wallet.balances.set(currency.toUpperCase(), newBalance);
    await wallet.save();

    await Transaction.create({
      userId,
      type: type === 'add' ? 'deposit' : 'withdrawal',
      status: 'completed',
      [type === 'add' ? 'toCurrency' : 'fromCurrency']: currency.toUpperCase(),
      amount: Math.abs(amount),
      description: `Admin balance adjustment: ${reason}`,
      metadata: {
        adminAdjustment: true,
        processedBy: adminId,
        reason,
        previousBalance: currentBalance,
        newBalance
      }
    });

    console.log('✅ User balance adjusted successfully:', {
      userId,
      currency,
      previousBalance: currentBalance,
      newBalance
    });

    sendSuccessResponse(res, {
      wallet: {
        balances: Object.fromEntries(wallet.balances)
      },
      adjustment: {
        currency,
        previousBalance: currentBalance,
        newBalance,
        adjustmentAmount,
        reason
      }
    }, 'User balance adjusted successfully');

  } catch (error) {
    console.error('❌ Adjust user balance error:', error);
    next(error);
  }
};
