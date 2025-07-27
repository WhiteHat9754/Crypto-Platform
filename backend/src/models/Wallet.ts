import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWallet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: Types.ObjectId;
  balances: Map<string, number>;
  addresses: Map<string, string>;
  frozenBalances: Map<string, number>; // For pending withdrawals
  totalDeposited: Map<string, number>; // Track total deposits per currency
  totalWithdrawn: Map<string, number>; // Track total withdrawals per currency
  lastTransactionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // Each user can have only one wallet
  },
  balances: {
    type: Map,
    of: {
      type: Number,
      min: [0, 'Balance cannot be negative'],
      default: 0
    },
    default: new Map()
  },
  addresses: {
    type: Map,
    of: {
      type: String,
      trim: true
    },
    default: new Map()
  },
  frozenBalances: {
    type: Map,
    of: {
      type: Number,
      min: [0, 'Frozen balance cannot be negative'],
      default: 0
    },
    default: new Map()
  },
  totalDeposited: {
    type: Map,
    of: {
      type: Number,
      min: [0, 'Total deposited cannot be negative'],
      default: 0
    },
    default: new Map()
  },
  totalWithdrawn: {
    type: Map,
    of: {
      type: Number,
      min: [0, 'Total withdrawn cannot be negative'],
      default: 0
    },
    default: new Map()
  },
  lastTransactionAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const walletObject = ret as any;
      
      // Convert Maps to Objects for JSON serialization
      if (walletObject.balances) {
        walletObject.balances = Object.fromEntries(walletObject.balances);
      }
      if (walletObject.addresses) {
        walletObject.addresses = Object.fromEntries(walletObject.addresses);
      }
      if (walletObject.frozenBalances) {
        walletObject.frozenBalances = Object.fromEntries(walletObject.frozenBalances);
      }
      if (walletObject.totalDeposited) {
        walletObject.totalDeposited = Object.fromEntries(walletObject.totalDeposited);
      }
      if (walletObject.totalWithdrawn) {
        walletObject.totalWithdrawn = Object.fromEntries(walletObject.totalWithdrawn);
      }
      
      delete walletObject.__v;
      return walletObject;
    }
  }
});

// Indexes for better query performance
walletSchema.index({ userId: 1 });
walletSchema.index({ createdAt: -1 });
walletSchema.index({ lastTransactionAt: -1 });

// Instance methods
walletSchema.methods.getBalance = function(currency: string): number {
  return this.balances.get(currency.toUpperCase()) || 0;
};

walletSchema.methods.getAvailableBalance = function(currency: string): number {
  const balance = this.balances.get(currency.toUpperCase()) || 0;
  const frozen = this.frozenBalances.get(currency.toUpperCase()) || 0;
  return Math.max(0, balance - frozen);
};

walletSchema.methods.getFrozenBalance = function(currency: string): number {
  return this.frozenBalances.get(currency.toUpperCase()) || 0;
};

walletSchema.methods.addBalance = function(currency: string, amount: number): void {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const currentBalance = this.balances.get(currency.toUpperCase()) || 0;
  this.balances.set(currency.toUpperCase(), currentBalance + amount);
  
  // Update total deposited
  const totalDeposited = this.totalDeposited.get(currency.toUpperCase()) || 0;
  this.totalDeposited.set(currency.toUpperCase(), totalDeposited + amount);
  
  this.lastTransactionAt = new Date();
};

walletSchema.methods.subtractBalance = function(currency: string, amount: number): boolean {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const availableBalance = this.getAvailableBalance(currency);
  if (availableBalance < amount) {
    return false; // Insufficient balance
  }
  
  const currentBalance = this.balances.get(currency.toUpperCase()) || 0;
  this.balances.set(currency.toUpperCase(), currentBalance - amount);
  
  // Update total withdrawn
  const totalWithdrawn = this.totalWithdrawn.get(currency.toUpperCase()) || 0;
  this.totalWithdrawn.set(currency.toUpperCase(), totalWithdrawn + amount);
  
  this.lastTransactionAt = new Date();
  return true;
};

