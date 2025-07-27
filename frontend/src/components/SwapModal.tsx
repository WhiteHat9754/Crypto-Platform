import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUpDown } from 'lucide-react';
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

interface SwapModalProps {
  onClose: () => void;
  coins: { symbol: string; name: string; image: string; }[];
  walletData: WalletBalance[];
  isOpen: boolean;
  onSuccess: () => void;
}

export default function SwapModal({ onClose, coins, walletData, isOpen, onSuccess }: SwapModalProps) {
  const [fromCoin, setFromCoin] = useState('');
  const [toCoin, setToCoin] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fromWalletData = walletData.find(w => w.currency === fromCoin);
  const toWalletData = walletData.find(w => w.currency === toCoin);
  const maxAmount = fromWalletData?.available || 0;

  // Calculate swap rate
  const calculateSwap = () => {
    if (!fromCoin || !toCoin || !fromAmount || !fromWalletData || !toWalletData) return;
    
    const fromPrice = fromWalletData.price;
    const toPrice = toWalletData.price;
    const amount = parseFloat(fromAmount);
    
    if (fromPrice > 0 && toPrice > 0) {
      const convertedAmount = (amount * fromPrice) / toPrice;
      setToAmount(convertedAmount.toFixed(8));
    }
  };

  React.useEffect(() => {
    calculateSwap();
  }, [fromCoin, toCoin, fromAmount]);

  const handleSwapCoins = () => {
    const tempCoin = fromCoin;
    const tempAmount = fromAmount;
    setFromCoin(toCoin);
    setToCoin(tempCoin);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromCoin || !toCoin || !fromAmount) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(fromAmount) > maxAmount) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/wallet/swap', {
        fromCurrency: fromCoin,
        toCurrency: toCoin,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount)
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
            <ArrowUpDown className="w-5 h-5" />
            Swap Crypto
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
          {/* From Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <div className="flex gap-2">
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-600 dark:text-white"
                required
              >
                <option value="">Choose coin</option>
                {coins.map((coin) => {
                  const balance = walletData.find(w => w.currency === coin.symbol)?.balance || 0;
                  return (
                    <option key={coin.symbol} value={coin.symbol}>
                      {coin.symbol} - {balance.toFixed(8)}
                    </option>
                  );
                })}
              </select>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00000000"
                  step="0.00000001"
                  min="0"
                  max={maxAmount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-600 dark:text-white"
                  required
                />
                {fromCoin && (
                  <button
                    type="button"
                    onClick={() => setFromAmount(maxAmount.toString())}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-yellow-600 hover:text-yellow-700"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>
            {fromCoin && (
              <p className="text-xs text-gray-500 mt-1">
                Available: {maxAmount.toFixed(8)} {fromCoin}
              </p>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwapCoins}
              className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* To Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <div className="flex gap-2">
              <select
                value={toCoin}
                onChange={(e) => setToCoin(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-600 dark:text-white"
                required
              >
                <option value="">Choose coin</option>
                {coins.filter(coin => coin.symbol !== fromCoin).map((coin) => (
                  <option key={coin.symbol} value={coin.symbol}>
                    {coin.symbol}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={toAmount}
                readOnly
                placeholder="0.00000000"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white"
              />
            </div>
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
              disabled={loading || !fromCoin || !toCoin || !fromAmount}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Swap'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
