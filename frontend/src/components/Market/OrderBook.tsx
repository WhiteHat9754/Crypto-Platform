// src/components/Market/OrderBook.tsx
import React from 'react';

export default function OrderBook() {
  const bids = [
    { price: '29500.00', amount: '0.5 BTC' },
    { price: '29480.00', amount: '1.2 BTC' },
  ];
  const asks = [
    { price: '29520.00', amount: '0.4 BTC' },
    { price: '29550.00', amount: '0.8 BTC' },
  ];

  return (
    <div className="card">
      <h3 className="heading-secondary mb-2">Order Book</h3>
      <div className="grid grid-cols-2 text-sm">
        <div>
          <h4 className="font-semibold mb-1">Bids</h4>
          {bids.map((bid, i) => (
            <p key={i}>{bid.price} | {bid.amount}</p>
          ))}
        </div>
        <div>
          <h4 className="font-semibold mb-1">Asks</h4>
          {asks.map((ask, i) => (
            <p key={i}>{ask.price} | {ask.amount}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
