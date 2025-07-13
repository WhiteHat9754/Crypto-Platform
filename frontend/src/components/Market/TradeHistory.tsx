// src/components/Market/TradeHistory.tsx
import React from 'react';

export default function TradeHistory() {
  const trades = [
    { price: '29510.00', amount: '0.1 BTC', time: '12:01' },
    { price: '29512.00', amount: '0.05 BTC', time: '12:02' },
  ];

  return (
    <div className="card">
      <h3 className="heading-secondary mb-2">Recent Trades</h3>
      <div className="text-sm space-y-1">
        {trades.map((trade, i) => (
          <p key={i}>
            {trade.time} | {trade.amount} @ ${trade.price}
          </p>
        ))}
      </div>
    </div>
  );
}
