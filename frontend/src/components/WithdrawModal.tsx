import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function WithdrawModal({
  onClose,
  coins,
}: {
  onClose: () => void;
  coins: any[];
}) {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]?.symbol || '');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [inputMode, setInputMode] = useState<'crypto' | 'usd'>('crypto');
  const [price, setPrice] = useState(1); // Default price fallback

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${selectedCoin}&tsyms=USD`);
        const data = await res.json();
        setPrice(data.USD || 1);
      } catch {
        setPrice(1);
      }
    };

    fetchPrice();
  }, [selectedCoin]);

  const handleWithdraw = () => {
    if (!selectedCoin || !address || !amount) {
      alert('Please fill out all fields.');
      return;
    }

    const finalAmount = inputMode === 'usd' ? parseFloat(amount) / price : parseFloat(amount);

    console.log('Withdraw:', {
      coin: selectedCoin,
      address,
      amount: finalAmount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded shadow-lg w-full max-w-md text-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl mb-6 text-yellow-500 font-bold">Withdraw Crypto</h2>

        {/* Coin Selection */}
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full mb-4 p-2 rounded border bg-white text-gray-900"
        >
          {coins.map((coin) => (
            <option key={coin.symbol} value={coin.symbol}>
              {coin.symbol} ({coin.name})
            </option>
          ))}
        </select>

        {/* Recipient Wallet */}
        <label className="block mb-2 text-sm font-medium text-gray-700">Recipient Wallet Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-4 p-2 rounded border bg-white text-gray-900"
          placeholder="Enter recipient address"
        />

        {/* Amount Input */}
        <label className="block mb-2 text-sm font-medium text-gray-700">Amount</label>
        <div className="relative mb-6">
          <input
            type="number"
            inputMode="decimal"
            className="w-full p-2 rounded border bg-white text-gray-900 no-spinner pr-20"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500"
          >
            Confirm Withdraw
          </button>
        </div>

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
