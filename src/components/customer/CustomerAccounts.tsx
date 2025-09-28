import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, EyeOff, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { accountsAPI, transactionsAPI } from '../../services/api';

const CustomerAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount._id);
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      if (response.success) {
        setAccounts(response.data.accounts);
        if (response.data.accounts.length > 0) {
          setSelectedAccount(response.data.accounts[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    }
    setLoading(false);
  };

  const fetchTransactions = async (accountId: string) => {
    try {
      const response = await transactionsAPI.getAll({ accountId, limit: 20 });
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

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
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-blue-600" />;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Accounts</h1>
        <p className="text-gray-600 mt-2">Manage your accounts and view transaction history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accounts List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Accounts</h3>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account._id}
                onClick={() => setSelectedAccount(account)}
                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedAccount?._id === account._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`bg-gradient-to-r ${getAccountTypeColor(account.accountType)} p-2 rounded-lg`}>
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {account.accountType}
                    </h4>
                    <p className="text-sm text-gray-500">{account.accountNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {balanceVisible ? `$${account.balance.toLocaleString()}` : '••••••'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div className="lg:col-span-2">
          {selectedAccount && (
            <>
              {/* Account Header */}
              <div className={`bg-gradient-to-r ${getAccountTypeColor(selectedAccount.accountType)} rounded-2xl p-8 text-white mb-6 shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      {selectedAccount.accountType} Account
                    </h2>
                    <p className="text-blue-100 mt-1">{selectedAccount.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {balanceVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Available Balance</p>
                    <p className="text-4xl font-bold">
                      {balanceVisible ? `$${selectedAccount.balance.toLocaleString()}` : '••••••'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Statement
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-500">
                                  {new Date(transaction.timestamp).toLocaleDateString()}
                                </p>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  transaction.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No transactions found for this account</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccounts;