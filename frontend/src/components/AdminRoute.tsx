import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.success && data.data.role === 'admin');
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
