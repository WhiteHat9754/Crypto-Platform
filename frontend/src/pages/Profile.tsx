import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';
import KycModal from '../components/KycModal';

export default function Profile() {
  const { isLoading, user } = useSession();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [kycStatus, setKycStatus] = useState('not_verified');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setCountryCode(user.countryCode || '');
      setKycStatus(user.kycStatus || 'not_verified');
    }
  }, [user]);

  const handleNameSave = async () => {
    try {
      await axios.post('/api/user/update-name', { firstName, lastName }, { withCredentials: true });
      alert('Name updated!');
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhoneSave = async () => {
    try {
      await axios.post('/api/user/update-phone', { phone, countryCode }, { withCredentials: true });
      alert('Phone updated!');
      setIsEditingPhone(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <main className="flex items-center justify-center h-screen text-gray-500">Loading...</main>;
  }

  if (!user) {
    return <main className="flex items-center justify-center h-screen text-gray-500">Not logged in.</main>;
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 min-h-screen bg-white text-gray-900">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {/* Account Info */}
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <input
              value={firstName}
              disabled={!isEditingName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`flex-1 p-2 rounded border ${isEditingName ? 'bg-white' : 'bg-gray-100'}`}
              placeholder="First Name"
            />
            <input
              value={lastName}
              disabled={!isEditingName}
              onChange={(e) => setLastName(e.target.value)}
              className={`flex-1 p-2 rounded border ${isEditingName ? 'bg-white' : 'bg-gray-100'}`}
              placeholder="Last Name"
            />
            {isEditingName ? (
              <button onClick={handleNameSave} className="bg-yellow-400 px-4 py-2 rounded font-medium text-black">Save</button>
            ) : (
              <button onClick={() => setIsEditingName(true)} className="text-sm underline">✏️ Edit</button>
            )}
          </div>
          <p className="text-sm"><strong>Email:</strong> {user.email}</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Contact Info</h2>
        <div className="flex gap-3 items-center">
          <input
            value={countryCode}
            disabled={!isEditingPhone}
            onChange={(e) => setCountryCode(e.target.value)}
            className={`w-24 p-2 rounded border ${isEditingPhone ? 'bg-white' : 'bg-gray-100'}`}
            placeholder="+91"
          />
          <input
            value={phone}
            disabled={!isEditingPhone}
            onChange={(e) => setPhone(e.target.value)}
            className={`flex-1 p-2 rounded border ${isEditingPhone ? 'bg-white' : 'bg-gray-100'}`}
            placeholder="Phone"
          />
          {isEditingPhone ? (
            <button onClick={handlePhoneSave} className="bg-yellow-400 px-4 py-2 rounded font-medium text-black">Save</button>
          ) : (
            <button onClick={() => setIsEditingPhone(true)} className="text-sm underline">✏️ Edit</button>
          )}
        </div>
      </section>

      {/* KYC */}
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">KYC Verification</h2>
        <p className="text-sm mb-2">Status: <span className="font-semibold">{kycStatus}</span></p>
        {kycStatus !== 'verified' && (
          <button onClick={() => setShowKycModal(true)} className="bg-black text-white px-4 py-2 rounded">Start KYC</button>
        )}
      </section>

      {/* Security */}
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
        <div className="flex gap-4">
          <button className="bg-gray-200 px-4 py-2 rounded">🔐 Change Password</button>
          <button className="bg-gray-200 px-4 py-2 rounded">📲 Enable 2FA</button>
        </div>
      </section>

      {/* Session Activity
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Session Activity</h2>
        <ul className="text-sm list-disc list-inside">
          <li>India - July 19, 2025, 10:05 AM</li>
          <li>Germany - July 18, 2025, 11:47 PM</li>
        </ul>
      </section> */}

      {/* Referral */}
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Referral Program</h2>
        <p className="text-sm mb-1">Your referral link:</p>
        <code className="block bg-gray-200 p-2 rounded mb-2">
          https://yourapp.com/ref/{user.refCode || 'abcd1234'}
        </code>
        <button
          onClick={() => navigator.clipboard.writeText(`https://yourapp.com/ref/${user.refCode || 'abcd1234'}`)}
          className="text-xs underline"
        >
          Copy Link
        </button>
      </section>

      {/* API Keys */}
      <section className="bg-gray-50 border rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">API Keys</h2>
        <div className="flex items-center justify-between">
          <code className="bg-gray-200 px-3 py-2 rounded">
            {user.apiKey || 'sk-live-XXXXXX'}
          </code>
          <button className="bg-yellow-400 px-4 py-2 rounded font-medium text-black">Regenerate</button>
        </div>
      </section>

      {/* KYC Modal */}
      {showKycModal && <KycModal onClose={() => setShowKycModal(false)} />}
    </main>
  );
}
