const axios = require('axios');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ✅ Get balance
exports.getBalance = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId);
  res.json({ balance: user.balance });
};

// ✅ Get transactions
exports.getTransactions = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
  res.json({ transactions });
};

// ✅ REAL createDeposit with NowPayments
exports.createDeposit = async (req, res) => {
  const userId = req.session.userId;
  const { currency, amount } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // ✅ Call NowPayments API
    const nowRes = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      {
        price_amount: amount,
        price_currency: 'usd',   // Your base fiat
        pay_currency: currency,  // e.g., 'btc'
        order_id: `${userId}_${Date.now()}`,
        ipn_callback_url: 'https://yourdomain.com/api/wallet/nowpayments-webhook',
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const { pay_address, pay_amount, invoice_url, payment_id } = nowRes.data;

    // ✅ Save real address + invoice + paymentId
    const tx = new Transaction({
      userId,
      type: 'deposit',
      currency,
      amount: pay_amount,
      address: pay_address,
      invoiceUrl: invoice_url,
      paymentId: payment_id,
      status: 'pending',
    });

    await tx.save();

    res.json({
      message: 'Deposit started',
      transaction: tx,
      address: pay_address,
      amount: pay_amount,
      invoiceUrl: invoice_url,
    });
  } catch (err) {
    console.error('NowPayments error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
};

// ✅ Webhook to mark deposit as completed
exports.nowPaymentsWebhook = async (req, res) => {
  const { payment_id, payment_status, pay_currency } = req.body;

  console.log('Webhook received:', req.body);

  const tx = await Transaction.findOne({ paymentId: payment_id });
  if (!tx) {
    console.log('No matching transaction found.');
    return res.status(404).json({ message: 'Transaction not found' });
  }

  if (payment_status === 'finished') {
    tx.status = 'completed';
    await tx.save();

    await User.findByIdAndUpdate(tx.userId, {
      $inc: { [`balance.${tx.currency}`]: tx.amount },
    });

    console.log(`Deposit completed: ${pay_currency} ${tx.amount}`);
  }

  res.json({ message: 'OK' });
};

// ✅ Withdraw stays the same
exports.withdraw = async (req, res) => {
  const userId = req.session.userId;  // or req.user.id if using JWT
  const { currency, amount, toAddress } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId);

  if (user.balance[currency] < amount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  // ✅ Deduct immediately so user can't double spend
  user.balance[currency] -= amount;
  await user.save();

  // ✅ Save the withdrawal as pending
  const tx = new Transaction({
    userId,
    type: 'withdraw',
    currency,
    amount,
    address: toAddress,
    status: 'pending',
    txHash: '',  // Will be filled after admin approval
  });

  await tx.save();

  res.json({
    message: 'Withdrawal requested. Awaiting admin approval.',
    transaction: tx
  });
};
