const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    countryCode: { type: String, required: true },
    referralCode: { type: String },
    isAdmin: { type: Boolean, default: false },

    // ✅ Wallet balances for all coins
    balance: {
      BTC: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      ETH: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      USDT: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      BNB: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      XRP: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      LTC: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      DOGE: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      TRX: { type: mongoose.Schema.Types.Decimal128, default: 0 },
      ADA: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    },

    // ✅ Wallet addresses for each coin (optional)
    walletAddress: {
      BTC: { type: String, default: '' },
      ETH: { type: String, default: '' },
      USDT: { type: String, default: '' },
      BNB: { type: String, default: '' },
      XRP: { type: String, default: '' },
      LTC: { type: String, default: '' },
      DOGE: { type: String, default: '' },
      TRX: { type: String, default: '' },
      ADA: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
