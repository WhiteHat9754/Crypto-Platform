import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import { motion } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  User, 
  TrendingUp, 
  LogOut, 
  Settings,
  PieChart,
  ArrowUpDown
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutSession } = useSession();

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear session
      logoutSession();
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear session anyway
      logoutSession();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/portfolio', label: 'Portfolio', icon: PieChart },
    { path: '/trading', label: 'Trading', icon: ArrowUpDown },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ✅ FULL MENU BAR - Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                CryptoPlatform
              </span>
            </Link>

            {/* ✅ MAIN NAVIGATION MENU */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* ✅ USER MENU */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Settings */}
              <Link
                to="/settings"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ MOBILE NAVIGATION MENU */}
      <nav className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ✅ BREADCRUMB */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/dashboard" className="hover:text-yellow-600 dark:hover:text-yellow-400">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium capitalize">
              {location.pathname.slice(1) || 'dashboard'}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ MAIN CONTENT */}
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* ✅ FOOTER */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-md flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                CryptoPlatform
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 CryptoPlatform. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/terms" className="hover:text-yellow-600 dark:hover:text-yellow-400">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-yellow-600 dark:hover:text-yellow-400">
                Privacy
              </Link>
              <Link to="/support" className="hover:text-yellow-600 dark:hover:text-yellow-400">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
