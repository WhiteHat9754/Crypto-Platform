// src/components/WithdrawModal.tsx

import React, { useState } from 'react';

export default function WithdrawModal({
  onClose,
  coins,
}: {
  onClose: () => void;
  coins: any[];
}) {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]?.id || '');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleWithdraw = () => {
    // Placeholder: add your API call here!
    if (!selectedCoin || !address || !amount) {
      alert('Please fill out all fields.');
      return;
    }

    console.log('Withdraw:', {
      coin: selectedCoin,
      address,
      amount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E2329] p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl mb-4 text-yellow-400 font-bold">Withdraw Crypto</h2>

        {/* Coin selection */}
        <label className="block mb-2 text-sm">Select Coin</label>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
        >
          {coins.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.symbol} ({coin.name})
            </option>
          ))}
        </select>

        {/* Recipient Address */}
        <label className="block mb-2 text-sm">Recipient Wallet Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          placeholder="Enter recipient wallet address"
        />

        {/* Amount */}
        <label className="block mb-2 text-sm">Amount</label>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          placeholder="0.00"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
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
      </div>
    </div>
  );
}
