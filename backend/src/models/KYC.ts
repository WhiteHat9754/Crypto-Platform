import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKycVerification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  level: 'basic' | 'intermediate' | 'advanced';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  countryOfResidence: string;
  
  // Address Information
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Identity Documents
  documents: Types.ObjectId[]; // References to IKycDocument
  
  // Verification Details
  verificationMethod: 'manual' | 'automated' | 'video_call';
  riskScore?: number;
  complianceNotes?: string;
  
  // Processing Information
  submittedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Limits based on KYC level
  dailyLimit: number;
  monthlyLimit: number;
  yearlyLimit: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const kycVerificationSchema = new Schema<IKycVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // Each user can have only one KYC verification
  },
  level: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    required: [true, 'KYC level is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value: Date) {
        const age = new Date().getFullYear() - value.getFullYear();
        return age >= 18 && age <= 120;
      },
      message: 'User must be between 18 and 120 years old'
    }
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    trim: true,
    maxlength: [50, 'Nationality cannot exceed 50 characters']
  },
  countryOfResidence: {
    type: String,
    required: [true, 'Country of residence is required'],
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State/Province is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
  },
  
  // Identity Documents
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'KycDocument'
  }],
  
  // Verification Details
  verificationMethod: {
    type: String,
    enum: ['manual', 'automated', 'video_call'],
    default: 'manual'
  },
  riskScore: {
    type: Number,
    min: [0, 'Risk score cannot be negative'],
    max: [100, 'Risk score cannot exceed 100']
  },
  complianceNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Compliance notes cannot exceed 1000 characters']
  },
  
  // Processing Information
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Limits based on KYC level
  dailyLimit: {
    type: Number,
    required: true,
    min: [0, 'Daily limit cannot be negative'],
    default: function() {
      const limits = {
        basic: 1000,
        intermediate: 10000,
        advanced: 100000
      };
      return limits[this.level as keyof typeof limits] || 1000;
    }
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: [0, 'Monthly limit cannot be negative'],
    default: function() {
      const limits = {
        basic: 10000,
        intermediate: 100000,
        advanced: 1000000
      };
      return limits[this.level as keyof typeof limits] || 10000;
    }
  },
  yearlyLimit: {
    type: Number,
    required: true,
    min: [0, 'Yearly limit cannot be negative'],
    default: function() {
      const limits = {
        basic: 50000,
        intermediate: 500000,
        advanced: 5000000
      };
      return limits[this.level as keyof typeof limits] || 50000;
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const kycObject = ret as any;
      delete kycObject.__v;
      return kycObject;
    }
  }
});

// Indexes for better query performance
kycVerificationSchema.index({ userId: 1 });
kycVerificationSchema.index({ status: 1 });
kycVerificationSchema.index({ level: 1 });
kycVerificationSchema.index({ countryOfResidence: 1 });
kycVerificationSchema.index({ submittedAt: -1 });
kycVerificationSchema.index({ reviewedBy: 1 });
kycVerificationSchema.index({ riskScore: 1 });

// Instance methods
kycVerificationSchema.methods.isExpired = function(): boolean {
  if (this.status !== 'approved') return false;
  
  // KYC expires after 2 years
  const expiryDate = new Date(this.approvedAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  
  return new Date() > expiryDate;
};

kycVerificationSchema.methods.getRemainingLimits = function(): { daily: number; monthly: number; yearly: number } {
  // This would be calculated based on user's transaction history
  // For now, returning full limits (to be implemented with transaction tracking)
  return {
    daily: this.dailyLimit,
    monthly: this.monthlyLimit,
    yearly: this.yearlyLimit
  };
};

kycVerificationSchema.methods.canPerformTransaction = function(amount: number): boolean {
  if (this.status !== 'approved') return false;
  if (this.isExpired()) return false;
  
  const remainingLimits = this.getRemainingLimits();
  return amount <= remainingLimits.daily;
};

kycVerificationSchema.methods.getRequiredDocuments = function(this: IKycVerification): string[] {
  const documentRequirements: {
    basic: string[];
    intermediate: string[];
    advanced: string[];
  } = {
    basic: ['national_id', 'utility_bill'],
    intermediate: ['passport', 'bank_statement'],
    advanced: ['passport', 'bank_statement', 'utility_bill']
  };
  
  // ✅ FIXED: Type assertion to ensure this.level is a valid key
  return documentRequirements[this.level as keyof typeof documentRequirements] || [];
};

// Static methods
kycVerificationSchema.statics.findByUserId = function(userId: Types.ObjectId) {
  return this.findOne({ userId });
};

kycVerificationSchema.statics.findPendingReviews = function() {
  return this.find({ 
    status: { $in: ['pending', 'in_review'] } 
  }).populate('userId', 'firstName lastName email');
};

kycVerificationSchema.statics.getKycStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const levelStats = await this.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return { statusStats: stats, levelStats };
};

// Pre-save middleware
kycVerificationSchema.pre('save', function(next) {
  // Auto-set review timestamps
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'in_review':
        if (!this.reviewedAt) this.reviewedAt = now;
        break;
      case 'approved':
        this.approvedAt = now;
        this.rejectedAt = undefined;
        break;
      case 'rejected':
        this.rejectedAt = now;
        this.approvedAt = undefined;
        break;
    }
  }
  
  next();
});

// Post-save middleware
kycVerificationSchema.post('save', async function(doc) {
  // Update user's KYC status
  if (doc.status === 'approved') {
    await mongoose.model('User').updateOne(
      { _id: doc.userId },
      { 
        isKycVerified: true,
        kycLevel: doc.level,
        kycVerificationId: doc._id
      }
    );
    console.log(`✅ KYC approved for user: ${doc.userId}`);
  } else if (doc.status === 'rejected') {
    await mongoose.model('User').updateOne(
      { _id: doc.userId },
      { 
        isKycVerified: false,
        kycLevel: undefined,
        kycVerificationId: undefined
      }
    );
    console.log(`❌ KYC rejected for user: ${doc.userId}`);
  }
});

export default mongoose.model<IKycVerification>('KycVerification', kycVerificationSchema);
