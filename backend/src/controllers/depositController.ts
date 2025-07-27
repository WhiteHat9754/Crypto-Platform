import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Deposit from '../models/Deposit';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/interfaces';
import NOWPaymentsService from '../services/nowpaymentsService';

export const createDeposit = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { currency, amount, payCurrency } = req.body;

    console.log('🔄 Creating deposit request:', { userId, currency, amount, payCurrency });

    // Validate input
    if (!currency || !amount || !payCurrency) {
      sendErrorResponse(res, 'Currency, amount, and pay currency are required', 400);
      return;
    }

    if (amount <= 0) {
      sendErrorResponse(res, 'Amount must be positive', 400);
      return;
    }

    // Generate unique order ID
    const orderId = `deposit_${userId}_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // Get price estimate
    const estimatedAmount = await NOWPaymentsService.getEstimatedPrice(
      amount,
      'USD', // assuming amount is in USD
      payCurrency
    );

    // Create payment with NOWPayments
    const paymentData = {
      price_amount: amount,
      price_currency: 'USD',
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: `Deposit ${amount} USD worth of ${currency}`,
      ipn_callback_url: `${process.env.BACKEND_URL}/api/deposits/webhook`,
      success_url: `${process.env.FRONTEND_URL}/wallet?deposit=success`,
      cancel_url: `${process.env.FRONTEND_URL}/wallet?deposit=cancelled`
    };

    const payment = await NOWPaymentsService.createPayment(paymentData);

    // Save deposit record
    const deposit = await Deposit.create({
      userId,
      orderId,
      paymentId: payment.payment_id,
      currency: currency.toUpperCase(),
      amount: amount,
      usdAmount: amount,
      payAddress: payment.pay_address,
      payAmount: payment.pay_amount,
      payCurrency: payment.pay_currency.toUpperCase(),
      status: payment.payment_status,
      paymentUrl: payment.payment_url
    });

    console.log('✅ Deposit created successfully:', deposit._id);

    sendSuccessResponse(res, {
      deposit: {
        id: deposit._id,
        orderId: deposit.orderId,
        paymentId: deposit.paymentId,
        currency: deposit.currency,
        amount: deposit.amount,
        payAddress: deposit.payAddress,
        payAmount: deposit.payAmount,
        payCurrency: deposit.payCurrency,
        status: deposit.status,
        paymentUrl: deposit.paymentUrl
      }
    }, 'Deposit created successfully', 201);

  } catch (error: any) {
    console.error('❌ Create deposit error:', error);
    sendErrorResponse(res, error.message || 'Failed to create deposit', 500);
  }
};

export const getDeposits = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const deposits = await Deposit.find(query)
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
    }, 'Deposits retrieved successfully');

  } catch (error) {
    next(error);
  }
};

export const getDepositStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { depositId } = req.params;

    const deposit = await Deposit.findOne({ _id: depositId, userId });
    if (!deposit) {
      sendErrorResponse(res, 'Deposit not found', 404);
      return;
    }

    // Get latest status from NOWPayments
    try {
      const paymentStatus = await NOWPaymentsService.getPaymentStatus(deposit.paymentId);
      
      // Update local status if different
      if (paymentStatus.payment_status !== deposit.status) {
        deposit.status = paymentStatus.payment_status as any;
        
        if (paymentStatus.actually_paid) {
          deposit.actuallyPaid = paymentStatus.actually_paid;
        }
        
        await deposit.save();
      }
    } catch (error) {
      console.error('❌ Failed to get payment status from NOWPayments:', error);
    }

    sendSuccessResponse(res, { deposit }, 'Deposit status retrieved successfully');

  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: any, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    const body = JSON.stringify(req.body);

    console.log('🔄 NOWPayments webhook received:', req.body);

    // Verify signature
    if (!NOWPaymentsService.verifyIPNSignature(body, signature)) {
      console.error('❌ Invalid webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const {
      payment_id,
      payment_status,
      order_id,
      actually_paid,
      outcome_amount,
      outcome_currency
    } = req.body;

    // Find deposit record
    const deposit = await Deposit.findOne({ paymentId: payment_id });
    if (!deposit) {
      console.error('❌ Deposit not found for payment_id:', payment_id);
      res.status(404).send('Deposit not found');
      return;
    }

    console.log('🔄 Processing webhook for deposit:', deposit._id, 'Status:', payment_status);

    // Update deposit status
    deposit.status = payment_status;
    if (actually_paid) {
      deposit.actuallyPaid = actually_paid;
    }

    // If payment is finished, credit user's wallet
    if (payment_status === 'finished' && !deposit.completedAt) {
      console.log('✅ Payment finished, crediting wallet...');
      
      // Get or create user wallet
      let wallet = await Wallet.findOne({ userId: deposit.userId });
      if (!wallet) {
        wallet = await Wallet.create({
          userId: deposit.userId,
          balances: new Map(),
          addresses: new Map()
        });
      }

      // Add to user's balance
      const currentBalance = wallet.balances.get(deposit.currency) || 0;
      const newBalance = currentBalance + deposit.amount;
      wallet.balances.set(deposit.currency, newBalance);
      await wallet.save();

      // Create transaction record
      await Transaction.create({
        userId: deposit.userId,
        type: 'deposit',
        status: 'completed',
        toCurrency: deposit.currency,
        amount: deposit.amount,
        receivedAmount: deposit.amount,
        fee: 0,
        txHash: payment_id,
        description: `Deposit via NOWPayments - ${deposit.orderId}`,
        metadata: {
          depositId: deposit._id,
          paymentId: payment_id,
          payCurrency: deposit.payCurrency,
          payAmount: deposit.payAmount,
          actuallyPaid: actually_paid
        }
      });

      deposit.completedAt = new Date();
      console.log('✅ Wallet credited successfully:', {
        userId: deposit.userId,
        currency: deposit.currency,
        amount: deposit.amount,
        newBalance
      });
    }

    await deposit.save();
    res.status(200).send('OK');

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).send('Internal server error');
  }
};
