const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentId: String,
  amountUSD: Number,
  currency: String,
  status: String,
  orderId: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
