// src/components/Market/TradeHistory.tsx
import React from 'react';

interface Trade {
  price: string;
  amount: string;
  time: string;
}

export default function TradeHistory({ trades = [] }: { trades?: Trade[] }) {
  return (
    <div className="card">
      <h3 className="heading-secondary mb-2">Recent Trades</h3>
      <div className="text-sm space-y-1">
        {trades.length > 0 ? (
          trades.map((trade, i) => (
            <p key={i}>
              {trade.time} | {trade.amount} @ ${trade.price}
            </p>
          ))
        ) : (
          <p className="text-gray-500">No recent trades yet.</p>
        )}
      </div>
    </div>
  );
}
