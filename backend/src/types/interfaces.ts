import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';

// ✅ FIXED: Simple approach without generic base
export type AuthenticatedRequest = Request & {
  user?: IUser | IAdmin;
};

export type UserAuthenticatedRequest = Request & {
  user?: IUser;
};

export type AdminAuthenticatedRequest = Request & {
  user?: IAdmin;
};

// ✅ JWT Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ✅ User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ✅ Admin interface
export interface IAdmin extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ✅ Wallet interface
export interface IWallet extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balances: Map<string, number>;
  addresses: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Transaction interface
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'swap';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fromCurrency?: string;
  toCurrency?: string;
  amount: number;
  receivedAmount?: number;
  fee?: number;
  txHash?: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Withdrawal interface
export interface IWithdrawal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currency: string;
  amount: number;
  fee: number;
  toAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  txHash?: string;
  failureReason?: string;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  adminNotes?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Deposit interface
export interface IDeposit extends Document {
  _id: Types.ObjectId;
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

// ✅ JWT Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ✅ API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  validationErrors?: Array<{ field: string; message: string }>; // ✅ ADD THIS
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: PaginationMeta;
}

// ✅ NOWPayments interfaces
export interface NOWPaymentsConfig {
  apiKey: string;
  apiUrl: string;
  ipnSecret: string;
}

export interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  payment_url: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  actually_paid: number;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
}

// ✅ Dashboard stats interfaces
export interface DashboardStats {
  users: {
    total: number;
    inactive: number;
    newToday: number;
  };
  deposits: {
    total: number;
    completed: number;
    pending: number;
  };
  withdrawals: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  platform: {
    totalBalance: number;
    currencyBalances: { [key: string]: number };
  };
}

// ✅ Other request interfaces
export interface ProcessWithdrawalRequest {
  action: 'approve' | 'reject' | 'processing';
  txHash?: string;
  failureReason?: string;
  adminNotes?: string;
}

export interface UpdatePriorityRequest {
  priority: 'low' | 'medium' | 'high';
}

export interface AdjustBalanceRequest {
  currency: string;
  amount: number;
  type: 'add' | 'subtract';
  reason: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface TransferRequest {
  recipientEmail: string;
  currency: string;
  amount: number;
}

export interface SwapRequest {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
}

// ✅ Filter interfaces
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WithdrawalFilters {
  page?: number;
  limit?: number;
  status?: string;
  currency?: string;
  priority?: string;
  processedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  currency?: string;
  status?: string;
}

// ✅ KYC-related interfaces

export interface IKycDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kycVerificationId: Types.ObjectId;
  documentType: 'passport' | 'driver_license' | 'national_id' | 'utility_bill' | 'bank_statement';
  documentNumber?: string;
  frontImageUrl: string;
  backImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  expiryDate?: Date;
  extractedData?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  requiresBackImage(): boolean;
}

export interface IKycVerification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  level: 'basic' | 'intermediate' | 'advanced';
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  countryOfResidence: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documents: Types.ObjectId[];
  verificationMethod: 'manual' | 'automated' | 'video_call';
  riskScore?: number;
  complianceNotes?: string;
  submittedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  dailyLimit: number;
  monthlyLimit: number;
  yearlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  getRemainingLimits(): { daily: number; monthly: number; yearly: number };
  canPerformTransaction(amount: number): boolean;
  getRequiredDocuments(): string[];
}

// ✅ KYC Request interfaces
export interface KycSubmissionRequest {
  level: 'basic' | 'intermediate' | 'advanced';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documents: {
    type: 'passport' | 'driver_license' | 'national_id' | 'utility_bill' | 'bank_statement';
    number?: string;
    frontImage: string;
    backImage?: string;
    expiryDate?: string;
  }[];
}

export interface KycReviewRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  complianceNotes?: string;
  riskScore?: number;
  limits?: {
    dailyLimit: number;
    monthlyLimit: number;
    yearlyLimit: number;
  };
}

export interface KycFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
  level?: 'basic' | 'intermediate' | 'advanced';
  country?: string;
  riskScore?: 'low' | 'medium' | 'high';
  dateFrom?: string;
  dateTo?: string;
  reviewedBy?: string;
}

export interface KycStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  expired: number;
  byLevel: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  byCountry: { [country: string]: number };
  averageProcessingTime: number;
  approvalRate: number;
}

// ✅ Update existing IUser interface to include KYC reference
export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  kycLevel?: 'basic' | 'intermediate' | 'advanced'; // ✅ ADD THIS
  kycVerificationId?: Types.ObjectId; // ✅ ADD THIS - reference to IKycVerification
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ✅ KYC limits interface
export interface KycLimits {
  level: 'basic' | 'intermediate' | 'advanced';
  dailyLimit: number;
  monthlyLimit: number;
  yearlyLimit: number;
  features: {
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    maxWithdrawalAmount: number;
    requiresManualReview: boolean;
  };
}

// ✅ Document upload interface
export interface DocumentUploadRequest {
  userId: string;
  documentType: 'passport' | 'driver_license' | 'national_id' | 'utility_bill' | 'bank_statement';
  documentNumber?: string;
  frontImage: string; // Base64 or file upload
  backImage?: string;
  expiryDate?: string;
}

// ✅ KYC status response interface
export interface KycStatusResponse {
  userId: string;
  kycLevel: 'basic' | 'intermediate' | 'advanced' | null;
  kycStatus: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired' | 'not_started';
  limits: KycLimits;
  requiredDocuments: string[];
  submittedDocuments: {
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
  }[];
  nextSteps?: string[];
  estimatedProcessingTime?: string;
}