// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isLoggedIn } = useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
