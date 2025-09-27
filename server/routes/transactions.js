const express = require('express');
const { body, validationResult } = require('express-validator');
const { Transaction, Account } = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { accountId, type, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (accountId) query.accountId = accountId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate) query.timestamp = { ...query.timestamp, $gte: new Date(startDate) };
    if (endDate) query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };

    const transactions = await Transaction.find(query)
      .populate({
        path: 'accountId',
        populate: {
          path: 'customerId',
          select: 'firstName lastName'
        }
      })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate({
      path: 'accountId',
      populate: {
        path: 'customerId',
        select: 'firstName lastName email'
      }
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new transaction (deposit/withdrawal/transfer)
router.post('/', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('accountId').notEmpty(),
  body('type').isIn(['deposit', 'withdrawal', 'transfer', 'fee']),
  body('amount').isFloat({ min: 0.01 }),
  body('description').notEmpty().trim(),
  body('toAccountId').optional().notEmpty()
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

    const { accountId, type, amount, description, toAccountId } = req.body;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Account is not active'
      });
    }

    if (type === 'withdrawal' && account.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    let toAccount = null;
    if (type === 'transfer') {
      if (!toAccountId) {
        return res.status(400).json({
          success: false,
          message: 'Destination account required for transfers'
        });
      }
      
      toAccount = await Account.findById(toAccountId);
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

    const transaction = await Transaction.create(transactionData);

    if (type === 'deposit') {
      account.balance += parseFloat(amount);
      await account.save();
    } else if (type === 'withdrawal' || type === 'fee') {
      account.balance -= parseFloat(amount);
      await account.save();
    } else if (type === 'transfer') {
      account.balance -= parseFloat(amount);
      toAccount.balance += parseFloat(amount);
      await account.save();
      await toAccount.save();
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

    const transaction = await Transaction.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
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
router.get('/stats/summary', authenticateToken, authorizeRoles('admin', 'teller'), async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const totalDeposits = await Transaction.aggregate([
      { $match: { type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalTransfers = await Transaction.aggregate([
      { $match: { type: 'transfer' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBalance = await Account.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);

    const transactionsByType = await Transaction.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const transactionsByStatus = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const todaysTransactions = await Transaction.countDocuments({
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        totalTransfers: totalTransfers[0]?.total || 0,
        totalBalance: totalBalance[0]?.total || 0,
        transactionsByType: transactionsByType.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
        transactionsByStatus: transactionsByStatus.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
        todaysTransactions
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a transaction
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const account = await Account.findById(transaction.accountId);

    // Revert the transaction amount from the account balance
    if (account) {
      switch (transaction.type) {
        case 'deposit':
          account.balance -= transaction.amount;
          break;
        case 'withdrawal':
        case 'fee':
          account.balance += transaction.amount;
          break;
        case 'transfer':
          const toAccount = await Account.findOne({ accountNumber: transaction.toAccount });
          if (toAccount) {
            account.balance += transaction.amount;
            toAccount.balance -= transaction.amount;
            await toAccount.save();
          }
          break;
        default:
          break;
      }
      await account.save();
    }

    await transaction.remove();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;