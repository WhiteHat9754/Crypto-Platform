// src/components/Market/MarketStats.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export default function MarketStats() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: 'bitcoin,ethereum,binancecoin,cardano,solana,polkadot',
            },
          }
        );
        setCoins(res.data);
      } catch (err) {
        console.error('Error fetching market stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="card overflow-x-auto">
      <h3 className="heading-secondary mb-4">Market Stats</h3>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : coins.length > 0 ? (
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 font-semibold">Coin</th>
              <th className="py-2 px-3 font-semibold">Price</th>
              <th className="py-2 px-3 font-semibold">24h High</th>
              <th className="py-2 px-3 font-semibold">24h Low</th>
              <th className="py-2 px-3 font-semibold">24h Volume</th>
              <th className="py-2 px-3 font-semibold">% Change</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr key={coin.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">
                  {coin.name} ({coin.symbol.toUpperCase()})
                </td>
                <td className="py-2 px-3">${coin.current_price.toLocaleString()}</td>
                <td className="py-2 px-3">${coin.high_24h.toLocaleString()}</td>
                <td className="py-2 px-3">${coin.low_24h.toLocaleString()}</td>
                <td className="py-2 px-3">${coin.total_volume.toLocaleString()}</td>
                <td
                  className={`py-2 px-3 ${
                    coin.price_change_percentage_24h >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No data available.</p>
      )}
    </div>
  );
}
