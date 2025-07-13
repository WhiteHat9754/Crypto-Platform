import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Ticker {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

export default function LivePricesTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([
    { symbol: 'BTCUSDT', price: '29500', priceChangePercent: '1.5' },
    { symbol: 'ETHUSDT', price: '1850', priceChangePercent: '-0.5' },
    { symbol: 'BNBUSDT', price: '245', priceChangePercent: '0.8' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const majorPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
        const filtered = res.data
          .filter((item: any) => majorPairs.includes(item.symbol))
          .map((item: any) => ({
            symbol: item.symbol,
            price: item.lastPrice || '0',
            priceChangePercent: item.priceChangePercent || '0',
          }));
        setTickers(filtered);
      } catch (err) {
        console.error('Ticker API error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
      {tickers.map((ticker) => (
        <div key={ticker.symbol} className="flex items-baseline space-x-2">
          <span className="font-semibold">{ticker.symbol}</span>
          <span>{parseFloat(ticker.price || '0').toFixed(2)}</span>
          <span
            className={
              parseFloat(ticker.priceChangePercent || '0') >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {parseFloat(ticker.priceChangePercent || '0').toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}
