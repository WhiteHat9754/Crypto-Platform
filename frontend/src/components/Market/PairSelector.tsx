// src/components/Market/PairSelector.tsx
import React, { useState } from 'react';

const pairs = [
  { label: 'BTC/USD', value: 'BTCUSDT' },
  { label: 'ETH/USD', value: 'ETHUSDT' },
  { label: 'DOGE/USD', value: 'DOGEUSDT' },
];

export default function PairSelector() {
  const [selected, setSelected] = useState(pairs[0].value);

  return (
    <div className="flex gap-2 mb-2">
      {pairs.map((pair) => (
        <button
          key={pair.value}
          onClick={() => setSelected(pair.value)}
          className={`px-4 py-2 rounded ${
            selected === pair.value ? 'bg-yellow-400 text-black' : 'bg-gray-200'
          }`}
        >
          {pair.label}
        </button>
      ))}
    </div>
  );
}
