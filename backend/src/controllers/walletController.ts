import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/interfaces';
import NOWPaymentsService from '../services/nowpaymentsService';
import axios from 'axios';

// Get user's wallet balances
export const getWalletBalances = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    console.log('🔄 Fetching wallet balances for user:', userId);

    let wallet = await Wallet.findOne({ userId });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balances: new Map(),
        addresses: new Map()
      });
      console.log('✅ New wallet created for user:', userId);
    }

    // Get real-time crypto prices
    const cryptoPrices = await getCryptoPrices();

    // Process wallet data with USD values
    const balancesWithPrices = Object.fromEntries(
      Array.from(wallet.balances.entries()).map(([currency, balance]) => {
        const price = cryptoPrices[currency.toLowerCase()] || 0;
        return [currency, {
          balance,
          price,
          usdValue: balance * price
        }];
      })
    );

    console.log('✅ Wallet balances retrieved successfully');

    sendSuccessResponse(res, {
      balances: Object.fromEntries(wallet.balances),
      balancesWithPrices,
      addresses: Object.fromEntries(wallet.addresses),
      totalUsdValue: Object.values(balancesWithPrices).reduce((sum: number, data: any) => sum + data.usdValue, 0)
    }, 'Wallet balances retrieved successfully');

  } catch (error) {
    console.error('❌ Get wallet balances error:', error);
    next(error);
  }
};

// Update user balance (internal function for deposits/withdrawals)
export const updateBalance = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { currency, amount, operation = 'add' } = req.body; // operation: 'add' or 'subtract'

    console.log('🔄 Updating balance:', { userId, currency, amount, operation });

    if (!currency || amount === undefined) {
      sendErrorResponse(res, 'Currency and amount are required', 400);
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
    const newBalance = operation === 'add' 
      ? currentBalance + Math.abs(amount)
      : Math.max(0, currentBalance - Math.abs(amount));

    wallet.balances.set(currency.toUpperCase(), newBalance);
    await wallet.save();

    console.log('✅ Balance updated:', {
      currency: currency.toUpperCase(),
      previousBalance: currentBalance,
      newBalance,
      operation
    });

    sendSuccessResponse(res, {
      currency: currency.toUpperCase(),
      previousBalance: currentBalance,
      newBalance,
      balances: Object.fromEntries(wallet.balances)
    }, 'Balance updated successfully');

  } catch (error) {
    console.error('❌ Update balance error:', error);
    next(error);
  }
};

// Get wallet transactions history
export const getWalletTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 20, type, currency, status } = req.query;

    console.log('🔄 Fetching wallet transactions:', { userId, type, currency, status });

    const query: any = { userId };
    if (type) query.type = type;
    if (currency) {
      query.$or = [
        { fromCurrency: currency },
        { toCurrency: currency }
      ];
    }
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

    // Get transaction summary
    const summary = await Transaction.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    console.log('✅ Wallet transactions retrieved successfully');

    sendSuccessResponse(res, {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      summary: summary.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalAmount: item.totalAmount
        };
        return acc;
      }, {})
    }, 'Wallet transactions retrieved successfully');

  } catch (error) {
    console.error('❌ Get wallet transactions error:', error);
    next(error);
  }
};


// Transfer funds between users
export const transferFunds = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const senderId = req.user!._id;
    const { recipientEmail, currency, amount } = req.body;

    console.log('🔄 Processing transfer:', { senderId, recipientEmail, currency, amount });

    // Validate input
    if (!recipientEmail || !currency || !amount) {
      sendErrorResponse(res, 'Recipient email, currency, and amount are required', 400);
      return;
    }

    if (amount <= 0) {
      sendErrorResponse(res, 'Amount must be positive', 400);
      return;
    }

    // Find recipient user
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!recipient) {
      sendErrorResponse(res, 'Recipient not found', 404);
      return;
    }

    // ✅ FIXED: Type assertion to tell TypeScript the correct type
    if ((recipient._id as Types.ObjectId).toString() === (senderId as Types.ObjectId).toString()) {
      sendErrorResponse(res, 'Cannot transfer to yourself', 400);
      return;
    }

    // ... rest of your code
  } catch (error) {
    console.error('❌ Transfer funds error:', error);
    next(error);
  }
};


