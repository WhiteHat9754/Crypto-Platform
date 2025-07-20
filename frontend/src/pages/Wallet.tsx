import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransferModal from '../components/TransferModal';
import SwapModal from '../components/SwapModal';
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
  const [isSwapOpen, setSwapOpen] = useState(false);

  const supportedCoins = [
    { symbol: 'BTC', name: 'Bitcoin', image: '/icons/btc.png' },
    { symbol: 'ETH', name: 'Ethereum', image: '/icons/eth.png' },
    { symbol: 'USDT', name: 'Tether', image: '/icons/usdt.png' },
    { symbol: 'SOL', name: 'Solana', image: '/icons/sol.png' },
    { symbol: 'DOGE', name: 'Dogecoin', image: '/icons/doge.png' },
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
      <h1 className="text-4xl font-bold mb-8 text-gray-900">My Crypto Wallet</h1>

      {/* Portfolio summary */}
      <div className="bg-gradient-to-tr from-yellow-100 to-yellow-200 rounded-xl p-6 mb-10 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Total Portfolio Value</h2>
        <p className="text-5xl font-bold text-yellow-600">${totalBalance.toFixed(2)}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-10">
        <button
          onClick={() => setDepositOpen(true)}
          className="bg-yellow-400 text-black py-3 rounded-xl font-semibold shadow hover:bg-yellow-500 transition"
        >
          ➕ Deposit
        </button>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold shadow hover:bg-gray-200 transition"
        >
          ➖ Withdraw
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold shadow hover:bg-blue-200 transition"
        >
          🔄 Transfer
        </button>
        <button
          onClick={() => setSwapOpen(true)}
          className="bg-green-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-green-700 transition"
        >
          🔁 Swap
        </button>
      </div>

      {/* Filter/Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <label className="text-sm text-gray-700 flex items-center gap-2">
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
          className="px-4 py-2 rounded border border-gray-300 w-full md:w-72"
        />
      </div>

      {/* Wallet Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWallet.map((coin) => (
          <div
            key={coin.symbol}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <img src={coin.image} alt={coin.symbol} className="w-8 h-8" />
              <div>
                <div className="text-lg font-semibold text-gray-800">{coin.symbol}</div>
                <div className="text-sm text-gray-500">{coin.name}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">Total: {coin.amount.toFixed(8)}</div>
            <div className="text-sm text-gray-600 mb-1">Available: {coin.available.toFixed(8)}</div>
            <div className="text-sm text-gray-600 mb-1">In Order: {coin.inOrder.toFixed(8)}</div>
            <div className="text-md font-semibold text-green-600 mt-2">
              ${coin.usdValue.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {filteredWallet.length === 0 && (
        <div className="text-center py-20 text-gray-600">No assets found.</div>
      )}

      {/* Recent transactions */}
      <div className="mt-10">
        <RecentTransactions />
      </div>

      {/* Modals */}
      {isDepositOpen && (
        <DepositModal onClose={() => setDepositOpen(false)} coins={supportedCoins} />
      )}
      {isWithdrawOpen && (
        <WithdrawModal onClose={() => setWithdrawOpen(false)} coins={supportedCoins} />
      )}
      {isTransferOpen && (
        <TransferModal onClose={() => setTransferOpen(false)} coins={supportedCoins} />
      )}
      {isSwapOpen && (
        <SwapModal onClose={() => setSwapOpen(false)} coins={supportedCoins} isOpen={true} />
      )}
    </main>
  );
}
