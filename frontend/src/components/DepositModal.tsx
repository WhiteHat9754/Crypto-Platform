import React, { useState } from 'react';
import axios from 'axios';

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
      <div className="bg-[#1E2329] p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl mb-4 text-yellow-400 font-bold">Deposit Crypto</h2>

        <label className="block mb-2 text-sm">Select Coin</label>
        <select
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {coins.map((coin) => (
            <option key={coin.id} value={coin.symbol}>
              {coin.symbol} ({coin.name})
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm">Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
        />

        <p className="text-gray-400 mb-4 break-words">
          {address ? (
            <span
              className="cursor-pointer hover:underline"
              onClick={copyAddress}
              title="Click to copy"
            >
              {address}
              {copied && <span className="text-green-400 ml-2">Copied!</span>}
            </span>
          ) : (
            'Your unique deposit address will appear here after clicking Generate Address.'
          )}
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">
            Close
          </button>
          <button
            onClick={generateAddress}
            disabled={loading}
            className="px-4 py-2 bg-yellow-400 text-black rounded"
          >
            {loading ? 'Generating...' : 'Generate Address'}
          </button>
        </div>
      </div>
    </div>
  );
}
