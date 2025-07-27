import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, 'Min 8 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  countryCode: z.string().min(1, 'Please select a country code'),
  referralCode: z.string().optional(), // Optional field
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Export the inferred types for use in components
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
