import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function DepositModal({
  onClose,
  coins,
}: {
  onClose: () => void;
  coins: any[];
}) {
  const [currency, setCurrency] = useState(coins[0]?.symbol || 'BTC');
  const [amount, setAmount] = useState(50);
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddressOnly, setShowAddressOnly] = useState(false);

  const generateAddress = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/payments/create',
        { currency, amount },
        { withCredentials: true }
      );
      console.log('✅ Backend response:', res.data);
      setAddress(res.data.address);
      setShowAddressOnly(true); // ✅ Switch to show only address input
    } catch (err) {
      console.error('❌ Error generating address:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-[#1E2329] p-6 rounded shadow-lg w-full max-w-md">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl mb-6 text-yellow-400 font-bold">Deposit Crypto</h2>

        {!showAddressOnly ? (
          <>
            <label className="block mb-2 text-sm">Select Coin</label>
            <select
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {coins.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.symbol} ({coin.name})
                </option>
              ))}
            </select>

            <label className="block mb-2 text-sm">Amount (USD)</label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
            />

            <button
              onClick={generateAddress}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500 transition"
            >
              {loading ? 'Generating...' : 'Generate Address'}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm">Your Deposit Address</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={address}
                onClick={copyAddress}
                className="w-full p-2 rounded bg-gray-700 text-white cursor-pointer"
              />
              {copied && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-xs">
                  Copied!
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Click address to copy to clipboard.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
