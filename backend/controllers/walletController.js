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

// ✅ Create deposit using NowPayments
exports.createDeposit = async (req, res) => {
  const userId = req.session.userId;
  const { currency, amount } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const nowRes = await axios.post(
      'https://api.nowpayments.io/v1/invoice',
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        order_id: `${userId}_${Date.now()}`,
        ipn_callback_url: 'https://yourdomain.com/api/wallet/nowpayments-webhook',
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    const { pay_address, pay_amount, invoice_url, payment_id } = nowRes.data;

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

// ✅ Webhook to confirm deposit
exports.nowPaymentsWebhook = async (req, res) => {
  const { payment_id, payment_status, pay_currency } = req.body;

  const tx = await Transaction.findOne({ paymentId: payment_id });
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });

  if (payment_status === 'finished') {
    tx.status = 'completed';
    await tx.save();

    await User.findByIdAndUpdate(tx.userId, {
      $inc: { [`balance.${tx.currency}`]: tx.amount },
    });
  }

  res.json({ message: 'OK' });
};

// ✅ Withdraw
exports.withdraw = async (req, res) => {
  const userId = req.session.userId;
  const { currency, amount, toAddress } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId);
  if (user.balance[currency] < amount)
    return res.status(400).json({ message: 'Insufficient balance' });

  user.balance[currency] -= amount;
  await user.save();

  const tx = new Transaction({
    userId,
    type: 'withdraw',
    currency,
    amount,
    address: toAddress,
    status: 'pending',
  });

  await tx.save();

  res.json({ message: 'Withdrawal requested. Awaiting admin approval.', transaction: tx });
};

// ✅ Transfer crypto internally (user → user)
exports.transfer = async (req, res) => {
  const userId = req.session.userId;
  const { toUsername, currency, amount } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const sender = await User.findById(userId);
  const receiver = await User.findOne({ username: toUsername });

  if (!receiver) return res.status(404).json({ message: 'Recipient not found' });
  if (sender.balance[currency] < amount)
    return res.status(400).json({ message: 'Insufficient balance' });

  sender.balance[currency] -= amount;
  receiver.balance[currency] = (receiver.balance[currency] || 0) + amount;

  await sender.save();
  await receiver.save();

  const tx = new Transaction({
    userId,
    type: 'transfer',
    currency,
    amount,
    status: 'completed',
    address: receiver._id.toString()
  });

  await tx.save();

  res.json({ message: 'Transfer successful', transaction: tx });
};

// ✅ Swap crypto within wallet
exports.swap = async (req, res) => {
  const userId = req.session.userId;
  const { fromCoin, toCoin, amount } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!["BTC", "ETH", "USDT"].includes(fromCoin) || !["BTC", "ETH", "USDT"].includes(toCoin)) {
    return res.status(400).json({ message: 'Unsupported coin' });
  }

  if (fromCoin === toCoin) {
    return res.status(400).json({ message: 'Cannot swap same coin' });
  }

  const baseRates = {
    BTC: { ETH: 15, USDT: 30000 },
    ETH: { BTC: 0.066, USDT: 2000 },
    USDT: { BTC: 0.000033, ETH: 0.0005 },
  };

  const rate = baseRates[fromCoin][toCoin];
  const feeMultiplier = 0.995;
  const finalRate = rate * feeMultiplier;

  if (user.balance[fromCoin] < amount)
    return res.status(400).json({ message: 'Insufficient balance' });

  const received = amount * finalRate;

  user.balance[fromCoin] -= amount;
  user.balance[toCoin] = (user.balance[toCoin] || 0) + received;

  await user.save();

  const tx = new Transaction({
    userId,
    type: 'swap',
    fromCoin,
    toCoin,
    amount,
    receivedAmount: received,
    status: 'completed',
  });

  await tx.save();

  res.json({ message: 'Swap successful', receivedAmount: received, transaction: tx });
};
