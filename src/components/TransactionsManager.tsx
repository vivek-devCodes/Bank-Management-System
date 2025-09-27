import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';

const TransactionsManager: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, statsResponse] = await Promise.all([
          transactionsAPI.getAll(),
          transactionsAPI.getStats(),
        ]);
        setTransactions(transactionsResponse.data.transactions);
        setStats(statsResponse.data);
        setError(null);
      } catch (error) {
        setError('Failed to fetch data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await transactionsAPI.delete(id);
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (error) {
      setError('Failed to delete transaction');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Transactions</h2>
          <p className="text-3xl">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Today's Transactions</h2>
          <p className="text-3xl">{stats.todaysTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Deposits</h2>
          <p className="text-3xl">${stats.totalDeposits?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Withdrawals</h2>
          <p className="text-3xl">${stats.totalWithdrawals?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Transfers</h2>
          <p className="text-3xl">${stats.totalTransfers?.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">All Transactions</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Date</th>
              <th className="p-2">Account</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="border-b">
                <td className="p-2">{new Date(transaction.timestamp).toLocaleDateString()}</td>
                <td className="p-2">{transaction.accountId?.customerId?.firstName} {transaction.accountId?.customerId?.lastName}</td>
                <td className="p-2">{transaction.type}</td>
                <td className="p-2">${transaction.amount.toFixed(2)}</td>
                <td className="p-2">{transaction.status}</td>
                <td className="p-2">
                                    <button 
                    onClick={() => handleDelete(transaction._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsManager;