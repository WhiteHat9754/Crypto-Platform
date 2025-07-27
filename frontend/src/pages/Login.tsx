import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from '../features/auth/schema';
import { Input } from '../components/ui/input';
import { FloatLabel } from '../components/ui/FloatLabel';
import { Eye, EyeOff, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const { loginSession } = useSession();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = 
    useForm<LoginValues>({ 
      resolver: zodResolver(loginSchema),
      mode: 'onChange'
    });

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // Debug: Watch form values
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('📝 Login form values:', value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Debug: Watch form errors
  useEffect(() => {
    console.log('❌ Login validation errors:', errors);
    console.log('✅ Login form is valid:', Object.keys(errors).length === 0);
  }, [errors]);

  const onSubmit = async (data: LoginValues) => {
    console.log('🚀 Login onSubmit function called!');
    console.log('📋 Login form data:', data);
    
    try {
      setApiError('');
      console.log('📤 Making login API request...');
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: data.email,
        password: data.password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Login API Response:', response);
      
      if (response.status === 200 && response.data.success) {
        console.log('🎉 Login successful!');
        
        // ✅ Update session context with user data
        if (response.data.data?.user) {
          loginSession(response.data.data.user);
          console.log('✅ Session updated with user:', response.data.data.user);
        }
        
        // Navigate to dashboard
        console.log('🎯 Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
        
      } else {
        setApiError('Login failed. Please try again.');
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setApiError('Invalid email or password');
      } else if (error.code === 'ERR_NETWORK') {
        setApiError('Network error. Make sure backend is running on http://localhost:5000');
      } else if (error.message.includes('CORS')) {
        setApiError('CORS error. Please check backend CORS configuration.');
      } else {
        setApiError('Login failed. Please try again.');
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
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-900 via-amber-900 to-orange-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4">
            Welcome Back to <span className="text-yellow-400">CryptoPlatform</span>
          </h1>
          <p className="text-xl text-amber-200 mb-8 leading-relaxed">
            Access your portfolio, trade cryptocurrencies, and manage your digital assets with confidence.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-amber-200">Secure • Fast • Reliable</span>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <img 
            src="/public/images/LandingPage3D.png" 
            alt="Crypto illustration" 
            className="w-full h-full object-contain"
          />
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-900"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-yellow-200/50 dark:border-amber-700/50"
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-white rounded-md flex items-center justify-center"
                  >
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </motion.div>
                </motion.div>
                
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl blur-md"
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                Sign In
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error Message */}
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
              {/* Email Field */}
              <div className="relative mb-6">
                <Input
                  id="email"
                  type="email"
                  placeholder=" "
                  {...register('email')}
                  className={`${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                  aria-invalid={!!errors.email}
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

              {/* Password Field */}
              <div className="relative mb-6">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  {...register('password')}
                  className={`pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-yellow-300/60 focus:border-yellow-500 focus:ring-yellow-500'}`}
                  aria-invalid={!!errors.password}
                />
                <FloatLabel label="Password" htmlFor="password" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-yellow-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 font-medium"
                >
                  Forgot password?
                </Link>
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
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-yellow-200 dark:border-amber-600"></div>
              <span className="px-4 text-sm text-slate-500 dark:text-slate-400">Or continue with</span>
              <div className="flex-1 border-t border-yellow-200 dark:border-amber-600"></div>
            </div>

            {/* OAuth Buttons */}
            <button className="w-full flex items-center justify-center px-4 py-3 border border-yellow-300 dark:border-amber-600 rounded-xl hover:bg-yellow-50 dark:hover:bg-amber-700/20 transition-colors">
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-3" />
              <span className="text-slate-700 dark:text-slate-300">Sign in with Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 font-semibold"
              >
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
