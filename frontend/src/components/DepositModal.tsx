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
  const [amount, setAmount] = useState('');
  const [inputMode, setInputMode] = useState<'crypto' | 'usd'>('usd');
  const [price, setPrice] = useState(1);
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddressOnly, setShowAddressOnly] = useState(false);

  const generateAddress = async () => {
    setLoading(true);
    try {
      const amt = inputMode === 'crypto' ? parseFloat(amount) * price : parseFloat(amount);
      const res = await axios.post(
        'http://localhost:5000/api/payments/create',
        { currency, amount: amt },
        { withCredentials: true }
      );
      setAddress(res.data.address);
      setShowAddressOnly(true);
    } catch (err) {
      console.error('Error generating address:', err);
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
      <div className="relative bg-white p-6 rounded shadow-lg w-full max-w-md text-gray-900">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl mb-6 text-yellow-500 font-bold">Deposit Crypto</h2>

        {!showAddressOnly ? (
          <>
            <label className="block mb-2 text-sm font-medium">Select Coin</label>
            <select
              className="w-full mb-4 p-2 rounded border bg-white text-gray-900"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {coins.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.symbol} ({coin.name})
                </option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-medium">Amount</label>
            <div className="relative mb-4">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded border text-gray-900 pr-20 no-spinner"
                placeholder={inputMode === 'crypto' ? 'Amount in crypto' : 'Amount in USD'}
              />
              <button
                type="button"
                onClick={() => setInputMode(inputMode === 'crypto' ? 'usd' : 'crypto')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
              >
                {inputMode === 'crypto' ? 'USD' : 'Crypto'}
              </button>
            </div>

            <button
              onClick={generateAddress}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500"
            >
              {loading ? 'Generating...' : 'Generate Address'}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm font-medium">Your Deposit Address</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={address}
                onClick={copyAddress}
                className="w-full p-2 rounded border bg-gray-100 text-gray-900 cursor-pointer"
              />
              {copied && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs">
                  Copied!
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Click to copy address.</p>
          </>
        )}

        <style>{`
          input.no-spinner::-webkit-outer-spin-button,
          input.no-spinner::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input.no-spinner {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>
    </div>
  );
}