// Swap cryptocurrencies
export const swapCurrencies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { fromCurrency, toCurrency, fromAmount } = req.body;

    console.log('🔄 Processing swap:', { userId, fromCurrency, toCurrency, fromAmount });

    // Validate input
    if (!fromCurrency || !toCurrency || !fromAmount) {
      sendErrorResponse(res, 'From currency, to currency, and amount are required', 400);
      return;
    }

    if (fromAmount <= 0) {
      sendErrorResponse(res, 'Amount must be positive', 400);
      return;
    }

    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      sendErrorResponse(res, 'Cannot swap same currency', 400);
      return;
    }

    // Get user wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      sendErrorResponse(res, 'Wallet not found', 404);
      return;
    }

    // Check balance
    const fromBalance = wallet.balances.get(fromCurrency.toUpperCase()) || 0;
    if (fromBalance < fromAmount) {
      sendErrorResponse(res, 'Insufficient balance', 400);
      return;
    }

    // Get current prices
    const cryptoPrices = await getCryptoPrices();
    const fromPrice = cryptoPrices[fromCurrency.toLowerCase()];
    const toPrice = cryptoPrices[toCurrency.toLowerCase()];

    if (!fromPrice || !toPrice) {
      sendErrorResponse(res, 'Unable to get current prices', 500);
      return;
    }

    // Calculate swap
    const swapFee = 0.001; // 0.1% swap fee
    const usdValue = fromAmount * fromPrice;
    const toAmountBeforeFee = usdValue / toPrice;
    const feeAmount = toAmountBeforeFee * swapFee;
    const toAmount = toAmountBeforeFee - feeAmount;

    // Execute swap
    const newFromBalance = fromBalance - fromAmount;
    const toBalance = wallet.balances.get(toCurrency.toUpperCase()) || 0;
    const newToBalance = toBalance + toAmount;

    wallet.balances.set(fromCurrency.toUpperCase(), newFromBalance);
    wallet.balances.set(toCurrency.toUpperCase(), newToBalance);
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      userId,
      type: 'swap',
      status: 'completed',
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      amount: fromAmount,
      receivedAmount: toAmount,
      fee: feeAmount,
      description: `Swapped ${fromAmount} ${fromCurrency.toUpperCase()} to ${toAmount.toFixed(8)} ${toCurrency.toUpperCase()}`,
      metadata: {
        fromPrice,
        toPrice,
        usdValue,
        swapFee
      }
    });

    console.log('✅ Swap completed successfully:', {
      fromAmount,
      fromCurrency: fromCurrency.toUpperCase(),
      toAmount,
      toCurrency: toCurrency.toUpperCase(),
      fee: feeAmount
    });

    sendSuccessResponse(res, {
      fromAmount,
      fromCurrency: fromCurrency.toUpperCase(),
      toAmount,
      toCurrency: toCurrency.toUpperCase(),
      fee: feeAmount,
      exchangeRate: toAmount / fromAmount,
      newBalances: {
        [fromCurrency.toUpperCase()]: newFromBalance,
        [toCurrency.toUpperCase()]: newToBalance
      }
    }, 'Swap completed successfully');

  } catch (error) {
    console.error('❌ Swap currencies error:', error);
    next(error);
  }
};

// Get supported currencies for deposits
export const getSupportedCurrencies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔄 Fetching supported currencies...');

    // Get currencies from NOWPayments
    const nowPaymentsCurrencies = await NOWPaymentsService.getAvailableCurrencies();
    
    // Filter to only currencies we support
    const supportedCurrencies = nowPaymentsCurrencies.filter(currency => 
      ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'ADA', 'DOT', 'SOL', 'DOGE', 'XRP', 'BNB'].includes(currency.toUpperCase())
    );

    // Get current prices for supported currencies
    const cryptoPrices = await getCryptoPrices();

    const currenciesWithPrices = supportedCurrencies.map(currency => ({
      symbol: currency.toUpperCase(),
      name: getCurrencyName(currency.toUpperCase()),
      price: cryptoPrices[currency.toLowerCase()] || 0,
      icon: `/icons/${currency.toLowerCase()}.png`,
      depositEnabled: true,
      withdrawalEnabled: true
    }));

    console.log('✅ Supported currencies retrieved successfully');

    sendSuccessResponse(res, {
      currencies: currenciesWithPrices,
      total: currenciesWithPrices.length
    }, 'Supported currencies retrieved successfully');

  } catch (error) {
    console.error('❌ Get supported currencies error:', error);
    next(error);
  }
};

