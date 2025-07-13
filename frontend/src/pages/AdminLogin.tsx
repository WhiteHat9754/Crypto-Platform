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
      await axios.post(
        'http://localhost:5000/api/auth/admin-login',
        { email, password },
        { withCredentials: true } // ✅ super important for cookie!
      );

      // ✅ No localStorage needed. Session is stored via cookie.
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Admin login failed.');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2"
        />
        <button type="submit" className="w-full bg-black text-white p-2">
          Login
        </button>
      </form>
    </div>
  );
}
