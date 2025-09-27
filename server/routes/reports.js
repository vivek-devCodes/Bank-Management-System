const express = require('express');
const db = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const customers = db.getCustomers();
    const accounts = db.getAccounts();
    const transactions = db.getTransactions();

    const overview = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(a => a.status === 'active').length,
      totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
      totalTransactions: transactions.length,
      recentTransactions: transactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(transaction => {
          const account = db.getAccountById(transaction.accountId);
          const customer = account ? db.getCustomerById(account.customerId) : null;
          
          return {
            ...transaction,
            account: account ? {
              accountNumber: account.accountNumber,
              customer: customer ? {
                firstName: customer.firstName,
                lastName: customer.lastName
              } : null
            } : null
          };
        }),
      accountsByType: {
        checking: accounts.filter(a => a.accountType === 'checking').length,
        savings: accounts.filter(a => a.accountType === 'savings').length,
        business: accounts.filter(a => a.accountType === 'business').length
      },
      transactionsByType: {
        deposit: transactions.filter(t => t.type === 'deposit').length,
        withdrawal: transactions.filter(t => t.type === 'withdrawal').length,
        transfer: transactions.filter(t => t.type === 'transfer').length,
        fee: transactions.filter(t => t.type === 'fee').length
      }
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get financial summary
router.get('/financial-summary', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let transactions = db.getTransactions();
    const accounts = db.getAccounts();

    // Filter by date range if provided
    if (startDate) {
      transactions = transactions.filter(t => 
        new Date(t.timestamp) >= new Date(startDate)
      );
    }
    if (endDate) {
      transactions = transactions.filter(t => 
        new Date(t.timestamp) <= new Date(endDate)
      );
    }

    const summary = {
      totalDeposits: transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      totalTransfers: transactions
        .filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0),
      totalFees: transactions
        .filter(t => t.type === 'fee')
        .reduce((sum, t) => sum + t.amount, 0),
      netFlow: transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0) - 
        transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
      averageAccountBalance: accounts.length > 0 ? 
        accounts.reduce((sum, a) => sum + a.balance, 0) / accounts.length : 0,
      transactionCount: transactions.length,
      averageTransactionAmount: transactions.length > 0 ?
        transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get customer analytics
router.get('/customer-analytics', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const customers = db.getCustomers();
    const accounts = db.getAccounts();
    const transactions = db.getTransactions();

    const analytics = {
      totalCustomers: customers.length,
      customersByStatus: {
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
        suspended: customers.filter(c => c.status === 'suspended').length
      },
      customersWithMultipleAccounts: customers.filter(customer => 
        accounts.filter(account => account.customerId === customer.id).length > 1
      ).length,
      averageAccountsPerCustomer: customers.length > 0 ?
        accounts.length / customers.length : 0,
      topCustomersByBalance: customers
        .map(customer => {
          const customerAccounts = accounts.filter(a => a.customerId === customer.id);
          const totalBalance = customerAccounts.reduce((sum, a) => sum + a.balance, 0);
          const transactionCount = transactions.filter(t => 
            customerAccounts.some(a => a.id === t.accountId)
          ).length;
          
          return {
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            totalBalance,
            accountCount: customerAccounts.length,
            transactionCount
          };
        })
        .sort((a, b) => b.totalBalance - a.totalBalance)
        .slice(0, 10),
      newCustomersThisMonth: customers.filter(customer => {
        const createdDate = new Date(customer.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get account analytics
router.get('/account-analytics', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const accounts = db.getAccounts();
    const transactions = db.getTransactions();

    const analytics = {
      totalAccounts: accounts.length,
      accountsByType: {
        checking: accounts.filter(a => a.accountType === 'checking').length,
        savings: accounts.filter(a => a.accountType === 'savings').length,
        business: accounts.filter(a => a.accountType === 'business').length
      },
      accountsByStatus: {
        active: accounts.filter(a => a.status === 'active').length,
        closed: accounts.filter(a => a.status === 'closed').length,
        frozen: accounts.filter(a => a.status === 'frozen').length
      },
      balanceDistribution: {
        under1000: accounts.filter(a => a.balance < 1000).length,
        between1000and10000: accounts.filter(a => a.balance >= 1000 && a.balance < 10000).length,
        between10000and50000: accounts.filter(a => a.balance >= 10000 && a.balance < 50000).length,
        over50000: accounts.filter(a => a.balance >= 50000).length
      },
      totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
      averageBalance: accounts.length > 0 ? 
        accounts.reduce((sum, a) => sum + a.balance, 0) / accounts.length : 0,
      mostActiveAccounts: accounts
        .map(account => {
          const accountTransactions = transactions.filter(t => t.accountId === account.id);
          return {
            id: account.id,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            balance: account.balance,
            transactionCount: accountTransactions.length,
            lastTransactionDate: accountTransactions.length > 0 ?
              Math.max(...accountTransactions.map(t => new Date(t.timestamp).getTime())) : null
          };
        })
        .sort((a, b) => b.transactionCount - a.transactionCount)
        .slice(0, 10)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get account analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction analytics
router.get('/transaction-analytics', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const transactions = db.getTransactions();
    const now = new Date();

    // Filter transactions by period
    let filteredTransactions = transactions;
    if (period === 'day') {
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate.toDateString() === now.toDateString();
      });
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTransactions = transactions.filter(t => 
        new Date(t.timestamp) >= weekAgo
      );
    } else if (period === 'month') {
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      });
    }

    const analytics = {
      period,
      totalTransactions: filteredTransactions.length,
      transactionsByType: {
        deposit: filteredTransactions.filter(t => t.type === 'deposit').length,
        withdrawal: filteredTransactions.filter(t => t.type === 'withdrawal').length,
        transfer: filteredTransactions.filter(t => t.type === 'transfer').length,
        fee: filteredTransactions.filter(t => t.type === 'fee').length
      },
      transactionsByStatus: {
        completed: filteredTransactions.filter(t => t.status === 'completed').length,
        pending: filteredTransactions.filter(t => t.status === 'pending').length,
        failed: filteredTransactions.filter(t => t.status === 'failed').length
      },
      volumeByType: {
        deposits: filteredTransactions
          .filter(t => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0),
        withdrawals: filteredTransactions
          .filter(t => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0),
        transfers: filteredTransactions
          .filter(t => t.type === 'transfer')
          .reduce((sum, t) => sum + t.amount, 0),
        fees: filteredTransactions
          .filter(t => t.type === 'fee')
          .reduce((sum, t) => sum + t.amount, 0)
      },
      averageTransactionAmount: filteredTransactions.length > 0 ?
        filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length : 0,
      largestTransaction: filteredTransactions.length > 0 ?
        Math.max(...filteredTransactions.map(t => t.amount)) : 0,
      smallestTransaction: filteredTransactions.length > 0 ?
        Math.min(...filteredTransactions.map(t => t.amount)) : 0
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get transaction analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;