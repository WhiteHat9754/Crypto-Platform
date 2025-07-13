// src/components/Market/LivePrices.tsx
import React from 'react';
import PairSelector from './PairSelector';
import CandlestickChart from './CandlestickChart';
import MarketStats from './MarketStats';
import OrderBook from './OrderBook';
import TradeHistory from './TradeHistory';

export default function LivePrices() {
  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
      {/* Always full width */}
      <div className="md:col-span-3">
        <PairSelector />
      </div>

      {/* Left side: Chart + Stats */}
      <div className="md:col-span-2 flex flex-col gap-4">
        <CandlestickChart />
        <MarketStats />
      </div>

      {/* Right side: OrderBook + Trades */}
      <div className="flex flex-col gap-4">
        <OrderBook />
        <TradeHistory />
      </div>
    </div>
  );
}
