import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';

export default function Register() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useSession();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('US+1'); // 🇺🇸 Default unique value
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // ✅ Top 10 countries A-Z
  const countries = [
    { name: 'AE', code: '+971', flag: '🇦🇪' },
    { name: 'AU', code: '+61', flag: '🇦🇺' },
    { name: 'CA', code: '+1', flag: '🇨🇦' },
    { name: 'DE', code: '+49', flag: '🇩🇪' },
    { name: 'FR', code: '+33', flag: '🇫🇷' },
    { name: 'GB', code: '+44', flag: '🇬🇧' },
    { name: 'IN', code: '+91', flag: '🇮🇳' },
    { name: 'NZ', code: '+64', flag: '🇳🇿' },
    { name: 'SG', code: '+65', flag: '🇸🇬' },
    { name: 'US', code: '+1', flag: '🇺🇸' },
  ];

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  if (isLoggedIn) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !firstName || !lastName || !countryCode || !phone) {
      alert('Please fill in all required fields!');
      return;
    }

    // ✅ Extract real dial code from unique value (ISO+Code)
    const dialCode = countryCode.replace(/^[A-Z]+/, '');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          countryCode: dialCode,
          phone,
          referralCode,
        }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        alert('Registration failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-6 text-yellow-400 font-bold">Register</h2>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
          required
        />

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

        <div className="flex gap-2 mb-4">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-1/3 p-3 rounded bg-gray-700 text-white"
            required
          >
            {countries.map((c) => (
              <option key={c.name} value={`${c.name}${c.code}`}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-2/3 p-3 rounded bg-gray-700 text-white"
            required
          />
        </div>

        <input
          type="text"
          placeholder="Referral Code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Sign Up
        </button>

        <p className="text-gray-400 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
