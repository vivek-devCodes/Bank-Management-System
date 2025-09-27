const express = require('express');
const { Customer, Account, Transaction } = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'teller'), async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const totalAccounts = await Account.countDocuments();
    const activeAccounts = await Account.countDocuments({ status: 'active' });
    const totalBalance = await Account.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);
    const totalTransactions = await Transaction.countDocuments();
    const recentTransactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate({
        path: 'accountId',
        populate: {
          path: 'customerId',
          select: 'firstName lastName'
        }
      });

    const accountsByType = await Account.aggregate([{ $group: { _id: '$accountType', count: { $sum: 1 } } }]);
    const transactionsByType = await Transaction.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);

    const overview = {
      totalCustomers,
      activeCustomers,
      totalAccounts,
      activeAccounts,
      totalBalance: totalBalance[0]?.total || 0,
      totalTransactions,
      recentTransactions,
      accountsByType: accountsByType.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      transactionsByType: transactionsByType.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {})
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
router.get('/financial-summary', authenticateToken, authorizeRoles('admin', 'teller'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate) match.timestamp = { ...match.timestamp, $gte: new Date(startDate) };
    if (endDate) match.timestamp = { ...match.timestamp, $lte: new Date(endDate) };

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0] } },
          totalWithdrawals: { $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0] } },
          totalTransfers: { $sum: { $cond: [{ $eq: ['$type', 'transfer'] }, '$amount', 0] } },
          totalFees: { $sum: { $cond: [{ $eq: ['$type', 'fee'] }, '$amount', 0] } },
          transactionCount: { $sum: 1 },
          averageTransactionAmount: { $avg: '$amount' }
        }
      }
    ]);

    const totalBalance = await Account.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);
    const averageAccountBalance = await Account.aggregate([{ $group: { _id: null, avg: { $avg: '$balance' } } }]);

    res.json({
      success: true,
      data: {
        ...summary[0],
        netFlow: (summary[0]?.totalDeposits || 0) - (summary[0]?.totalWithdrawals || 0),
        totalBalance: totalBalance[0]?.total || 0,
        averageAccountBalance: averageAccountBalance[0]?.avg || 0
      }
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;