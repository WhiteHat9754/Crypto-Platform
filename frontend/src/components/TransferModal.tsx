// src/components/TransferModal.tsx

import React, { useState } from 'react';

export default function TransferModal({
  onClose,
  coins,
}: {
  onClose: () => void;
  coins: any[];
}) {
  const [selectedCoin, setSelectedCoin] = useState(coins[0]?.id || '');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E2329] p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl mb-4 text-yellow-400 font-bold">Transfer Crypto</h2>

        <label className="block mb-2 text-sm">Select Coin</label>
        <select
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
        >
          {coins.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.symbol} ({coin.name})
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm">To Wallet</label>
        <input
          type="text"
          value={toWallet}
          onChange={(e) => setToWallet(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          placeholder="Recipient wallet ID"
        />

        <label className="block mb-2 text-sm">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
          placeholder="0.00"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button className="px-4 py-2 bg-yellow-400 text-black rounded">
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
