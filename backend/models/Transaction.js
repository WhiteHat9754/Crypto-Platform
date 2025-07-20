const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer', 'swap'] }, // 🆕 Added 'swap'
  currency: { type: String }, // For deposit/withdraw/transfer
  fromCoin: { type: String, default: '' }, // 🆕 For swap
  toCoin: { type: String, default: '' },   // 🆕 For swap
  receivedAmount: { type: Number, default: 0 }, // 🆕 For swap
  amount: { type: Number },
  address: { type: String, default: '' },
  invoiceUrl: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  txHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
