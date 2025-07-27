import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  DollarSign,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Send,
  Download
} from 'lucide-react';
import { useSession } from '../context/SessionProvider';
import LivePrices from '../components/Market/LivePrices';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface WalletAsset {
  name: string;
  symbol: string;
  amount: number;
  icon?: string;
}

const walletData: WalletAsset[] = [
  { name: 'bitcoin', symbol: 'BTC', amount: 0.0245, icon: '₿' },
  { name: 'ethereum', symbol: 'ETH', amount: 0.8921, icon: 'Ξ' },
  { name: 'tether', symbol: 'USDT', amount: 1250.50, icon: '₮' },
  { name: 'solana', symbol: 'SOL', amount: 15.25, icon: '◎' },
];

const COINS = ['bitcoin', 'ethereum', 'tether', 'solana', 'dogecoin', 'binancecoin'];

export default function Dashboard() {
  const { isLoading, isLoggedIn, user } = useSession();
  const [prices, setPrices] = useState<CoinData[]>([]);
  const [coinPrices, setCoinPrices] = useState<{ [key: string]: { usd: number } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch market data
        const marketRes = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: { 
            vs_currency: 'usd', 
            ids: COINS.join(','), 
            order: 'market_cap_desc',
            sparkline: false 
          },
        });
        setPrices(marketRes.data);

        // Fetch wallet prices
        const walletIds = walletData.map(w => w.name).join(',');
        const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: { ids: walletIds, vs_currencies: 'usd' },
        });
        setCoinPrices(priceRes.data);

        // Calculate total portfolio value
        let totalValue = 0;
        walletData.forEach(asset => {
          const price = priceRes.data[asset.name]?.usd || 0;
          totalValue += price * asset.amount;
        });
        setTotalPortfolioValue(totalValue);
        
        // Mock portfolio change (in real app, calculate from historical data)
        setPortfolioChange(2.45);

      } catch (err) {
        setError('Failed to fetch market data');
        console.error('Dashboard API error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-900 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-yellow-200/50 dark:border-amber-700/50"
        >
          <Wallet className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Please Sign In
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Access your dashboard and manage your crypto portfolio
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-amber-700 transition-all shadow-lg"
          >
            Sign In Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Welcome back, {user?.firstName || 'Trader'}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Here's what's happening with your crypto portfolio today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-lg hover:shadow-xl transition-all border border-yellow-200/50 dark:border-amber-700/50"
              >
                <RefreshCw className="w-5 h-5 text-yellow-600" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Portfolio Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 dark:border-amber-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Balance</p>
                <div className="flex items-center space-x-2">
                  {hideBalances ? (
                    <span className="text-2xl font-bold text-slate-400">••••••</span>
                  ) : (
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                      ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <button
                    onClick={() => setHideBalances(!hideBalances)}
                    className="text-slate-400 hover:text-yellow-600 transition-colors"
                  >
                    {hideBalances ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {portfolioChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${portfolioChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioChange >= 0 ? '+' : ''}{portfolioChange}% (24h)
              </span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          {[
            { icon: Plus, label: 'Buy Crypto', color: 'from-green-400 to-green-600' },
            { icon: Send, label: 'Send', color: 'from-blue-400 to-blue-600' },
            { icon: Download, label: 'Receive', color: 'from-purple-400 to-purple-600' }
          ].map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 dark:border-amber-700/50 shadow-xl cursor-pointer hover:shadow-2xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{action.label}</p>
                  <p className="text-slate-800 dark:text-white font-semibold">Quick Access</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Assets */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 dark:border-amber-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Assets</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {walletData.filter(w => w.amount > 0).length} assets
                </span>
              </div>

              <div className="space-y-4">
                {walletData.filter(w => w.amount > 0).map((asset, index) => {
                  const price = coinPrices[asset.name]?.usd || 0;
                  const totalValue = price * asset.amount;
                  const marketData = prices.find(p => p.id === asset.name);
                  const change24h = marketData?.price_change_percentage_24h || 0;

                  return (
                    <motion.div
                      key={asset.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-700/80 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{asset.icon || asset.symbol[0]}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-white">{asset.symbol}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{asset.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {hideBalances ? '••••••' : `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">
                            {asset.amount} {asset.symbol}
                          </span>
                          <span className={`flex items-center ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(change24h).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Market Overview & Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Market Overview */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 dark:border-amber-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white">Market Overview</h3>
                <Activity className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-3">
                {prices.slice(0, 4).map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        ${coin.current_price.toLocaleString()}
                      </p>
                      <p className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 dark:border-amber-700/50 shadow-xl">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">Bought BTC</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">+0.0012 BTC</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Send className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">Sent ETH</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">-0.25 ETH</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg"
          >
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
