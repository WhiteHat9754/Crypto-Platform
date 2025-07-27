import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSession } from '../context/SessionProvider';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useSession();
  const [searchParams] = useSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('US+1');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');

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

  // ✅ Pre-fill email if ?email param is present
  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  if (isLoading) {
    return <div className="text-black p-4">Loading...</div>;
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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-lg bg-white/60 border border-white/40 shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl mb-6 text-yellow-500 font-bold text-center">Quota Flow</h2>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
          required
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-100 text-black pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-1/3 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            className="w-2/3 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>

        <input
          type="text"
          placeholder="Referral Code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
        >
          Sign Up
        </button>

        <p className="text-gray-600 text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
