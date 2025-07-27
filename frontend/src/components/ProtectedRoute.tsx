import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isLoading, isLoggedIn, user } = useSession();

  console.log('🔒 ProtectedRoute check:', { isLoading, isLoggedIn, user: user?.email });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Loading Logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-white rounded-md flex items-center justify-center"
            >
              <svg 
                className="w-6 h-6 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Loading Text */}
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
            Loading...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Checking authentication status
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center mt-4 space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="w-2 h-2 bg-yellow-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn || !user) {
    console.log('❌ User not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated, render the protected content
  console.log('✅ User authenticated, rendering protected content');
  return <>{children}</>;
}

// Alternative: Simple version without loading animation
export const SimpleProtectedRoute = ({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { isLoading, isLoggedIn } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
