import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, loginSession } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/');
    }
  }, [isLoading, isLoggedIn, navigate]);

  if (isLoading) {
    return <div className="text-black p-4">Loading...</div>;
  }

  if (isLoggedIn) {
    return null;
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
        { withCredentials: true }
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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-lg bg-white/60 border border-white/40 shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl mb-6 text-yellow-500 font-bold text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Login
        </button>

        <p className="text-gray-600 text-sm mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-yellow-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
