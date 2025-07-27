import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionProvider';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import TransferModal from '../components/TransferModal';
import SwapModal from '../components/SwapModal';
import RecentTransactions from '../components/RecentTransactions';

interface WalletBalance {
  currency: string;
  balance: number;
  available: number;
  inOrder: number;
  usdValue: number;
  price: number;
  change24h: number;
}

interface CryptoPrices {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export default function Wallet() {
  const { isLoading: sessionLoading, isLoggedIn, user } = useSession();
  const [walletData, setWalletData] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideBalances, setHideBalances] = useState(false);
  const [error, setError] = useState<string>('');

  // Modal states
  const [isDepositOpen, setDepositOpen] = useState(false);
  const [isWithdrawOpen, setWithdrawOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [isSwapOpen, setSwapOpen] = useState(false);

  // Supported cryptocurrencies
  const supportedCoins = [
    { symbol: 'BTC', name: 'Bitcoin', image: '/icons/btc.png' },
    { symbol: 'ETH', name: 'Ethereum', image: '/icons/eth.png' },
    { symbol: 'USDT', name: 'Tether', image: '/icons/usdt.png' },
    { symbol: 'USDC', name: 'USD Coin', image: '/icons/usdc.png' },
    { symbol: 'SOL', name: 'Solana', image: '/icons/sol.png' },
    { symbol: 'ADA', name: 'Cardano', image: '/icons/ada.png' },
    { symbol: 'DOT', name: 'Polkadot', image: '/icons/dot.png' },
    { symbol: 'DOGE', name: 'Dogecoin', image: '/icons/doge.png' },
  ];

  // Fetch wallet data from backend
  const fetchWalletData = async (showLoading = true) => {
    if (!isLoggedIn) return;

    try {
      if (showLoading) setLoading(true);
      setError('');

      console.log('🔄 Fetching wallet data...');

      // Fetch user's wallet balances
      const walletResponse = await axios.get('http://localhost:5000/api/wallet/balances', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ Wallet response:', walletResponse.data);

      // Get current crypto prices from CoinGecko
      const cryptoIds = supportedCoins.map(coin => 
        coin.symbol.toLowerCase() === 'usdt' ? 'tether' :
        coin.symbol.toLowerCase() === 'usdc' ? 'usd-coin' :
        coin.symbol.toLowerCase() === 'btc' ? 'bitcoin' :
        coin.symbol.toLowerCase() === 'eth' ? 'ethereum' :
        coin.symbol.toLowerCase() === 'sol' ? 'solana' :
        coin.symbol.toLowerCase() === 'ada' ? 'cardano' :
        coin.symbol.toLowerCase() === 'dot' ? 'polkadot' :
        coin.symbol.toLowerCase() === 'doge' ? 'dogecoin' :
        coin.symbol.toLowerCase()
      ).join(',');

      const pricesResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`
      );

      console.log('✅ Prices response:', pricesResponse.data);

      const prices: CryptoPrices = pricesResponse.data;

      // Process wallet data
      const userBalances = walletResponse.data.data?.balances || {};
      const processedWallet: WalletBalance[] = supportedCoins.map(coin => {
        const balance = userBalances[coin.symbol] || 0;
        const coinId = coin.symbol.toLowerCase() === 'usdt' ? 'tether' :
                      coin.symbol.toLowerCase() === 'usdc' ? 'usd-coin' :
                      coin.symbol.toLowerCase() === 'btc' ? 'bitcoin' :
                      coin.symbol.toLowerCase() === 'eth' ? 'ethereum' :
                      coin.symbol.toLowerCase() === 'sol' ? 'solana' :
                      coin.symbol.toLowerCase() === 'ada' ? 'cardano' :
                      coin.symbol.toLowerCase() === 'dot' ? 'polkadot' :
                      coin.symbol.toLowerCase() === 'doge' ? 'dogecoin' :
                      coin.symbol.toLowerCase();

        const currentPrice = prices[coinId]?.usd || 0;
        const change24h = prices[coinId]?.usd_24h_change || 0;

        return {
          currency: coin.symbol,
          balance: balance,
          available: balance, // For now, assume all balance is available
          inOrder: 0, // Will be implemented when trading is added
          price: currentPrice,
          usdValue: balance * currentPrice,
          change24h: change24h
        };
      });

      setWalletData(processedWallet);

    } catch (error: any) {
      console.error('❌ Wallet fetch error:', error);
      setError('Failed to fetch wallet data. Please try again.');
      
      // Set empty wallet with supported coins
      setWalletData(supportedCoins.map(coin => ({
        currency: coin.symbol,
        balance: 0,
        available: 0,
        inOrder: 0,
        price: 0,
        usdValue: 0,
        change24h: 0
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh wallet data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData(false);
  };

  // Initial fetch
  useEffect(() => {
    if (!sessionLoading && isLoggedIn) {
      fetchWalletData();
    } else if (!sessionLoading && !isLoggedIn) {
      setLoading(false);
    }
  }, [sessionLoading, isLoggedIn]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      fetchWalletData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Calculate total portfolio value
  const totalBalance = walletData.reduce((sum, coin) => sum + coin.usdValue, 0);
  const totalChange24h = walletData.reduce((sum, coin) => {
    const coinValue24hAgo = coin.usdValue / (1 + coin.change24h / 100);
    return sum + (coin.usdValue - coinValue24hAgo);
  }, 0);
  const totalChangePercent = totalBalance > 0 ? (totalChange24h / totalBalance) * 100 : 0;

  // Filter wallet data
  const filteredWallet = walletData.filter((coin) => {
    const coinInfo = supportedCoins.find(c => c.symbol === coin.currency);
    const matchesSearch = coinInfo
      ? coinInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.currency.toLowerCase().includes(searchTerm.toLowerCase())
      : coin.currency.toLowerCase().includes(searchTerm.toLowerCase());
    const hasBalance = showOnlyWithBalance ? coin.balance > 0 : true;
    return matchesSearch && hasBalance;
  });

  // Loading state
  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full"
        />
      </div>
    );
  }

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <WalletIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Required</h2>
        <p className="text-gray-500">Please log in to view your wallet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your cryptocurrency portfolio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">{hideBalances ? 'Show' : 'Hide'}</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium mb-2 opacity-90">
              Total Portfolio Value
            </h2>
            <p className="text-4xl font-bold">
              {hideBalances ? '••••••' : `$${totalBalance.toFixed(2)}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {totalChangePercent >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {hideBalances ? '••••' : `${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(2)}%`}
              </span>
              <span className="text-sm opacity-75">24h</span>
            </div>
          </div>
          <div className="text-right opacity-75">
            <p className="text-sm">Welcome back,</p>
            <p className="font-medium">{user?.firstName}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setDepositOpen(true)}
          className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-md"
        >
          <span>📥</span>
          <span>Deposit</span>
        </button>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md"
        >
          <span>📤</span>
          <span>Withdraw</span>
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md"
        >
          <span>🔄</span>
          <span>Transfer</span>
        </button>
        <button
          onClick={() => setSwapOpen(true)}
          className="flex items-center justify-center gap-2 bg-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-600 transition-colors shadow-md"
        >
          <span>🔁</span>
          <span>Swap</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showOnlyWithBalance}
            onChange={() => setShowOnlyWithBalance(!showOnlyWithBalance)}
            className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
          />
          Show only assets with balance
        </label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWallet.map((asset, index) => {
          const coinInfo = supportedCoins.find(c => c.symbol === asset.currency);
          return (
            <motion.div
              key={asset.currency}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={coinInfo?.image || `/icons/${asset.currency.toLowerCase()}.png`} 
                  alt={asset.currency}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/default-coin.png';
                  }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {asset.currency}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {coinInfo?.name || asset.currency}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className={`text-sm font-medium ${
                    asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {hideBalances ? '••••••••' : asset.balance.toFixed(8)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Available:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {hideBalances ? '••••••••' : asset.available.toFixed(8)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">USD Value:</span>
                  <span className="font-semibold text-yellow-600">
                    {hideBalances ? '••••••' : `$${asset.usdValue.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    ${asset.price.toFixed(asset.price < 1 ? 6 : 2)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredWallet.length === 0 && (
        <div className="text-center py-12">
          <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No assets found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search' : 'Start by depositing some cryptocurrency'}
          </p>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mt-8">
        <RecentTransactions />
      </div>

      {/* Modals */}
      {isDepositOpen && (
        <DepositModal 
          onClose={() => setDepositOpen(false)} 
          coins={supportedCoins}
          onSuccess={() => {
            setDepositOpen(false);
            fetchWalletData(false);
          }}
        />
      )}
      {isWithdrawOpen && (
        <WithdrawModal 
          onClose={() => setWithdrawOpen(false)} 
          coins={supportedCoins}
          walletData={walletData}
          onSuccess={() => {
            setWithdrawOpen(false);
            fetchWalletData(false);
          }}
        />
      )}
      {isTransferOpen && (
        <TransferModal 
          onClose={() => setTransferOpen(false)} 
          coins={supportedCoins}
          walletData={walletData}
          onSuccess={() => {
            setTransferOpen(false);
            fetchWalletData(false);
          }}
        />
      )}
      {isSwapOpen && (
        <SwapModal 
          onClose={() => setSwapOpen(false)} 
          coins={supportedCoins}
          walletData={walletData}
          isOpen={true}
          onSuccess={() => {
            setSwapOpen(false);
            fetchWalletData(false);
          }}
        />
      )}
    </div>
  );
}
