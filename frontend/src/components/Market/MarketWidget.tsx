import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Ticker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

export default function MarketWidget() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [view, setView] = useState<'top' | 'newest'>('top');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const res = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        setTickers(res.data);
        setLoading(false);
      } catch (err) {
        console.error('MarketWidget API error:', err);
        setError('Failed to load market data');
        setLoading(false);
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="flex space-x-2 mb-4">
            <div className="h-8 bg-slate-600/50 rounded-full w-24"></div>
            <div className="h-8 bg-slate-600/50 rounded-full w-24"></div>
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-600/50 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-slate-600/50 rounded w-16"></div>
                  <div className="h-3 bg-slate-600/50 rounded w-12"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-slate-600/50 rounded w-20"></div>
                <div className="h-3 bg-slate-600/50 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400 font-medium">Connection Error</span>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Live Prices</h3>
        <div className="flex items-center text-green-400 text-sm">
          <Activity className="w-4 h-4 mr-1 animate-pulse" />
          Live
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setView('top')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            view === 'top'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          Top 10
        </button>
        <button
          onClick={() => setView('newest')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            view === 'newest'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          Recent
        </button>
      </div>

      {/* Market Data */}
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {dataToShow.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No market data available
          </div>
        ) : (
          dataToShow.map((ticker) => {
            const price = parseFloat(ticker.lastPrice);
            const change = parseFloat(ticker.priceChangePercent);
            const isPositive = change >= 0;

            return (
              <div 
                key={ticker.symbol}
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">
                      {ticker.symbol.replace('USDT', '').slice(0, 3)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {ticker.symbol.replace('USDT', '')}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {ticker.symbol.includes('USDT') ? 'USDT' : 'BTC'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-white text-sm">
                    ${price < 1 ? price.toFixed(6) : price.toFixed(2)}
                  </div>
                  <div className={`flex items-center justify-end text-xs ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-slate-400 text-center">
          Data from Binance • Updates every 30s
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
