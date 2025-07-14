import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/menubar.css'; 

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
    <nav
      className={`menubar fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        show ? 'translate-y-0' : '-translate-y-full md:translate-y-0'
      }`}
    >
      <div className="menubar-logo">Whitestone Capital</div>

      <div className="menubar-links">
        {isLoggedIn && (
          <Link
            to="/dashboard"
            className={`menubar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        )}

        {isLoggedIn ? (
          <>
            <Link
              to="/wallet"
              className={`menubar-link ${location.pathname === '/wallet' ? 'active' : ''}`}
            >
              Wallet
            </Link>
            <Link
              to="/profile"
              className={`menubar-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </Link>
            <button onClick={handleLogout} className="menubar-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="menubar-button">
            Login / SignUp
          </Link>
        )}
      </div>
    </nav>
  );
}
