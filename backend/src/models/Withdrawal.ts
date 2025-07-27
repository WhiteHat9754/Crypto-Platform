import mongoose, { Schema, Types } from 'mongoose';

export interface IWithdrawal extends mongoose.Document {
  userId: Types.ObjectId;
  currency: string;
  amount: number;
  fee: number;
  toAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  txHash?: string;
  failureReason?: string;
  processedAt?: Date;
  processedBy?: Types.ObjectId; // Admin who processed it
  adminNotes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
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
  fee: {
    type: Number,
    required: true,
    min: [0, 'Fee must be positive']
  },
  toAddress: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  txHash: {
    type: String,
    trim: true
  },
  failureReason: {
    type: String,
    trim: true
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  } as any,
  adminNotes: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const withdrawalObject = ret as any;
      delete withdrawalObject.__v;
      return withdrawalObject;
    }
  }
});

// Indexes
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ currency: 1 });
withdrawalSchema.index({ priority: 1, createdAt: 1 });
withdrawalSchema.index({ processedBy: 1 });

export default mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);
