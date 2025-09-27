const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all accounts
router.get('/', authenticateToken, (req, res) => {
  try {
    const { customerId, accountType, status, page = 1, limit = 10 } = req.query;
    let accounts = db.getAccounts();

    // Filter by customer ID
    if (customerId) {
      accounts = accounts.filter(account => account.customerId === customerId);
    }

    // Filter by account type
    if (accountType) {
      accounts = accounts.filter(account => account.accountType === accountType);
    }

    // Filter by status
    if (status) {
      accounts = accounts.filter(account => account.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedAccounts = accounts.slice(startIndex, endIndex);

    // Add customer information to each account
    const accountsWithCustomers = paginatedAccounts.map(account => {
      const customer = db.getCustomerById(account.customerId);
      return {
        ...account,
        customer: customer ? {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        accounts: accountsWithCustomers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(accounts.length / limit),
          totalItems: accounts.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get account by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const account = db.getAccountById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Get customer information
    const customer = db.getCustomerById(account.customerId);
    
    // Get account transactions
    const transactions = db.getTransactionsByAccountId(req.params.id);

    res.json({
      success: true,
      data: {
        account: {
          ...account,
          customer: customer ? {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email
          } : null
        },
        transactions
      }
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new account
router.post('/', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('customerId').notEmpty(),
  body('accountType').isIn(['checking', 'savings', 'business']),
  body('balance').isFloat({ min: 0 }).optional(),
  body('interestRate').isFloat({ min: 0 }).optional()
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

    const { customerId, accountType, balance = 0, interestRate } = req.body;

    // Verify customer exists
    const customer = db.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const accountData = {
      customerId,
      accountType,
      balance: parseFloat(balance),
      ...(interestRate && { interestRate: parseFloat(interestRate) })
    };

    const account = db.createAccount(accountData);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update account
router.put('/:id', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('status').optional().isIn(['active', 'closed', 'frozen']),
  body('interestRate').optional().isFloat({ min: 0 })
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

    const account = db.updateAccount(req.params.id, req.body);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete account
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const account = db.deleteAccount(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get account balance
router.get('/:id/balance', authenticateToken, (req, res) => {
  try {
    const account = db.getAccountById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: {
        accountId: account.id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        accountType: account.accountType
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;