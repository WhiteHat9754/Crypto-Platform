import { Response, NextFunction } from 'express';
import User from '../models/User';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responses';
import { AuthenticatedRequest } from '../types/interfaces';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    sendSuccessResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    sendErrorResponse(res, 'Failed to get profile', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { firstName, lastName, phone, countryCode } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, countryCode },
      { new: true, runValidators: true }
    );

    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    sendSuccessResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      sendErrorResponse(res, 'User not found', 404);
      return;
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      sendErrorResponse(res, 'Current password is incorrect', 400);
      return;
    }

    user.password = newPassword;
    await user.save();

    sendSuccessResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    await User.findByIdAndUpdate(userId, { isActive: false });

    sendSuccessResponse(res, null, 'Account deactivated successfully');
  } catch (error) {
    next(error);
  }
};
