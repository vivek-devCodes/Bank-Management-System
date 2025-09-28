import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye,
  EyeOff,
  Plus,
  Send
} from 'lucide-react';
import { accountsAPI, transactionsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsResponse, transactionsResponse] = await Promise.all([
        accountsAPI.getAll(),
        transactionsAPI.getAll({ limit: 5 })
      ]);

      if (accountsResponse.success) {
        setAccounts(accountsResponse.data.accounts);
      }
      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
    setLoading(false);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking': return 'from-blue-500 to-blue-600';
      case 'savings': return 'from-green-500 to-green-600';
      case 'business': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Here's an overview of your accounts and recent activity.</p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <div className="flex items-center gap-3 mt-2">
              <h2 className="text-4xl font-bold">
                {balanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••'}
              </h2>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                {balanceVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Active Accounts</p>
            <p className="text-2xl font-bold">{accounts.length}</p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 font-medium">
            <Send className="h-4 w-4" />
            Transfer Money
          </button>
          <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 font-medium">
            <Plus className="h-4 w-4" />
            Pay Bills
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accounts Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Accounts</h3>
            <button className="text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-r ${getAccountTypeColor(account.accountType)} p-3 rounded-lg`}>
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {account.accountType} Account
                      </h4>
                      <p className="text-sm text-gray-500">{account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {balanceVisible ? `$${account.balance.toLocaleString()}` : '••••••'}
                    </p>
                    <p className="text-sm text-gray-500">Available Balance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Transfer Money', icon: Send, color: 'bg-blue-500' },
            { title: 'Pay Bills', icon: DollarSign, color: 'bg-green-500' },
            { title: 'Mobile Deposit', icon: Plus, color: 'bg-purple-500' },
            { title: 'Find ATM', icon: CreditCard, color: 'bg-orange-500' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className={`${action.color} p-3 rounded-lg inline-flex mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">{action.title}</h4>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;