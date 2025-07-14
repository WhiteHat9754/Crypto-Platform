import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  balance: Record<string, number>;
}

interface Withdrawal {
  _id: string;
  userId: string;
  currency: string;
  amount: number;
  address: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const resUsers = await axios.get('http://localhost:5000/api/admin/users', {
        withCredentials: true,
      });
      console.log('Users:', resUsers.data);
      setUsers(Array.isArray(resUsers.data) ? resUsers.data : []);

      const resWithdrawals = await axios.get('http://localhost:5000/api/admin/withdrawals/pending', {
        withCredentials: true,
      });
      console.log('Withdrawals:', resWithdrawals.data);
      setWithdrawals(Array.isArray(resWithdrawals.data) ? resWithdrawals.data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  const handleConfirm = async (id: string, status: string) => {
    try {
      await axios.post(
        `/api/admin/withdrawals/${id}/confirm`,
        { status },
        { withCredentials: true }
      );
      alert(`Withdrawal ${status}`);
      // Refresh data
      setLoading(true);
      const resUsers = await axios.get('/api/admin/users', { withCredentials: true });
      setUsers(resUsers.data);
      const resWithdrawals = await axios.get('/api/admin/withdrawals/pending', { withCredentials: true });
      setWithdrawals(resWithdrawals.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to confirm withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Full-page loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-800">
        <div className="text-xl font-semibold">Loading Admin Dashboard...</div>
      </div>
    );
  }

  // ✅ Full-page red error banner
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-600 text-white">
        <div className="text-xl font-semibold">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <h2 className="text-xl font-semibold mb-2">All Users</h2>
      {users.length === 0 ? (
        <p className="text-gray-500 mb-8">No users found.</p>
      ) : (
        <table className="w-full border mb-8">
          <thead>
            <tr>
              <th className="border p-2">Email</th>
              <th className="border p-2">Balances</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">
                  {Object.entries(u.balance).map(([coin, amt]) => (
                    <div key={coin}>
                      {coin}: {parseFloat(amt.toString())}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-xl font-semibold mb-2">Pending Withdrawals</h2>
      {withdrawals.length === 0 ? (
        <p className="text-gray-500">No pending withdrawals.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">User ID</th>
              <th className="border p-2">Coin</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w._id}>
                <td className="border p-2">{w.userId}</td>
                <td className="border p-2">{w.currency}</td>
                <td className="border p-2">{w.amount}</td>
                <td className="border p-2">{w.address}</td>
                <td className="border p-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 mr-2"
                    onClick={() => handleConfirm(w._id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1"
                    onClick={() => handleConfirm(w._id, 'rejected')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
