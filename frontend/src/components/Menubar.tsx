// src/components/Menubar.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/menubar.css'; // ✅ Import your separate CSS

export default function Menubar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          withCredentials: true,
        });
        if (res.status === 200) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="menubar">
      <div className="menubar-logo">Whitestone Capital</div>

      <div className="menubar-links">
        {/* ✅ Show Dashboard only for logged-in users */}
        {isLoggedIn && (
          <Link
            to="/dashboard"
            className={`menubar-link ${
              location.pathname === '/dashboard' ? 'active' : ''
            }`}
          >
            Dashboard
          </Link>
        )}

        {isLoggedIn ? (
          <>
            <Link
              to="/wallet"
              className={`menubar-link ${
                location.pathname === '/wallet' ? 'active' : ''
              }`}
            >
              Wallet
            </Link>
            <Link
              to="/profile"
              className={`menubar-link ${
                location.pathname === '/profile' ? 'active' : ''
              }`}
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
