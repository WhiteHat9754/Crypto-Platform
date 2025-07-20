const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Simulated prices — replace with real API or DB later
const prices = {
  BTC: 30000,
  ETH: 2000,
  USDT: 1,
  SOL: 30,
  DOGE: 0.1,
};

// 🔁 Estimate route
router.post('/estimate-swap', async (req, res) => {
  const { fromCoin, toCoin, amount, type } = req.body;

  if (!fromCoin || !toCoin || !amount || !type) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const fromPrice = prices[fromCoin];
  const toPrice = prices[toCoin];
  const feeMultiplier = 0.99;

  if (!fromPrice || !toPrice) {
    return res.status(400).json({ message: 'Unsupported coin' });
  }

  let estimated;
  if (type === 'crypto') {
    estimated = (amount * fromPrice * feeMultiplier) / toPrice;
  } else if (type === 'usd') {
    estimated = (amount * feeMultiplier) / toPrice;
  } else {
    return res.status(400).json({ message: 'Invalid type' });
  }

  return res.json({ estimatedAmount: parseFloat(estimated.toFixed(8)) });
});

// 🔁 Actual swap
router.post('/swap', async (req, res) => {
  const { fromCoin, toCoin, amount, type } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  if (!fromCoin || !toCoin || !amount || !type) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const user = await User.findById(userId);
  if (!user || !user.balance[fromCoin]) {
    return res.status(400).json({ message: 'Insufficient balance or missing balance data' });
  }

  const fromPrice = prices[fromCoin];
  const toPrice = prices[toCoin];
  const feeMultiplier = 0.99;

  let estimated;

  if (type === 'crypto') {
    if (user.balance[fromCoin] < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    estimated = (amount * fromPrice * feeMultiplier) / toPrice;
    user.balance[fromCoin] -= amount;
  } else {
    const cryptoAmount = (amount / fromPrice);
    if (user.balance[fromCoin] < cryptoAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    estimated = (amount * feeMultiplier) / toPrice;
    user.balance[fromCoin] -= cryptoAmount;
  }

  user.balance[toCoin] = (user.balance[toCoin] || 0) + estimated;

  await user.save();

  const tx = new Transaction({
    userId,
    type: 'swap',
    currency: `${fromCoin}->${toCoin}`,
    amount: estimated,
    status: 'completed',
  });

  await tx.save();

  return res.json({ message: 'Swap successful', estimated });
});

module.exports = router;
