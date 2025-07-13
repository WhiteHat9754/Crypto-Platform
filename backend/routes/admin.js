const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment'); // or Transaction
const { verifyAdmin } = require('../middleware/authMiddleware');

// ✅ Get all users with balances
router.get('/users', verifyAdmin, async (req, res) => {
  const users = await User.find({}, '-password'); // exclude passwords
  res.json(users);
});

// ✅ Get pending withdrawals
router.get('/withdrawals/pending', verifyAdmin, async (req, res) => {
  const pending = await Payment.find({ status: 'pending' });
  res.json(pending);
});

// ✅ Approve/Reject withdrawal
router.post('/withdrawals/:id/confirm', verifyAdmin, async (req, res) => {
  const { status } = req.body; // status: 'approved' or 'rejected'
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Withdrawal not found' });

  payment.status = status;
  await payment.save();

  res.json({ message: `Withdrawal ${status}` });
});

module.exports = router;