// Get wallet statistics
export const getWalletStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    console.log('🔄 Fetching wallet statistics:', userId);

    // Get transaction statistics
    const stats = await Transaction.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fee' }
        }
      }
    ]);

    // Get recent activity (last 30 days)
    const recentActivity = await Transaction.find({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    // Get wallet balance
    const wallet = await Wallet.findOne({ userId });
    const totalCurrencies = wallet ? wallet.balances.size : 0;

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount || 0,
        totalFees: stat.totalFees || 0
      };
      return acc;
    }, {});

    console.log('✅ Wallet statistics retrieved successfully');

    sendSuccessResponse(res, {
      transactionStats: formattedStats,
      summary: {
        totalCurrencies,
        recentActivity,
        totalTransactions: stats.reduce((sum, stat) => sum + stat.count, 0)
      }
    }, 'Wallet statistics retrieved successfully');

  } catch (error) {
    console.error('❌ Get wallet stats error:', error);
    next(error);
  }
};

// Generate deposit address (placeholder - would integrate with actual wallet service)
export const generateDepositAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { currency } = req.body;

    console.log('🔄 Generating deposit address:', { userId, currency });

    if (!currency) {
      sendErrorResponse(res, 'Currency is required', 400);
      return;
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balances: new Map(),
        addresses: new Map()
      });
    }

    // Check if address already exists
    let address = wallet.addresses.get(currency.toUpperCase());
    
    if (!address) {
      // Generate new address (this would integrate with actual wallet service)
      address = generateMockAddress(currency.toUpperCase());
      wallet.addresses.set(currency.toUpperCase(), address);
      await wallet.save();
    }

    console.log('✅ Deposit address generated:', { currency: currency.toUpperCase(), address });

    sendSuccessResponse(res, {
      currency: currency.toUpperCase(),
      address,
      network: getNetworkInfo(currency.toUpperCase())
    }, 'Deposit address generated successfully');

  } catch (error) {
    console.error('❌ Generate deposit address error:', error);
    next(error);
  }
};

// Helper functions
const getCryptoPrices = async (): Promise<{ [key: string]: number }> => {
  try {
    const cryptoIds = [
      'bitcoin', 'ethereum', 'tether', 'usd-coin', 'solana', 
      'cardano', 'polkadot', 'dogecoin', 'ripple', 'binancecoin'
    ].join(',');

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`,
      { timeout: 10000 }
    );

    return {
      btc: response.data.bitcoin?.usd || 0,
      eth: response.data.ethereum?.usd || 0,
      usdt: response.data.tether?.usd || 0,
      usdc: response.data['usd-coin']?.usd || 0,
      sol: response.data.solana?.usd || 0,
      ada: response.data.cardano?.usd || 0,
      dot: response.data.polkadot?.usd || 0,
      doge: response.data.dogecoin?.usd || 0,
      xrp: response.data.ripple?.usd || 0,
      bnb: response.data.binancecoin?.usd || 0
    };
  } catch (error) {
    console.error('❌ Error fetching crypto prices:', error);
    return {};
  }
};

const getCurrencyName = (symbol: string): string => {
  const names: { [key: string]: string } = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'USDT': 'Tether',
    'USDC': 'USD Coin',
    'SOL': 'Solana',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'DOGE': 'Dogecoin',
    'XRP': 'Ripple',
    'BNB': 'Binance Coin'
  };

  return names[symbol] || symbol;
};

const generateMockAddress = (currency: string): string => {
  // This would integrate with actual wallet service
  const mockAddresses: { [key: string]: string } = {
    'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'ETH': '0x742b40a3e50F7b6B2B2A4c74B7D57e6ade1E2E7E',
    'USDT': '0x742b40a3e50F7b6B2B2A4c74B7D57e6ade1E2E7E',
    'USDC': '0x742b40a3e50F7b6B2B2A4c74B7D57e6ade1E2E7E',
    'SOL': '11111111111111111111111111111112',
    'ADA': 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
    'DOT': '1FRMM8PEiWXYax7rpS6X4XZX1aAAxSWx1CrKTyrVYhV24fg',
    'DOGE': 'DBXu2kgc3xtvCUWFcxFE3r9hEYgmuaaCyD'
  };

  return mockAddresses[currency] || 'Address generation not implemented';
};

const getNetworkInfo = (currency: string): string => {
  const networks: { [key: string]: string } = {
    'BTC': 'Bitcoin Network',
    'ETH': 'Ethereum Network',
    'USDT': 'Ethereum Network (ERC-20)',
    'USDC': 'Ethereum Network (ERC-20)',
    'SOL': 'Solana Network',
    'ADA': 'Cardano Network',
    'DOT': 'Polkadot Network',
    'DOGE': 'Dogecoin Network'
  };

  return networks[currency] || 'Unknown Network';
};
