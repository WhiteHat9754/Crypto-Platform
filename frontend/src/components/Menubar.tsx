import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Menubar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ Check session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          withCredentials: true,
        });
        if (res.status === 200) setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  // ✅ Scroll logic: hide on scroll down, show on scroll up
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

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      setIsLoggedIn(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
<nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
  <div className=" mx-auto flex items-center justify-between px-6 py-3">
    {/* ✅ Logo LEFT */}
    <Link to="/" className="text-xl font-bold text-yellow-500">
      Quota Flow
    </Link>

    {/* ✅ Links RIGHT */}
    <div className="flex items-center gap-4 ml-auto">
      {isLoggedIn && (
        <>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              location.pathname === '/dashboard'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-800 hover:bg-gray-200'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/wallet"
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              location.pathname === '/wallet'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-800 hover:bg-gray-200'
            }`}
          >
            Wallet
          </Link>
          <Link
            to="/profile"
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              location.pathname === '/profile'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-800 hover:bg-gray-200'
            }`}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-black text-yellow-400 hover:bg-gray-900 transition"
          >
            Logout
          </button>
        </>
      )}
      {!isLoggedIn && (
        <Link
          to="/login"
          className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition"
        >
          Login / SignUp
        </Link>
      )}
    </div>
  </div>
</nav>

  );
}
