// src/components/Market/OrderBook.tsx
import React from 'react';

interface Order {
  price: string;
  amount: string;
}

export default function OrderBook({
  bids = [],
  asks = [],
}: {
  bids?: Order[];
  asks?: Order[];
}) {
  return (
    <div className="card">
      <h3 className="heading-secondary mb-2">Order Book</h3>
      <div className="grid grid-cols-2 text-sm">
        <div>
          <h4 className="font-semibold mb-1">Bids</h4>
          {bids.length > 0 ? (
            bids.map((bid, i) => (
              <p key={i}>{bid.price} | {bid.amount}</p>
            ))
          ) : (
            <p className="text-gray-500">No bids yet.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-1">Asks</h4>
          {asks.length > 0 ? (
            asks.map((ask, i) => (
              <p key={i}>{ask.price} | {ask.amount}</p>
            ))
          ) : (
            <p className="text-gray-500">No asks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
