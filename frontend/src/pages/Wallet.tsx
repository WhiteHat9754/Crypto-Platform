import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransferModal from '../components/TransferModal';
import RecentTransactions from '../components/RecentTransactions';

interface WalletItem {
  symbol: string;
  name: string;
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
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);

  // ✅ ALWAYS define your supported coins list
  const supportedCoins = [
    { symbol: 'BTC', name: 'Bitcoin', image: '/icons/btc.png' },
    { symbol: 'ETH', name: 'Ethereum', image: '/icons/eth.png' },
    { symbol: 'USDT', name: 'Tether', image: '/icons/usdt.png' },
    { symbol: 'SOL', name: 'Solana', image: '/icons/sol.png' },
    { symbol: 'DOGE', name: 'Dogecoin', image: '/icons/doge.png' },
    // Add more coins as needed
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchWallet = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/wallet', {
          withCredentials: true,
        });

        const data = res.data.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name || coin.symbol,
          amount: coin.amount,
          available: coin.available || coin.amount,
          inOrder: coin.inOrder || 0,
          image: `/icons/${coin.symbol.toLowerCase()}.png`,
          usdValue: coin.amount * coin.price,
        }));

        setWallet(data);
      } catch (err) {
        console.error('Wallet fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [isLoggedIn]);

  const totalBalance = wallet.reduce((sum, coin) => sum + coin.usdValue, 0);

  if (sessionLoading || loading) {
    return (
      <main className="flex items-center justify-center h-screen bg-white text-gray-600">
        Loading wallet...
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="flex items-center justify-center h-screen bg-white text-gray-600">
        Please log in to view your wallet.
      </main>
    );
  }

  const filteredWallet = wallet.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const hasBalance = showOnlyWithBalance ? coin.amount > 0 : true;
    return matchesSearch && hasBalance;
  });

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">💰 My Wallet</h1>

      {/* Portfolio summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Portfolio Balance</h2>
        <p className="text-4xl font-bold text-yellow-500">${totalBalance.toFixed(2)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setDepositOpen(true)}
          className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold shadow hover:bg-yellow-500"
        >
          ➕ Deposit
        </button>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="bg-gray-100 px-6 py-2 rounded-full font-semibold shadow hover:bg-gray-200"
        >
          ➖ Withdraw
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="bg-gray-100 px-6 py-2 rounded-full font-semibold shadow hover:bg-gray-200"
        >
          🔄 Transfer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showOnlyWithBalance}
            onChange={() => setShowOnlyWithBalance(!showOnlyWithBalance)}
          />
          Show only coins with balance
        </label>

        <input
          type="text"
          placeholder="Search coin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded border border-gray-300 w-full md:w-64 text-gray-900"
        />
      </div>

      {/* Coins table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Coin</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Available</th>
              <th className="p-3 text-right">In Order</th>
              <th className="p-3 text-right">Value (USD)</th>
            </tr>
          </thead>
          <tbody className="bg-white text-gray-800">
            {filteredWallet.map((coin) => (
              <tr key={coin.symbol} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="flex items-center gap-2 p-3">
                  <img src={coin.image} alt={coin.symbol} className="w-6 h-6" />
                  <span className="font-semibold">{coin.symbol}</span>
                  <span className="text-xs text-gray-500">({coin.name})</span>
                </td>
                <td className="p-3 text-right">{coin.amount.toFixed(8)}</td>
                <td className="p-3 text-right">{coin.available.toFixed(8)}</td>
                <td className="p-3 text-right">{coin.inOrder.toFixed(8)}</td>
                <td className="p-3 text-right">${coin.usdValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredWallet.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          No assets found.
        </div>
      )}

      <RecentTransactions />

      {/* ✅ Pass supportedCoins so DepositModal never empty */}
      {isDepositOpen && (
        <DepositModal onClose={() => setDepositOpen(false)} coins={supportedCoins} />
      )}
      {isWithdrawOpen && (
        <WithdrawModal onClose={() => setWithdrawOpen(false)} coins={supportedCoins} />
      )}
      {isTransferOpen && (
        <TransferModal onClose={() => setTransferOpen(false)} coins={supportedCoins} />
      )}
    </main>
  );
}
