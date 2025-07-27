import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, setTokenCookie } from '../utils/jwt';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/interfaces';

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, countryCode } = req.body;

    console.log('🔄 User registration attempt:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      sendErrorResponse(res, 'User already exists with this email', 409);
      return;
    }

    // Check if phone number already exists
    if (phone) {
      const existingPhone = await User.findOne({ phone, countryCode });
      if (existingPhone) {
        console.log('❌ Phone number already exists:', phone);
        sendErrorResponse(res, 'User already exists with this phone number', 409);
        return;
      }
    }

    // Create new user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || '',
      countryCode: countryCode || '',
      isEmailVerified: false,
      isPhoneVerified: false,
      isKycVerified: false,
      role: 'user',
      isActive: true
    });

    console.log('✅ User registered successfully:', user._id);

    // Generate tokens
    const tokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: 'user'
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set HTTP-only cookies
    setTokenCookie(res, accessToken, 'access');
    setTokenCookie(res, refreshToken, 'refresh');

    // Send response (don't include sensitive data)
    sendSuccessResponse(res, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isKycVerified: user.isKycVerified,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    }, 'User registered successfully', 201);

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      sendErrorResponse(res, validationErrors.join(', '), 400);
      return;
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      sendErrorResponse(res, `${field} already exists`, 409);
      return;
    }

    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔄 Login attempt:', email);

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      sendErrorResponse(res, 'Invalid email or password', 401);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account deactivated:', email);
      sendErrorResponse(res, 'Your account has been deactivated. Please contact support.', 401);
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      sendErrorResponse(res, 'Invalid email or password', 401);
      return;
    }

    // ✅ FIXED: Update last login using findByIdAndUpdate to avoid validation issues
    await User.findByIdAndUpdate(
      user._id, 
      { lastLoginAt: new Date() }, 
      { 
        runValidators: false, // Skip validation to avoid phone field issues
        timestamps: false     // Don't update the updatedAt field automatically
      }
    );

    console.log('✅ User logged in successfully:', email);

    // Generate tokens
    const tokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set HTTP-only cookies
    setTokenCookie(res, accessToken, 'access');
    setTokenCookie(res, refreshToken, 'refresh');

    // Send response
    sendSuccessResponse(res, {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isKycVerified: user.isKycVerified,
        kycLevel: user.kycLevel, // ✅ Added KYC level
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: new Date(), // Use current date since we just updated it
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    console.error('❌ Login error:', error);
    next(error);
  }
};


// Logout user
export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear HTTP-only cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    console.log('✅ User logged out successfully');

    sendSuccessResponse(res, null, 'Logout successful');

  } catch (error) {
    console.error('❌ Logout error:', error);
    next(error);
  }
};

 // Refresh access token

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      sendErrorResponse(res, 'Refresh token is required', 401);
      return;
    }

    console.log('🔄 Refreshing access token...');

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      sendErrorResponse(res, 'User not found or inactive', 401);
      return;
    }

    // Generate new access token
    const tokenPayload = {
      userId: String(user._id),
      email: user.email,
      role: user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Set new cookies
    setTokenCookie(res, newAccessToken, 'access');
    setTokenCookie(res, newRefreshToken, 'refresh');

    console.log('✅ Token refreshed successfully for user:', user.email);

    sendSuccessResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    }, 'Token refreshed successfully');

  } catch (error: any) {
    console.error('❌ Token refresh error:', error);

    if (error.name === 'JsonWebTokenError') {
      sendErrorResponse(res, 'Invalid refresh token', 401);
    } else if (error.name === 'TokenExpiredError') {
      sendErrorResponse(res, 'Refresh token expired', 401);
    } else {
      next(error);
    }
  }
};

