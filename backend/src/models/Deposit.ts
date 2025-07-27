import mongoose, { Schema, Types } from 'mongoose';

export interface IDeposit extends mongoose.Document {
  userId: Types.ObjectId;
  orderId: string;
  paymentId: string;
  currency: string;
  amount: number;
  usdAmount: number;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  status: 'waiting' | 'confirming' | 'confirmed' | 'finished' | 'failed' | 'refunded' | 'expired';
  actuallyPaid?: number;
  txHash?: string;
  confirmations?: number;
  paymentUrl: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const depositSchema = new Schema<IDeposit>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  usdAmount: {
    type: Number,
    required: true,
    min: [0, 'USD amount must be positive']
  },
  payAddress: {
    type: String,
    required: true
  },
  payAmount: {
    type: Number,
    required: true,
    min: [0, 'Pay amount must be positive']
  },
  payCurrency: {
    type: String,
    required: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['waiting', 'confirming', 'confirmed', 'finished', 'failed', 'refunded', 'expired'],
    default: 'waiting'
  },
  actuallyPaid: {
    type: Number,
    min: [0, 'Actually paid must be positive']
  },
  txHash: {
    type: String
  },
  confirmations: {
    type: Number,
    default: 0
  },
  paymentUrl: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const depositObject = ret as any;
      delete depositObject.__v;
      return depositObject;
    }
  }
});

// Indexes
depositSchema.index({ userId: 1, createdAt: -1 });
depositSchema.index({ orderId: 1 });
depositSchema.index({ paymentId: 1 });
depositSchema.index({ status: 1 });
depositSchema.index({ createdAt: -1 });

export default mongoose.model<IDeposit>('Deposit', depositSchema);
