import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Eye } from 'lucide-react';

const CustomerStatements: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Mock data for statements
  const statements = [
    {
      id: '1',
      month: 'December 2024',
      accountType: 'Checking',
      accountNumber: '****1234',
      statementDate: '2024-12-31',
      transactions: 45,
      startingBalance: 2750.25,
      endingBalance: 2500.75
    },
    {
      id: '2',
      month: 'November 2024',
      accountType: 'Checking',
      accountNumber: '****1234',
      statementDate: '2024-11-30',
      transactions: 38,
      startingBalance: 3200.50,
      endingBalance: 2750.25
    },
    {
      id: '3',
      month: 'December 2024',
      accountType: 'Savings',
      accountNumber: '****5678',
      statementDate: '2024-12-31',
      transactions: 12,
      startingBalance: 14500.00,
      endingBalance: 15000.00
    },
    {
      id: '4',
      month: 'November 2024',
      accountType: 'Savings',
      accountNumber: '****5678',
      statementDate: '2024-11-30',
      transactions: 8,
      startingBalance: 14000.00,
      endingBalance: 14500.00
    }
  ];

  const years = [2024, 2023, 2022, 2021];
  const accountTypes = ['all', 'checking', 'savings', 'business'];

  const filteredStatements = statements.filter(statement => {
    const statementYear = new Date(statement.statementDate).getFullYear();
    const matchesYear = statementYear === selectedYear;
    const matchesAccount = selectedAccount === 'all' || statement.accountType.toLowerCase() === selectedAccount;
    return matchesYear && matchesAccount;
  });

  const handleDownload = (statementId: string) => {
    // In a real app, this would trigger a PDF download
    console.log('Downloading statement:', statementId);
  };

  const handleView = (statementId: string) => {
    // In a real app, this would open the statement in a new tab
    console.log('Viewing statement:', statementId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Statements</h1>
        <p className="text-gray-600 mt-2">View and download your monthly account statements</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Accounts</option>
              {accountTypes.slice(1).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Account
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStatements.map((statement) => (
          <div key={statement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{statement.month}</h3>
                  <p className="text-sm text-gray-500">
                    {statement.accountType} {statement.accountNumber}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Statement Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(statement.statementDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-medium text-gray-900">{statement.transactions}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Starting Balance:</span>
                <span className="font-medium text-gray-900">
                  ${statement.startingBalance.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ending Balance:</span>
                <span className="font-medium text-gray-900">
                  ${statement.endingBalance.toLocaleString()}
                </span>
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Net Change:</span>
                  <span className={`font-medium ${
                    statement.endingBalance >= statement.startingBalance 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {statement.endingBalance >= statement.startingBalance ? '+' : ''}
                    ${(statement.endingBalance - statement.startingBalance).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleView(statement.id)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <button
                onClick={() => handleDownload(statement.id)}
                className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStatements.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Statements Found</h3>
          <p className="text-gray-600">
            No statements available for the selected year and account type.
          </p>
        </div>
      )}

      {/* Statement Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Your Statements</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Monthly statements are generated on the last day of each month</p>
          <p>• Statements are available for download up to 7 years</p>
          <p>• All statements are available in PDF format</p>
          <p>• For questions about your statements, please contact customer service</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatements;