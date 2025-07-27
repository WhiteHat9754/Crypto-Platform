import mongoose, { Schema, Types } from 'mongoose';
import { ITransaction } from '../types/interfaces';

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any, // Type assertion to bypass strict checking
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'transfer', 'swap'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  fromCurrency: {
    type: String,
    uppercase: true
  },
  toCurrency: {
    type: String,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  receivedAmount: {
    type: Number,
    min: [0, 'Received amount must be positive']
  },
  fee: {
    type: Number,
    default: 0,
    min: [0, 'Fee must be positive']
  },
  txHash: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const transactionObject = ret as any;
      delete transactionObject.__v;
      return transactionObject;
    }
  }
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ txHash: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
