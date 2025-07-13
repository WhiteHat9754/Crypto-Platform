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

  useEffect(() => {
    fetchUsers();
    fetchWithdrawals();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/api/admin/users', {
      withCredentials: true, // ✅ use session cookie
    });
    setUsers(res.data);
  };

  const fetchWithdrawals = async () => {
    const res = await axios.get('/api/admin/withdrawals/pending', {
      withCredentials: true, // ✅ use session cookie
    });
    setWithdrawals(res.data);
  };

  const handleConfirm = async (id: string, status: string) => {
    await axios.post(
      `/api/admin/withdrawals/${id}/confirm`,
      { status },
      { withCredentials: true } // ✅ use session cookie
    );
    alert(`Withdrawal ${status}`);
    fetchWithdrawals();
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <h2 className="text-xl font-semibold mb-2">All Users</h2>
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
                    {coin}: {amt}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-2">Pending Withdrawals</h2>
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
    </div>
  );
}
