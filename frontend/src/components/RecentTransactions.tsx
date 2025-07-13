import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Transaction {
  _id: string;
  currency: string;
  amount: number;
  address: string;
  status: string;
  createdAt: string;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/wallet/transactions', {
          withCredentials: true,
        });

        const now = new Date();
        const filtered = res.data.transactions.filter((tx: Transaction) => {
          if (tx.status !== 'pending') return true;
          const created = new Date(tx.createdAt);
          const expires = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
          return expires > now;
        });

        setTransactions(filtered);
      } catch (err) {
        console.error('RecentTransactions error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <p className="text-muted">Loading recent transactions...</p>;
  }

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="card recent-transactions">
      <h2 className="card-title">Recent Transactions</h2>
      {transactions.map((tx) => {
        const createdAt = new Date(tx.createdAt);
        const expiryDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const timeLeftMs = expiryDate.getTime() - now.getTime();
        const daysLeft = Math.max(Math.floor(timeLeftMs / (1000 * 60 * 60 * 24)), 0);
        const hoursLeft = Math.max(Math.floor((timeLeftMs / (1000 * 60 * 60)) % 24), 0);

        return (
          <div key={tx._id} className="transaction-row">
            <p><strong>Address:</strong> {tx.address}</p>
            <p><strong>Amount:</strong> {tx.amount} {tx.currency}</p>
            <p><strong>Status:</strong> {tx.status}</p>
            {tx.status === 'pending' && (
              <p className="tx-expiry">Expires in: {daysLeft} days {hoursLeft} hours</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
