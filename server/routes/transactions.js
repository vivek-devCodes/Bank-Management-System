const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, (req, res) => {
  try {
    const { accountId, type, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    let transactions = db.getTransactions();

    // Filter by account ID
    if (accountId) {
      transactions = transactions.filter(transaction => transaction.accountId === accountId);
    }

    // Filter by type
    if (type) {
      transactions = transactions.filter(transaction => transaction.type === type);
    }

    // Filter by status
    if (status) {
      transactions = transactions.filter(transaction => transaction.status === status);
    }

    // Filter by date range
    if (startDate) {
      transactions = transactions.filter(transaction => 
        new Date(transaction.timestamp) >= new Date(startDate)
      );
    }
    if (endDate) {
      transactions = transactions.filter(transaction => 
        new Date(transaction.timestamp) <= new Date(endDate)
      );
    }

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    // Add account information to each transaction
    const transactionsWithAccounts = paginatedTransactions.map(transaction => {
      const account = db.getAccountById(transaction.accountId);
      const customer = account ? db.getCustomerById(account.customerId) : null;
      
      return {
        ...transaction,
        account: account ? {
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          customer: customer ? {
            firstName: customer.firstName,
            lastName: customer.lastName
          } : null
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        transactions: transactionsWithAccounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.length / limit),
          totalItems: transactions.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const transaction = db.getTransactionById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Get account and customer information
    const account = db.getAccountById(transaction.accountId);
    const customer = account ? db.getCustomerById(account.customerId) : null;

    res.json({
      success: true,
      data: {
        ...transaction,
        account: account ? {
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          customer: customer ? {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email
          } : null
        } : null
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new transaction (deposit/withdrawal)
router.post('/', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('accountId').notEmpty(),
  body('type').isIn(['deposit', 'withdrawal', 'transfer', 'fee']),
  body('amount').isFloat({ min: 0.01 }),
  body('description').notEmpty().trim(),
  body('toAccountId').optional().notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { accountId, type, amount, description, toAccountId } = req.body;

    // Verify account exists
    const account = db.getAccountById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Check account status
    if (account.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // For withdrawals, check sufficient balance
    if (type === 'withdrawal' && account.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // For transfers, verify destination account
    let toAccount = null;
    if (type === 'transfer') {
      if (!toAccountId) {
        return res.status(400).json({
          success: false,
          message: 'Destination account required for transfers'
        });
      }
      
      toAccount = db.getAccountById(toAccountId);
      if (!toAccount) {
        return res.status(404).json({
          success: false,
          message: 'Destination account not found'
        });
      }
      
      if (toAccount.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Destination account is not active'
        });
      }
    }

    // Create transaction
    const transactionData = {
      accountId,
      type,
      amount: parseFloat(amount),
      description,
      ...(toAccount && {
        fromAccount: account.accountNumber,
        toAccount: toAccount.accountNumber
      })
    };

    const transaction = db.createTransaction(transactionData);

    // Update account balances
    if (type === 'deposit') {
      db.updateAccount(accountId, { balance: account.balance + parseFloat(amount) });
    } else if (type === 'withdrawal' || type === 'fee') {
      db.updateAccount(accountId, { balance: account.balance - parseFloat(amount) });
    } else if (type === 'transfer') {
      db.updateAccount(accountId, { balance: account.balance - parseFloat(amount) });
      db.updateAccount(toAccountId, { balance: toAccount.balance + parseFloat(amount) });
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update transaction status
router.put('/:id/status', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('status').isIn(['completed', 'pending', 'failed'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transaction = db.updateTransaction(req.params.id, { status: req.body.status });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get transaction statistics
router.get('/stats/summary', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const transactions = db.getTransactions();
    const accounts = db.getAccounts();

    const stats = {
      totalTransactions: transactions.length,
      totalDeposits: transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      totalTransfers: transactions
        .filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0),
      totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
      transactionsByType: {
        deposit: transactions.filter(t => t.type === 'deposit').length,
        withdrawal: transactions.filter(t => t.type === 'withdrawal').length,
        transfer: transactions.filter(t => t.type === 'transfer').length,
        fee: transactions.filter(t => t.type === 'fee').length
      },
      transactionsByStatus: {
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;