// src/components/Market/MarketStats.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MarketStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin');
      setStats({
        high: res.data.market_data.high_24h.usd,
        low: res.data.market_data.low_24h.usd,
        volume: res.data.market_data.total_volume.usd,
        change: res.data.market_data.price_change_percentage_24h,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="card">
      <h3 className="heading-secondary mb-2">Market Stats</h3>
      {stats ? (
        <div className="text-sm space-y-1">
          <p>24h High: ${stats.high.toLocaleString()}</p>
          <p>24h Low: ${stats.low.toLocaleString()}</p>
          <p>24h Volume: ${stats.volume.toLocaleString()}</p>
          <p>
            24h Change:{' '}
            <span className={stats.change >= 0 ? 'market-positive' : 'market-negative'}>
              {stats.change.toFixed(2)}%
            </span>
          </p>
        </div>
      ) : (
        <p className="text-muted">Loading...</p>
      )}
    </div>
  );
}
