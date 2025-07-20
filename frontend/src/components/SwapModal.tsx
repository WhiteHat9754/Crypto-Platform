import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Coin {
  symbol: string;
  name: string;
  image: string;
}

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: Coin[];
}

const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, coins }) => {
  const [fromCoin, setFromCoin] = useState('BTC');
  const [toCoin, setToCoin] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [inputMode, setInputMode] = useState<'crypto' | 'usd'>('crypto');
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [estimated, setEstimated] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchBalance = async () => {
      try {
        const res = await axios.get('/api/user/wallet', { withCredentials: true });
        const balanceData = res.data.find((coin: any) => coin.symbol.toUpperCase() === fromCoin);
        setAvailableBalance(balanceData?.available || 0);
      } catch {
        setAvailableBalance(null);
      }
    };

    fetchBalance();
  }, [isOpen, fromCoin]);

  useEffect(() => {
    const estimate = async () => {
      if (!amount || isNaN(Number(amount))) return;
      try {
        const res = await axios.post('/api/wallet/swap/estimate-swap', {
          fromCoin,
          toCoin,
          amount: parseFloat(amount),
          type: inputMode,
        });
        if (res.data.estimatedAmount !== undefined) {
          setEstimated(res.data.estimatedAmount);
        }
      } catch (err) {
        console.error("Estimate error:", err.response?.data || err.message);
        setEstimated(null);
      }
    };

    estimate();
  }, [amount, fromCoin, toCoin, inputMode]);

  const handleSwap = async () => {
    try {
      const res = await axios.post('/api/wallet/swap/swap', {
        fromCoin,
        toCoin,
        amount: parseFloat(amount),
        type: inputMode,
      });
      setMessage(res.data.message || 'Swap successful');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Swap failed');
    }
  };

  const renderCoinSelector = (selected: string, setSelected: (v: string) => void) => (
    <select
      className="p-2 rounded border bg-white text-gray-900"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
    >
      {coins.map((coin) => (
        <option key={coin.symbol} value={coin.symbol}>
          {coin.symbol}
        </option>
      ))}
    </select>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Swap Crypto</h2>

        {/* From Section */}
        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
        <div className="flex gap-2 items-center mb-1 relative">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={inputMode === 'crypto' ? 'Amount in crypto' : 'Amount in USD'}
            className="flex-1 p-2 border rounded text-gray-900 placeholder-gray-400 pr-20 no-spinner"
          />
          <button
            type="button"
            onClick={() => setInputMode(inputMode === 'crypto' ? 'usd' : 'crypto')}
            className="absolute right-24 top-1/2 -translate-y-1/2 bg-gray-100 text-sm px-2 py-1 rounded border hover:bg-gray-200"
          >
            {inputMode === 'crypto' ? 'USD' : 'Crypto'}
          </button>
          {renderCoinSelector(fromCoin, setFromCoin)}
        </div>
        {availableBalance !== null && (
          <div className="text-sm text-gray-500 mb-4">
            Available: {availableBalance.toFixed(8)} {fromCoin}
          </div>
        )}

        {/* To Section */}
        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
        <div className="flex gap-2 items-center mb-2">
          <input
            type="text"
            disabled
            className="flex-1 p-2 border rounded bg-gray-100 text-gray-900"
            value={typeof estimated === 'number' ? estimated.toFixed(8) : ''}
            placeholder="Estimated"
          />
          {renderCoinSelector(toCoin, setToCoin)}
        </div>

        <button
          onClick={handleSwap}
          className="w-full bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700"
        >
          Swap Now
        </button>

        {message && <p className="mt-2 text-center text-sm text-gray-700">{message}</p>}

        <button onClick={onClose} className="mt-4 text-sm text-gray-600 underline block mx-auto">
          Close
        </button>

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
};

export default SwapModal;
