// src/components/Market/MarketWidget.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Ticker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

export default function MarketWidget() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [view, setView] = useState<'top' | 'newest'>('top');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        setTickers(res.data);
      } catch (err) {
        console.error('MarketWidget API error:', err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const top10 = [...tickers]
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
    .slice(0, 10);

  const newest = tickers.slice(-10);

  const dataToShow = view === 'top' ? top10 : newest;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-4 max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setView('top')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            view === 'top'
              ? 'bg-yellow-400 text-black shadow'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Top 10 Cryptos
        </button>
        <button
          onClick={() => setView('newest')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            view === 'newest'
              ? 'bg-yellow-400 text-black shadow'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Newest Cryptos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-2 font-semibold text-gray-500">Symbol</th>
              <th className="py-2 font-semibold text-gray-500">Price</th>
              <th className="py-2 font-semibold text-gray-500">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {dataToShow.map((ticker) => (
              <tr
                key={ticker.symbol}
                className="hover:bg-gray-50 transition"
              >
                <td className="py-2 font-medium">{ticker.symbol}</td>
                <td className="py-2">${parseFloat(ticker.lastPrice).toFixed(4)}</td>
                <td
                  className={`py-2 ${
                    parseFloat(ticker.priceChangePercent) >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {parseFloat(ticker.priceChangePercent).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
