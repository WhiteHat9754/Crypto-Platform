import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronDown,
  Bell,
  Search,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

export default function Menubar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState(3);
  const [loading, setLoading] = useState(true);

  // Check session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          withCredentials: true,
        });
        if (res.status === 200) {
          setIsLoggedIn(true);
          setUserProfile(res.data);
        }
      } catch {
        setIsLoggedIn(false);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Scroll logic: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 50) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      setIsLoggedIn(false);
      setUserProfile(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Navigation links - ONLY SHOWN WHEN LOGGED IN
  const navLinks = [
    { name: 'Markets', href: '/markets', icon: TrendingUp },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
  ];

  const isActiveLink = (href: string) => location.pathname === href;

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: show ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Yellow Animated Logo - No Text Below */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <Link to="/" className="flex items-center space-x-3 group">
                {/* Animated Logo Icon */}
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      boxShadow: [
                        "0 0 20px rgba(250, 204, 21, 0.5)",
                        "0 0 30px rgba(245, 158, 11, 0.7)", 
                        "0 0 20px rgba(250, 204, 21, 0.5)"
                      ]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <motion.div
                      animate={{ 
                        rotate: -360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-6 h-6 bg-white rounded-md flex items-center justify-center"
                    >
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    </motion.div>
                  </motion.div>
                  
                  {/* Pulsing Yellow Glow */}
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-xl blur-md"
                  />
                  
                  {/* Sparkle Effects */}
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-400 rounded-full"
                  />
                </div>
                
                {/* Brand Text - Clean Yellow Gradient */}
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Quota Flow
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation - ONLY SHOW WHEN LOGGED IN */}
            <div className="hidden md:flex items-center space-x-8">
              {!loading && isLoggedIn && navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActiveLink(link.href)
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {!loading && isLoggedIn ? (
                <>
                  {/* Search Button - Only when logged in */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>

                  {/* Notifications - Only when logged in */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </motion.button>

                  {/* Profile Dropdown - Only when logged in */}
                  <div className="relative profile-dropdown">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="hidden sm:block font-medium">
                        {userProfile?.firstName || 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </motion.button>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-lg rounded-xl border border-slate-700/50 shadow-xl overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-slate-700/50">
                            <p className="text-sm font-medium text-white">
                              {userProfile?.firstName} {userProfile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {userProfile?.email}
                            </p>
                          </div>
                          
                          <div className="py-2">
                            <Link
                              to="/profile"
                              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                            >
                              <User className="w-4 h-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </Link>
                          </div>

                          <div className="border-t border-slate-700/50 py-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : !loading ? (
                <>
                  {/* Sign In/Get Started - Only when NOT logged in */}
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white font-medium transition-all"
                  >
                    Sign In
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-amber-700 transition-all shadow-lg"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              ) : (
                // Loading state
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-slate-600 border-t-yellow-500 rounded-full animate-spin"></div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - CONDITIONAL CONTENT BASED ON LOGIN STATUS */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900/98 backdrop-blur-lg border-t border-slate-800/50"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Navigation Links - ONLY when logged in */}
                {!loading && isLoggedIn && navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActiveLink(link.href)
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                ))}

                {/* Logged In User Options */}
                {!loading && isLoggedIn && (
                  <div className="border-t border-slate-800/50 mt-4 pt-4">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}

                {/* Not Logged In Options */}
                {!loading && !isLoggedIn && (
                  <div className="border-t border-slate-800/50 mt-4 pt-4 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-amber-700 transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
