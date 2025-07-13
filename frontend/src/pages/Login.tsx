import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, loginSession } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/');
    }
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  if (isLoggedIn) {
    return null; // prevent flash of login form
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter your email and password!');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true } // ✅ this makes the session cookie work!
      );

      if (response.status === 200) {
        loginSession(response.data.user);
        navigate('/dashboard');
      } else {
        alert('Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-6 text-yellow-400 font-bold">Login</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
          required
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Login
        </button>

        <p className="text-gray-400 text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-yellow-400 hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
