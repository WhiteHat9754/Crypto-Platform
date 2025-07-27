import Joi from 'joi';

export const registerValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).required().trim(),
  lastName: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(8).max(128).required(),
  phone: Joi.string().min(10).max(15).required().trim(),
  countryCode: Joi.string().required().trim(),
  referralCode: Joi.string().optional().trim().uppercase()
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required()
});

export const updateProfileValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().trim(),
  lastName: Joi.string().min(2).max(50).optional().trim(),
  phone: Joi.string().min(10).max(15).optional().trim(),
  countryCode: Joi.string().optional().trim()
});

export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

export const withdrawalValidation = Joi.object({
  currency: Joi.string().uppercase().required(),
  amount: Joi.number().positive().required(),
  toAddress: Joi.string().required().trim()
});
