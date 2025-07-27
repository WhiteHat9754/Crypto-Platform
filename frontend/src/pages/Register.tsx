import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterValues } from '../features/auth/schema';
import { Input } from '../components/ui/input';
import { FloatLabel } from '../components/ui/FloatLabel';
import { PasswordStrength } from '../features/auth/PasswordStrength';
import { Eye, EyeOff, UserPlus, Phone, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';

// Country codes data
const countryCodes = [
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+1', country: 'CA', name: 'Canada' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
  { code: '+41', country: 'CH', name: 'Switzerland' },
];

export default function Register() {
  const navigate = useNavigate();
  const { loginSession } = useSession();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = 
    useForm<RegisterValues>({ 
      resolver: zodResolver(registerSchema),
      mode: 'onChange'
    });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const passwordValue = watch('password', '');

  // Debug: Watch form values
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('📝 Register form values:', value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Debug: Watch form errors
  useEffect(() => {
    console.log('❌ Register validation errors:', errors);
    console.log('✅ Register form is valid:', Object.keys(errors).length === 0);
  }, [errors]);

  const onSubmit = async (data: RegisterValues) => {
    console.log('🚀 Register onSubmit function called!');
    console.log('📋 Register form data:', data);
    
    try {
      setApiError('');
      setSuccessMessage('');
      console.log('📤 Making register API request...');

      // Transform data to match backend expectations
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        countryCode: data.countryCode,
        referralCode: data.referralCode || undefined,
      };

      console.log('📋 Sending registration data:', registrationData);

      const response = await axios.post('http://localhost:5000/api/auth/register', registrationData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Register API Response:', response);
      
      if (response.status === 201 && response.data.success) {
        setSuccessMessage('Registration successful! Please check your email for verification.');
        console.log('🎉 Registration successful!');
        
        // ✅ Update session context if user data is returned
        if (response.data.data?.user) {
          loginSession(response.data.data.user);
          console.log('✅ Session updated with new user:', response.data.data.user);
        }
        
        // Redirect after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response);
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setApiError('Invalid registration data. Please check your inputs.');
      } else if (error.code === 'ERR_NETWORK') {
        setApiError('Network error. Make sure backend is running on http://localhost:5000');
      } else if (error.message.includes('CORS')) {
        setApiError('CORS error. Please check backend CORS configuration.');
      } else {
        setApiError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4">
            Join <span className="text-yellow-400">CryptoPlatform</span>
          </h1>
          <p className="text-xl text-amber-200 mb-8 leading-relaxed">
            Start your crypto journey with advanced trading tools, secure storage, and real-time market insights.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-amber-200">Join thousands of traders</span>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Register Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-900 overflow-y-auto"
      >
        <div className="w-full max-w-md my-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-yellow-200/50 dark:border-amber-700/50"
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 bg-white rounded-md flex items-center justify-center"
                  >
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                  </motion.div>
                </motion.div>
                
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl blur-md"
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                Create Account
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Join the future of digital finance
              </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
              >
                {successMessage}
              </motion.div>
            )}

            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
              >
                {apiError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Personal Information Section */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-yellow-200 dark:border-amber-600 pb-2">
                  Personal Information
                </h3>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      id="firstName"
                      type="text"
                      placeholder=" "
                      {...register('firstName')}
                      className={`${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                    />
                    <FloatLabel label="First Name" htmlFor="firstName" />
                    {errors.firstName && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors.firstName.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id="lastName"
                      type="text"
                      placeholder=" "
                      {...register('lastName')}
                      className={`${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                    />
                    <FloatLabel label="Last Name" htmlFor="lastName" />
                    {errors.lastName && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors.lastName.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder=" "
                    {...register('email')}
                    className={`${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                  />
                  <FloatLabel label="Email Address" htmlFor="email" />
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-yellow-200 dark:border-amber-600 pb-2">
                  Contact Information
                </h3>

                {/* Country Code & Phone Number */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <select
                      id="countryCode"
                      {...register('countryCode')}
                      className={`w-full rounded-md border bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none border-yellow-300/60 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-amber-600/60 dark:text-slate-100 appearance-none cursor-pointer ${errors.countryCode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="" disabled>Select Code</option>
                      {countryCodes.map((country, index) => (
                        <option key={index} value={country.code}>
                          {country.code} ({country.country})
                        </option>
                      ))}
                    </select>
                    
                    {/* Dropdown Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {errors.countryCode && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors.countryCode.message}
                      </motion.p>
                    )}
                  </div>

                  <div className="relative col-span-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder=" "
                      {...register('phone')}
                      className={`pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                    <label
                      htmlFor="phone"
                      className="pointer-events-none absolute left-10 top-2.5 origin-[0] -translate-y-4 scale-75 transform text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-yellow-500 dark:text-slate-400"
                    >
                      Phone Number
                    </label>
                    {errors.phone && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-yellow-200 dark:border-amber-600 pb-2">
                  Security
                </h3>

                {/* Password */}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    {...register('password')}
                    className={`pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                  />
                  <FloatLabel label="Password" htmlFor="password" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-yellow-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {passwordValue && <PasswordStrength value={passwordValue} />}
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder=" "
                    {...register('confirmPassword')}
                    className={`pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                  />
                  <FloatLabel label="Confirm Password" htmlFor="confirmPassword" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-yellow-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Referral Code (Optional) */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder=" "
                    {...register('referralCode')}
                    className="border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500"
                  />
                  <FloatLabel label="Referral Code (Optional)" htmlFor="referralCode" />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  required
                  className="mt-1 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-yellow-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-yellow-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
