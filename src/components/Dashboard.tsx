import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await reportsAPI.getDashboard();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers?.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%' // This should be dynamic
    },
    {
      title: 'Active Accounts',
      value: stats?.activeAccounts?.toLocaleString(),
      icon: CreditCard,
      color: 'bg-green-500',
      change: '+8%' // This should be dynamic
    },
    {
      title: 'Total Deposits',
      value: `$${stats?.totalBalance?.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%' // This should be dynamic
    },
    {
      title: 'Monthly Growth',
      value: '24.5%', // This should be dynamic
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3%' // This should be dynamic
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your bank today.</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white p-2 rounded-lg shadow-sm border border-gray-100"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
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
          {stats?.recentTransactions?.map((transaction: any) => (
            <div key={transaction._id} className="p-6 hover:bg-gray-50 transition-colors">
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
                      {new Date(transaction.timestamp).toLocaleDateString()} • Account {transaction.accountId?.accountNumber}
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