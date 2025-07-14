import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';

export default function Profile() {
  const { isLoading, user } = useSession();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [kycStatus, setKycStatus] = useState('not_verified');

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [savingName, setSavingName] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);

  // ✅ Keep state in sync with session data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setCountryCode(user.countryCode || '');
      setKycStatus(user.kycStatus || 'not_verified');
    }
  }, [user]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center h-screen bg-white text-gray-500">
        Loading...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center h-screen bg-white text-gray-500">
        Not logged in.
      </main>
    );
  }

  const handleNameSave = async () => {
    if (!firstName || !lastName) return alert('Please fill in your full name.');
    try {
      setSavingName(true);
      await axios.post(
        '/api/user/update-name',
        { firstName, lastName },
        { withCredentials: true }
      );
      alert('Name updated!');
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const handlePhoneSave = async () => {
    if (!phone || !countryCode) return alert('Please enter phone and country code.');
    try {
      setSavingPhone(true);
      await axios.post(
        '/api/user/update-phone',
        { phone, countryCode },
        { withCredentials: true }
      );
      alert('Phone updated!');
      setIsEditingPhone(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update phone.');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Fake KYC submitted!');
    setKycStatus('pending');
    setKycOpen(false);
  };

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">👤 My Profile</h1>
      <p className="text-sm mb-6 text-gray-500">KYC Status: {kycStatus}</p>

      {/* ✅ Account Details */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Account Details</h2>
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={firstName}
              disabled={!isEditingName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`border border-gray-300 p-2 rounded flex-1 text-gray-900 ${
                isEditingName ? 'bg-white' : 'bg-gray-100'
              }`}
            />
            <input
              type="text"
              value={lastName}
              disabled={!isEditingName}
              onChange={(e) => setLastName(e.target.value)}
              className={`border border-gray-300 p-2 rounded flex-1 text-gray-900 ${
                isEditingName ? 'bg-white' : 'bg-gray-100'
              }`}
            />
            {kycStatus === 'not_verified' && !isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-sm underline text-gray-600"
              >
                ✏️ Edit
              </button>
            )}
            {isEditingName && (
              <button
                onClick={handleNameSave}
                disabled={savingName}
                className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded font-semibold"
              >
                {savingName ? 'Saving...' : 'Save Name'}
              </button>
            )}
          </div>
          <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
        </div>
      </section>

      {/* ✅ Contact Info */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Contact Info</h2>
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={countryCode}
              disabled={!isEditingPhone}
              onChange={(e) => setCountryCode(e.target.value)}
              className={`border border-gray-300 p-2 rounded w-24 text-gray-900 ${
                isEditingPhone ? 'bg-white' : 'bg-gray-100'
              }`}
            />
            <input
              type="text"
              value={phone}
              disabled={!isEditingPhone}
              onChange={(e) => setPhone(e.target.value)}
              className={`border border-gray-300 p-2 rounded flex-1 text-gray-900 ${
                isEditingPhone ? 'bg-white' : 'bg-gray-100'
              }`}
            />
            {!isEditingPhone && (
              <button
                onClick={() => setIsEditingPhone(true)}
                className="text-sm underline text-gray-600"
              >
                ✏️ Edit
              </button>
            )}
            {isEditingPhone && (
              <button
                onClick={handlePhoneSave}
                disabled={savingPhone}
                className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded font-semibold"
              >
                {savingPhone ? 'Saving...' : 'Save Phone'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ✅ KYC */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">KYC Verification</h2>
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm space-y-2">
          <p className="text-sm text-gray-600">
            Complete KYC to unlock full features.
          </p>
          <button
            onClick={() => setKycOpen(true)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Start KYC
          </button>
        </div>
      </section>

      {/* ✅ Improved KYC Modal */}
{kycOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="relative bg-white p-6 rounded shadow w-full max-w-md border border-gray-200">
      
      <button
        onClick={() => setKycOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-4xl font-bold transition-transform transform hover:scale-125"
        aria-label="Close"
      >
        &times;
      </button>


      <h2 className="text-xl font-bold mb-4 text-gray-900">KYC Verification</h2>

      <form onSubmit={handleKycSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border border-gray-300 p-2 rounded text-gray-900"
          required
        />
        <select className="w-full border border-gray-300 p-2 rounded text-gray-900" required>
          <option value="">Select Country</option>
          <option value="US">United States (SSN)</option>
          <option value="IN">India (Aadhaar)</option>
          <option value="DE">Germany (Personalausweis)</option>
          <option value="FR">France (Carte Nationale d'Identité)</option>
          {/* Add more */}
        </select>
        <input
          type="text"
          placeholder="National ID Number"
          className="w-full border border-gray-300 p-2 rounded text-gray-900"
          required
        />
        <input
          type="file"
          className="w-full border border-gray-300 p-2 rounded"
          required
        />

        <button
          type="submit"
          className="bg-yellow-400 w-full py-2 rounded font-semibold hover:bg-yellow-500"
        >
          Submit KYC
        </button>
      </form>
    </div>
  </div>
)}



    </main>
  );
}
