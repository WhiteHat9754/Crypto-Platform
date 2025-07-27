import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowDownLeft, Copy } from 'lucide-react';

interface DepositModalProps {
  onClose: () => void;
  coins: { symbol: string; name: string; image: string; }[];
  onSuccess: () => void;
}

export default function DepositModal({ onClose, coins, onSuccess }: DepositModalProps) {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [depositAddress, setDepositAddress] = useState('');

  // Generate deposit address (this would come from your backend)
  const generateAddress = (coin: string) => {
    // This is a mock - in real implementation, you'd get this from your backend
    const mockAddresses: { [key: string]: string } = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: '0x742b40a3e50F7b6B2B2A4c74B7D57e6ade1E2E7E',
      USDT: '0x742b40a3e50F7b6B2B2A4c74B7D57e6ade1E2E7E',
      SOL: '11111111111111111111111111111112'
    };
    return mockAddresses[coin] || 'Address not available';
  };

  React.useEffect(() => {
    if (selectedCoin) {
      setDepositAddress(generateAddress(selectedCoin));
    }
  }, [selectedCoin]);

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    // You might want to show a toast notification here
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
            <ArrowDownLeft className="w-5 h-5" />
            Deposit Crypto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Cryptocurrency
            </label>
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Choose a coin</option>
              {coins.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
          </div>

          {selectedCoin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deposit Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={depositAddress}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                  onClick={copyAddress}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Send only {selectedCoin} to this address. Sending other coins may result in permanent loss.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
