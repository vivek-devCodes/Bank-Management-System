const express = require('express');
const { body, validationResult } = require('express-validator');
const { Account, Customer, Transaction } = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { customerId, accountType, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (customerId) query.customerId = customerId;
    if (accountType) query.accountType = accountType;
    if (status) query.status = status;

    const accounts = await Account.find(query)
      .populate('customerId', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Account.countDocuments(query);

    res.json({
      success: true,
      data: {
        accounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate('customerId', 'firstName lastName email');
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const transactions = await Transaction.find({ accountId: req.params.id });

    res.json({
      success: true,
      data: {
        account,
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
], async (req, res) => {
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

    const customer = await Customer.findById(customerId);
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
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      ...(interestRate && { interestRate: parseFloat(interestRate) })
    };

    const account = await Account.create(accountData);

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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
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
router.delete('/:id', authenticateToken, authorizeRoles('1'), async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    
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
router.get('/:id/balance', authenticateToken, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: {
        accountId: account._id,
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

router.get('/stats', authenticateToken, authorizeRoles('admin', 'teller'), async (req, res) => {
  try {
    const totalAccounts = await Account.countDocuments();
    const activeAccounts = await Account.countDocuments({ status: 'active' });
    const totalBalance = await Account.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalAccounts,
        activeAccounts,
        totalBalance: totalBalance[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get account stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;