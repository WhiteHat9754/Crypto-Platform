import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  kycLevel?: 'basic' | 'intermediate' | 'advanced'; // ✅ KYC Integration
  kycVerificationId?: mongoose.Types.ObjectId; // ✅ KYC Integration
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: function(value: string) {
        // Allow empty strings, but validate non-empty values
        if (!value || value.trim() === '') return true;
        return /^\+?[\d\s\-\(\)]+$/.test(value);
      },
      message: 'Please provide a valid phone number'
    }
  },
  countryCode: {
    type: String,
    trim: true,
    default: '',
    maxlength: [5, 'Country code cannot exceed 5 characters']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isKycVerified: {
    type: Boolean,
    default: false
  },
  // ✅ KYC Integration Fields
  kycLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced'],
    default: undefined
  },
  kycVerificationId: {
    type: Schema.Types.ObjectId,
    ref: 'KycVerification',
    default: undefined
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'vip'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const userObject = ret as any;
      delete userObject.password;
      delete userObject.__v;
      return userObject;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      const userObject = ret as any;
      delete userObject.password;
      delete userObject.__v;
      return userObject;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1, countryCode: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isKycVerified: 1 }); // ✅ KYC Index
userSchema.index({ kycLevel: 1 }); // ✅ KYC Index

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// ✅ KYC-related instance methods
userSchema.methods.getKycLimits = async function() {
  if (!this.isKycVerified || !this.kycVerificationId) {
    return { daily: 0, monthly: 0, yearly: 0 };
  }
  
  const KycVerification = mongoose.model('KycVerification');
  const kyc = await KycVerification.findById(this.kycVerificationId);
  
  return kyc ? {
    daily: kyc.dailyLimit,
    monthly: kyc.monthlyLimit,
    yearly: kyc.yearlyLimit
  } : { daily: 0, monthly: 0, yearly: 0 };
};

userSchema.methods.canPerformTransaction = async function(amount: number): Promise<boolean> {
  if (!this.isActive) return false;
  if (!this.isKycVerified) return amount <= 100; // Basic limit without KYC
  
  const limits = await this.getKycLimits();
  return amount <= limits.daily;
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find KYC verified users
userSchema.statics.findKycVerifiedUsers = function() {
  return this.find({ 
    isActive: true, 
    isKycVerified: true 
  });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ✅ Virtual for KYC status summary
userSchema.virtual('kycStatus').get(function() {
  if (!this.isKycVerified) return 'not_verified';
  return `${this.kycLevel}_verified`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser>('User', userSchema);