// Get current user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    console.log('🔄 Fetching profile for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    sendSuccessResponse(res, {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isKycVerified: user.isKycVerified,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, 'Profile retrieved successfully');

  } catch (error) {
    console.error('❌ Get profile error:', error);
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { firstName, lastName, phone, countryCode } = req.body;

    console.log('🔄 Updating profile for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    // Check if phone number is being changed and already exists
    if (phone && (phone !== user.phone || countryCode !== user.countryCode)) {
      const existingPhone = await User.findOne({ 
        phone, 
        countryCode, 
        _id: { $ne: userId } 
      });
      
      if (existingPhone) {
        sendErrorResponse(res, 'Phone number already exists', 409);
        return;
      }
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (countryCode !== undefined) user.countryCode = countryCode;

    // If phone was changed, mark as unverified
    if (phone && phone !== user.phone) {
      user.isPhoneVerified = false;
    }

    await user.save();

    console.log('✅ Profile updated successfully for user:', userId);

    sendSuccessResponse(res, {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isKycVerified: user.isKycVerified,
      role: user.role,
      isActive: user.isActive,
      updatedAt: user.updatedAt
    }, 'Profile updated successfully');

  } catch (error: any) {
    console.error('❌ Update profile error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      sendErrorResponse(res, validationErrors.join(', '), 400);
      return;
    }

    next(error);
  }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { currentPassword, newPassword } = req.body;

    console.log('🔄 Changing password for user:', userId);

    const user = await User.findById(userId).select('+password');
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      sendErrorResponse(res, 'Current password is incorrect', 400);
      return;
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      sendErrorResponse(res, 'New password must be different from current password', 400);
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed successfully for user:', userId);

    sendSuccessResponse(res, null, 'Password changed successfully');

  } catch (error) {
    console.error('❌ Change password error:', error);
    next(error);
  }
};

// Forgot password (placeholder - would integrate with email service)
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    console.log('🔄 Forgot password request for:', email);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      sendSuccessResponse(res, null, 'If an account with this email exists, a password reset link has been sent.');
      return;
    }

    if (!user.isActive) {
      sendSuccessResponse(res, null, 'If an account with this email exists, a password reset link has been sent.');
      return;
    }

    // Generate reset token (in production, store this in database with expiry)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetLink);

    console.log('🔗 Password reset token generated:', resetToken);
    console.log('✅ Password reset email would be sent to:', email);

    sendSuccessResponse(res, null, 'If an account with this email exists, a password reset link has been sent.');

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    console.log('🔄 Password reset attempt with token');

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'password_reset') {
      sendErrorResponse(res, 'Invalid reset token', 400);
      return;
    }

    const user = await User.findById(decoded.userId).select('+password');
    if (!user || !user.isActive) {
      sendErrorResponse(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      sendErrorResponse(res, 'New password must be different from current password', 400);
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully for user:', user.email);

    sendSuccessResponse(res, null, 'Password reset successfully');

  } catch (error: any) {
    console.error('❌ Reset password error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      sendErrorResponse(res, 'Invalid or expired reset token', 400);
    } else {
      next(error);
    }
  }
};

// Verify email (placeholder)
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    console.log('🔄 Email verification attempt');

    // Verify email token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'email_verification') {
      sendErrorResponse(res, 'Invalid verification token', 400);
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      sendErrorResponse(res, 'Invalid verification token', 400);
      return;
    }

    if (user.isEmailVerified) {
      sendSuccessResponse(res, null, 'Email is already verified');
      return;
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    console.log('✅ Email verified successfully for user:', user.email);

    sendSuccessResponse(res, null, 'Email verified successfully');

  } catch (error: any) {
    console.error('❌ Email verification error:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      sendErrorResponse(res, 'Invalid or expired verification token', 400);
    } else {
      next(error);
    }
  }
};

// Send email verification
export const sendEmailVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    console.log('🔄 Sending email verification for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    if (user.isEmailVerified) {
      sendSuccessResponse(res, null, 'Email is already verified');
      return;
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id, type: 'email_verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // TODO: Send verification email
    // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    // await sendEmailVerificationEmail(user.email, verificationLink);

    console.log('📧 Email verification token generated:', verificationToken);
    console.log('✅ Verification email would be sent to:', user.email);

    sendSuccessResponse(res, null, 'Verification email sent successfully');

  } catch (error) {
    console.error('❌ Send email verification error:', error);
    next(error);
  }
};

// Check authentication status
export const checkAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      sendErrorResponse(res, 'Not authenticated', 401);
      return;
    }

    sendSuccessResponse(res, {
      isAuthenticated: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    }, 'Authentication status checked');

  } catch (error) {
    console.error('❌ Check auth error:', error);
    next(error);
  }
};
