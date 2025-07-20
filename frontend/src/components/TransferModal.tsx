import React, { useState } from 'react';

export default function TransferModal({
  onClose,
  coins,
}: {
  onClose: () => void;
  coins: any[];
}) {
  const [fromCoin, setFromCoin] = useState(coins[0]?.symbol || 'BTC');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [inputMode, setInputMode] = useState<'crypto' | 'usd'>('crypto');
  const [message, setMessage] = useState('');

  const handleTransfer = async () => {
    if (!recipientEmail || !amount || isNaN(Number(amount))) {
      setMessage('Please fill in all fields correctly.');
      return;
    }

    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: recipientEmail,
          currency: fromCoin,
          amount: parseFloat(amount),
          type: inputMode,
        }),
      });

      const data = await res.json();
      setMessage(data.message || 'Transfer complete.');
    } catch (err) {
      setMessage('Transfer failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md text-gray-900">
        <h2 className="text-xl font-bold mb-4 text-yellow-500">Transfer Crypto</h2>

        {/* Coin selection */}
        <label className="block mb-2 text-sm font-medium">From Coin</label>
        <select
          value={fromCoin}
          onChange={(e) => setFromCoin(e.target.value)}
          className="w-full mb-4 p-2 rounded border text-gray-900 bg-white"
        >
          {coins.map((coin) => (
            <option key={coin.symbol} value={coin.symbol}>
              {coin.symbol} ({coin.name})
            </option>
          ))}
        </select>

        {/* Amount */}
        <label className="block mb-2 text-sm font-medium">Amount</label>
        <div className="relative mb-4">
          <input
            type="number"
            inputMode="decimal"
            className="w-full p-2 rounded border pr-20 text-gray-900 no-spinner"
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

        {/* Email */}
        <label className="block mb-2 text-sm font-medium">Recipient Email</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full mb-4 p-2 rounded border text-gray-900"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500"
          >
            Send Transfer
          </button>
        </div>

        {message && (
          <p className="mt-3 text-sm text-center text-gray-600">{message}</p>
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
