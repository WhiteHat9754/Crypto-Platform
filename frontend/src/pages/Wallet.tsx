// src/pages/Wallet.tsx

import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransferModal from '../components/TransferModal';
import RecentTransactions from '../components/RecentTransactions';

interface WalletItem {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  available: number;
  inOrder: number;
  image: string;
  usdValue: number;
}

export default function Wallet() {
  const { isLoading: sessionLoading, isLoggedIn } = useSession();
  const [wallet, setWallet] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSmall, setShowSmall] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchWallet = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            ids: 'bitcoin,ethereum,tether,solana,dogecoin',
          },
        });

        const dummyAmounts = {
          bitcoin: 0,
          ethereum: 0,
          tether: 0,
          solana: 0,
          dogecoin: 0,
        };

        const dummyOrders = {
          bitcoin: 0,
          ethereum: 0,
          tether: 0,
          solana: 0,
          dogecoin: 0,
        };

        const data = res.data.map((coin: any) => {
          const amount = dummyAmounts[coin.id] || 0;
          const inOrder = dummyOrders[coin.id] || 0;
          const available = amount - inOrder;

          return {
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            amount,
            available,
            inOrder,
            image: coin.image,
            usdValue: amount * coin.current_price,
          };
        });

        setWallet(data);
      } catch (err) {
        console.error('Wallet error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [isLoggedIn]);

  const totalBalance = wallet.reduce((sum, coin) => sum + coin.usdValue, 0);
  const totalAvailable = wallet.reduce((sum, coin) => sum + (coin.available * coin.usdValue) / (coin.amount || 1), 0);
  const totalInOrder = wallet.reduce((sum, coin) => sum + (coin.inOrder * coin.usdValue) / (coin.amount || 1), 0);

  if (sessionLoading || loading) {
    return (
      <main className="main-wrapper flex items-center justify-center text-muted">
        Loading wallet...
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="main-wrapper flex items-center justify-center text-muted">
        Please log in to view your wallet.
      </main>
    );
  }

  const filteredWallet = wallet.filter((coin) => {
    const matchesSearch = coin.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasBalance = showSmall ? coin.usdValue < 1 : true;
    return matchesSearch && hasBalance;
  });

  return (
    <main className="main-wrapper">
      <h1 className="heading-primary mb-4">💰 Wallet</h1>

      {/* Universal actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setDepositOpen(true)}
          className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500"
        >
          Deposit Crypto
        </button>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300"
        >
          Withdraw Crypto
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300"
        >
          Transfer
        </button>
      </div>

      {totalBalance > 0 ? (
        <>
          {/* Total balance */}
          <div className="card mb-6">
            <h2 className="heading-secondary mb-2">Total Estimated Balance</h2>
            <p className="text-3xl font-bold text-yellow-400">${totalBalance.toFixed(2)}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted mt-2">
              <span>Available: ${totalAvailable.toFixed(2)}</span>
              <span>In Order: ${totalInOrder.toFixed(2)}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSmall}
                onChange={() => setShowSmall(!showSmall)}
              />
              Show Small Balances ($1 or less)
            </label>

            <input
              type="text"
              placeholder="Search coin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded border border-gray-300 w-full md:w-64"
            />
          </div>

          {/* Table */}
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="py-2">Coin</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Available</th>
                  <th className="py-2">In Order</th>
                  <th className="py-2">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallet.map((coin) => (
                  <tr key={coin.symbol} className="border-b border-gray-100">
                    <td className="flex items-center gap-2 py-2">
                      <img src={coin.image} alt={coin.symbol} className="w-5 h-5" />
                      <span>{coin.symbol}</span>
                      <span className="text-muted text-xs">({coin.name})</span>
                    </td>
                    <td className="py-2">{coin.amount}</td>
                    <td className="py-2">{coin.available}</td>
                    <td className="py-2">{coin.inOrder}</td>
                    <td className="py-2">${coin.usdValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card text-center py-16 text-muted">
          <p className="mb-4">You don’t have any crypto assets yet.</p>
          <p>Deposit crypto to get started!</p>
        </div>
      )}

      <RecentTransactions />

      {/* Modals */}
      {isDepositOpen && <DepositModal onClose={() => setDepositOpen(false)} coins={wallet} />}
      {isWithdrawOpen && <WithdrawModal onClose={() => setWithdrawOpen(false)} coins={wallet} />}
      {isTransferOpen && <TransferModal onClose={() => setTransferOpen(false)} coins={wallet} />}
    </main>
  );
}