walletSchema.methods.freezeBalance = function(currency: string, amount: number): boolean {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const availableBalance = this.getAvailableBalance(currency);
  if (availableBalance < amount) {
    return false; // Insufficient available balance
  }
  
  const currentFrozen = this.frozenBalances.get(currency.toUpperCase()) || 0;
  this.frozenBalances.set(currency.toUpperCase(), currentFrozen + amount);
  
  return true;
};

walletSchema.methods.unfreezeBalance = function(currency: string, amount: number): boolean {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const currentFrozen = this.frozenBalances.get(currency.toUpperCase()) || 0;
  if (currentFrozen < amount) {
    return false; // Insufficient frozen balance
  }
  
  this.frozenBalances.set(currency.toUpperCase(), currentFrozen - amount);
  return true;
};

walletSchema.methods.setAddress = function(currency: string, address: string): void {
  if (!address || !address.trim()) {
    throw new Error('Address cannot be empty');
  }
  
  this.addresses.set(currency.toUpperCase(), address.trim());
};

walletSchema.methods.getAddress = function(currency: string): string | undefined {
  return this.addresses.get(currency.toUpperCase());
};

walletSchema.methods.getTotalPortfolioValue = function(prices: { [key: string]: number }): number {
  let totalValue = 0;
  
  for (const [currency, balance] of this.balances) {
    const price = prices[currency.toLowerCase()] || 0;
    totalValue += balance * price;
  }
  
  return totalValue;
};

// ✅ FIXED: Properly typed method with explicit this parameter
walletSchema.methods.getCurrencyList = function(this: IWallet): string[] {
  return Array.from(this.balances.keys()).filter((currency: string) => {
    const balance = this.balances.get(currency) || 0;
    return balance > 0;
  });
};


walletSchema.methods.getPortfolioSummary = function(prices: { [key: string]: number }) {
  const summary: Array<{
    currency: string;
    balance: number;
    frozenBalance: number;
    availableBalance: number;
    usdValue: number;
    price: number;
    totalDeposited: number;
    totalWithdrawn: number;
  }> = [];

  for (const [currency, balance] of this.balances) {
    const frozenBalance = this.frozenBalances.get(currency) || 0;
    const price = prices[currency.toLowerCase()] || 0;
    const totalDeposited = this.totalDeposited.get(currency) || 0;
    const totalWithdrawn = this.totalWithdrawn.get(currency) || 0;

    summary.push({
      currency,
      balance,
      frozenBalance,
      availableBalance: balance - frozenBalance,
      usdValue: balance * price,
      price,
      totalDeposited,
      totalWithdrawn
    });
  }

  return summary.sort((a, b) => b.usdValue - a.usdValue); // Sort by USD value descending
};

// Static methods
walletSchema.statics.findByUserId = function(userId: Types.ObjectId) {
  return this.findOne({ userId });
};

walletSchema.statics.findWalletsWithBalance = function(currency: string, minAmount: number = 0) {
  const balanceKey = `balances.${currency.toUpperCase()}`;
  return this.find({
    [balanceKey]: { $gt: minAmount }
  }).populate('userId', 'firstName lastName email');
};

walletSchema.statics.getTotalPlatformBalance = async function(currency: string) {
  const result = await this.aggregate([
    { $match: { [`balances.${currency.toUpperCase()}`]: { $exists: true } } },
    { $group: { _id: null, total: { $sum: `$balances.${currency.toUpperCase()}` } } }
  ]);
  
  return result[0]?.total || 0;
};

// Virtual for total portfolio value (requires prices to be passed)
walletSchema.virtual('isEmpty').get(function() {
  for (const [, balance] of this.balances) {
    if (balance > 0) return false;
  }
  return true;
});

// Pre-save middleware
walletSchema.pre('save', function(next) {
  // Clean up zero balances to keep the document clean
  for (const [currency, balance] of this.balances) {
    if (balance === 0) {
      this.balances.delete(currency);
    }
  }
  
  // Clean up zero frozen balances
  for (const [currency, frozen] of this.frozenBalances) {
    if (frozen === 0) {
      this.frozenBalances.delete(currency);
    }
  }
  
  next();
});

// Post-save middleware for logging
walletSchema.post('save', function(doc) {
  console.log(`💰 Wallet updated for user: ${doc.userId}`);
});

export default mongoose.model<IWallet>('Wallet', walletSchema);
