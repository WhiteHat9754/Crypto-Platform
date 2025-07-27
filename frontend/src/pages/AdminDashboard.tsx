import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  walletBalances: { [key: string]: number };
  createdAt: string;
}

interface Withdrawal {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  currency: string;
  amount: number;
  fee: number;
  toAddress: string;
  status: string;
  priority: string;
  createdAt: string;
  txHash?: string;
  processedAt?: string;
  failureReason?: string;
  adminNotes?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  pendingWithdrawals: number;
  processingWithdrawals: number;
  totalPlatformBalance: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Filters and search
  const [userSearch, setUserSearch] = useState('');
  const [withdrawalFilter, setWithdrawalFilter] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [txHash, setTxHash] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        withCredentials: true
      });
      setStats(statsResponse.data.data.stats);

      // Fetch users
      const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
        withCredentials: true,
        params: { limit: 50 }
      });
      setUsers(usersResponse.data.data.users);

      // Fetch pending withdrawals
      const withdrawalsResponse = await axios.get('http://localhost:5000/api/admin/withdrawals/pending', {
        withCredentials: true,
        params: { limit: 50 }
      });
      setWithdrawals(withdrawalsResponse.data.data.withdrawals);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Process withdrawal
  const processWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(withdrawalId);
      
      const payload: any = {
        action,
        adminNotes
      };

      if (action === 'approve') {
        if (!txHash) {
          alert('Transaction hash is required for approval');
          return;
        }
        payload.txHash = txHash;
      } else if (action === 'reject') {
        if (!failureReason) {
          alert('Failure reason is required for rejection');
          return;
        }
        payload.failureReason = failureReason;
      }

      await axios.put(`http://localhost:5000/api/admin/withdrawals/${withdrawalId}/process`, payload, {
        withCredentials: true
      });

      // Refresh data and close modal
      await fetchDashboardData();
      setSelectedWithdrawal(null);
      setTxHash('');
      setAdminNotes('');
      setFailureReason('');
      
    } catch (error: any) {
      console.error('Failed to process withdrawal:', error);
      alert(error.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  // Calculate total platform balance
  const calculateTotalBalance = () => {
    return users.reduce((total, user) => {
      return total + Object.values(user.walletBalances).reduce((sum, balance) => sum + balance, 0);
    }, 0);
  };

  // Filter users by search
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter withdrawals by status
  const filteredWithdrawals = withdrawals.filter(withdrawal => 
    withdrawalFilter === 'all' ? true : withdrawal.status === withdrawalFilter
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage users and withdrawals</p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownLeft className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Deposits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDeposits}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingWithdrawals}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${calculateTotalBalance().toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'users', label: 'User Balances', icon: Users },
                { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Balances</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Wallet Balances
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {Object.entries(user.walletBalances).length > 0 ? (
                            Object.entries(user.walletBalances).map(([currency, balance]) => (
                              <div key={currency} className="flex justify-between items-center bg-gray-100 dark:bg-gray-600 rounded px-2 py-1">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  {currency}
                                </span>
                                <span className="text-xs text-gray-900 dark:text-white">
                                  {balance.toFixed(8)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No balances</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Withdrawal Requests</h2>
                <select
                  value={withdrawalFilter}
                  onChange={(e) => setWithdrawalFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {withdrawal.userId.firstName} {withdrawal.userId.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {withdrawal.userId.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {withdrawal.amount} {withdrawal.currency}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          Fee: {withdrawal.fee} {withdrawal.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-mono break-all max-w-xs">
                          {withdrawal.toAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          withdrawal.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          withdrawal.priority === 'high' ? 'bg-red-100 text-red-800' :
                          withdrawal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {withdrawal.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {withdrawal.status === 'pending' && (
                          <button
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Process
                          </button>
                        )}
                        {withdrawal.txHash && (
                          <span className="text-green-600 text-xs">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Processing Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Process Withdrawal
              </h3>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Withdrawal Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">User:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedWithdrawal.userId.firstName} {selectedWithdrawal.userId.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedWithdrawal.amount} {selectedWithdrawal.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedWithdrawal.fee} {selectedWithdrawal.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Address:</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs break-all">
                      {selectedWithdrawal.toAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Hash Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Hash (for approval)
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter transaction hash"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>

              {/* Failure Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Failure Reason (for rejection)
                </label>
                <input
                  type="text"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Enter failure reason"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any additional notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => processWithdrawal(selectedWithdrawal._id, 'approve')}
                disabled={!txHash || processing === selectedWithdrawal._id}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing === selectedWithdrawal._id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
              <button
                onClick={() => processWithdrawal(selectedWithdrawal._id, 'reject')}
                disabled={!failureReason || processing === selectedWithdrawal._id}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing === selectedWithdrawal._id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
