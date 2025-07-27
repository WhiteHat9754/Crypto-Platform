// src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from '../context/SessionProvider';
import '../styles/dashboard.css';
import LivePrices from '../components/Market/LivePrices';

const walletData = [
  { name: 'bitcoin', symbol: 'BTC', amount: 0 },
  { name: 'ethereum', symbol: 'ETH', amount: 0 },
  { name: 'tether', symbol: 'USDT', amount: 0 },
  { name: 'solana', symbol: 'SOL', amount: 0 },
];

const COINS = ['bitcoin', 'ethereum', 'tether', 'solana', 'dogecoin', 'binancecoin'];

export default function Dashboard() {
  const { isLoading, isLoggedIn, user } = useSession();
  const [prices, setPrices] = useState<any[]>([]);
  const [coinPrices, setCoinPrices] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const ids = COINS.join(',');
      const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: { vs_currency: 'usd', ids, order: 'market_cap_desc' },
      });
      setPrices(res.data);
    };

    const fetchWalletPrices = async () => {
      const ids = walletData.map(c => c.name).join(',');
      const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: { ids, vs_currencies: 'usd' },
      });

      const pricesMap: { [key: string]: number } = {};
      for (const id of Object.keys(res.data)) {
        pricesMap[id] = res.data[id].usd;
      }
      setCoinPrices(pricesMap);
    };

    fetchPrices();
    fetchWalletPrices();

    const interval = setInterval(() => {
      fetchPrices();
      fetchWalletPrices();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <main className="main-wrapper bg-white flex items-center justify-center text-muted">
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="main-wrapper bg-white">
      {/* <h2 className="heading-primary mb-6">
        Quota Flow
      </h2> */}

      {/* Wallet cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {isLoggedIn ? (
          walletData.every((wallet) => wallet.amount === 0) ? (
            <div className="card">
              <div className="text-muted">Wallet BTC</div>
              <div className="wallet-balance">$0.00</div>
            </div>
          ) : (
            walletData
              .filter((wallet) => wallet.amount > 0)
              .map((wallet) => {
                const livePrice = coinPrices[wallet.name] || 0;
                const totalValue = livePrice * wallet.amount;

                return (
                  <div key={wallet.symbol} className="card">
                    <div className="text-muted">Wallet {wallet.symbol}</div>
                    <div className="wallet-balance">
                      ${totalValue.toFixed(2)}
                    </div>
                  </div>
                );
              })
          )
        ) : (
          <div className="card flex items-center justify-center h-24">
            <p className="text-muted">Login to see your Wallet</p>
          </div>
        )}
      </div>

      {/* Live Market */}
      <LivePrices />

      {/* Recent Activity */}
      <div className="card mt-8">
        <h3 className="heading-secondary mb-4">🕓 Recent Activity</h3>
        <ul className="text-sm space-y-2 text-muted">
          <li className="italic">No Activity</li>
        </ul>
      </div>
    </main>
  );
}
