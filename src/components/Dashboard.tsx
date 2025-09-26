import React from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { mockCustomers, mockAccounts, mockTransactions } from '../data/mockData';

const Dashboard: React.FC = () => {
  const totalCustomers = mockCustomers.length;
  const totalAccounts = mockAccounts.length;
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  const recentTransactions = mockTransactions.slice(0, 5);

  const stats = [
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Accounts',
      value: totalAccounts.toLocaleString(),
      icon: CreditCard,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Deposits',
      value: `$${totalBalance.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Monthly Growth',
      value: '24.5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3%'
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your bank today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-gray-600 mt-1">Latest activity across all accounts</p>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'deposit' 
                      ? 'bg-green-100' 
                      : transaction.type === 'withdrawal'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'deposit' ? (
                      <ArrowDownLeft className={`h-5 w-5 ${
                        transaction.type === 'deposit' 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                      }`} />
                    ) : (
                      <ArrowUpRight className={`h-5 w-5 ${
                        transaction.type === 'withdrawal' 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()} • Account ****{transaction.accountId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'deposit' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;