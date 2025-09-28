import React, { useState, useEffect } from 'react';
import { Send, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { accountsAPI, transactionsAPI } from '../../services/api';

const CustomerTransfers: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transferData, setTransferData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      if (response.success) {
        setAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await transactionsAPI.create({
        accountId: transferData.fromAccount,
        type: 'transfer',
        amount: parseFloat(transferData.amount),
        description: transferData.description || 'Account Transfer',
        toAccountId: transferData.toAccount
      });

      if (response.success) {
        setSuccess(true);
        setTransferData({
          fromAccount: '',
          toAccount: '',
          amount: '',
          description: ''
        });
        // Refresh accounts to show updated balances
        fetchAccounts();
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed. Please try again.');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const fromAccount = accounts.find(acc => acc._id === transferData.fromAccount);
  const toAccount = accounts.find(acc => acc._id === transferData.toAccount);
  const transferAmount = parseFloat(transferData.amount) || 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transfer Money</h1>
        <p className="text-gray-600 mt-2">Transfer funds between your accounts</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">Transfer completed successfully!</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-6">
            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                name="fromAccount"
                value={transferData.fromAccount}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select source account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} - {account.accountNumber} 
                    (${account.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                name="toAccount"
                value={transferData.toAccount}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select destination account</option>
                {accounts
                  .filter(account => account._id !== transferData.fromAccount)
                  .map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} - {account.accountNumber}
                      (${account.balance.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="amount"
                  value={transferData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              {fromAccount && transferAmount > fromAccount.balance && (
                <p className="text-red-600 text-sm mt-1">Insufficient funds</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={transferData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's this transfer for?"
              />
            </div>

            {/* Transfer Summary */}
            {transferData.fromAccount && transferData.toAccount && transferAmount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Transfer Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">From:</span>
                    <span className="font-medium text-blue-900">
                      {fromAccount?.accountType} {fromAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">To:</span>
                    <span className="font-medium text-blue-900">
                      {toAccount?.accountType} {toAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Amount:</span>
                      <span className="font-bold text-blue-900 text-lg">
                        ${transferAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !transferData.fromAccount || !transferData.toAccount || !transferAmount || (fromAccount && transferAmount > fromAccount.balance)}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Complete Transfer
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Transfers */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfers</h3>
          <div className="text-center py-8">
            <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your recent transfers will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTransfers;