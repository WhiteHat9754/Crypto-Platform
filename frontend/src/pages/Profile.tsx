// src/pages/Profile.tsx

import React from 'react';
import { useSession } from '../context/SessionProvider';

export default function Profile() {
  const { isLoading, user } = useSession();

  if (isLoading) {
    return (
      <main className="main-wrapper flex items-center justify-center text-muted">
        Loading...
      </main>
    );
  }

  return (
    <main className="main-wrapper">
      <h1 className="heading-primary mb-4">👤 Profile</h1>
      {user ? (
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.countryCode} {user.phone}</p>
          {user.referralCode && (
            <p><strong>Referral:</strong> {user.referralCode}</p>
          )}
        </div>
      ) : (
        <p className="text-muted">Not logged in.</p>
      )}
    </main>
  );
}
