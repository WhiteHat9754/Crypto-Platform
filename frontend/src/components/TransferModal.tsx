import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import axios from 'axios';

interface WalletBalance {
  currency: string;
  balance: number;
  available: number;
  inOrder: number;
  usdValue: number;
  price: number;
  change24h: number;
}

interface TransferModalProps {
  onClose: () => void;
  coins: { symbol: string; name: string; image: string; }[];
  walletData: WalletBalance[];
  onSuccess: () => void;
}

export default function TransferModal({ onClose, coins, walletData, onSuccess }: TransferModalProps) {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedWalletData = walletData.find(w => w.currency === selectedCoin);
  const maxAmount = selectedWalletData?.available || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCoin || !amount || !recipientEmail) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) > maxAmount) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/wallet/transfer', {
        currency: selectedCoin,
        amount: parseFloat(amount),
        recipientEmail
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5" />
            Transfer Crypto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Cryptocurrency
            </label>
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Choose a coin</option>
              {coins.map((coin) => {
                const balance = walletData.find(w => w.currency === coin.symbol)?.balance || 0;
                return (
                  <option key={coin.symbol} value={coin.symbol}>
                    {coin.name} ({coin.symbol}) - Balance: {balance.toFixed(8)}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter recipient's email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                step="0.00000001"
                min="0"
                max={maxAmount}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {selectedCoin && (
                <button
                  type="button"
                  onClick={() => setAmount(maxAmount.toString())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-yellow-600 hover:text-yellow-700"
                >
                  MAX
                </button>
              )}
            </div>
            {selectedCoin && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {maxAmount.toFixed(8)} {selectedCoin}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
