import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading } = useSession();

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  return <>{children}</>;
}
