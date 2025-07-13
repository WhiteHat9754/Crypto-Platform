const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');

exports.createPayment = async (req, res) => {
  const userId = req.session.userId;
  const { currency, amount } = req.body;

  console.log('✅ Session userId:', userId);

  if (!userId) {
    console.log('❌ Unauthorized');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('✅ Sending payment request to NowPayments...');
    const nowRes = await axios.post(
      'https://api.nowpayments.io/v1/payment',
      {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        order_id: `${userId}_${Date.now()}`,
        ipn_callback_url: 'https://yourdomain.com/api/payments/webhook',
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ NowPayments response:', nowRes.data);

    const { pay_address, pay_amount, payment_id } = nowRes.data;

    if (!pay_address) {
      console.log('❌ pay_address missing!');
      return res.status(500).json({ message: 'Failed to get payment address.' });
    }

    const tx = new Transaction({
      userId,
      type: 'deposit',
      currency,
      amount: pay_amount,
      address: pay_address,
      paymentId: payment_id,
      status: 'pending',
    });

    await tx.save();
    console.log('✅ Transaction saved:', tx);

    res.json({
      message: 'Payment created',
      transaction: tx,
      address: pay_address,
      amount: pay_amount,
    });
  } catch (err) {
    console.error('❌ NowPayments error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to create payment with NowPayments.' });
  }
};

exports.handleWebhook = async (req, res) => {
  const { payment_id, payment_status, pay_currency } = req.body;

  console.log('✅ NOWPayments webhook received:', req.body);

  const tx = await Transaction.findOne({ paymentId: payment_id });
  if (!tx) {
    console.log('❌ No matching transaction found.');
    return res.status(404).json({ message: 'Transaction not found' });
  }

  if (payment_status === 'finished') {
    tx.status = 'completed';
    await tx.save();

    await User.findByIdAndUpdate(tx.userId, {
      $inc: { [`balance.${tx.currency}`]: tx.amount },
    });

    console.log(`✅ Deposit completed: ${pay_currency} ${tx.amount}`);
  }

  res.sendStatus(200);
};
