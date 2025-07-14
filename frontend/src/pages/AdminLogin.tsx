import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/admin-login',
        { email, password },
        { withCredentials: true }
      );
      console.log('Admin login response:', response);

      if (response.status === 200) {
        navigate('/admin');
      } else {
        alert('Admin login failed.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Admin login failed.');
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleLogin}
        className="backdrop-blur-lg bg-white/60 border border-white/40 shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl mb-6 text-yellow-500 font-bold text-center">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Admin Email"
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
          className="w-full mb-6 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
