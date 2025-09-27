const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../data/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, authorizeRoles('admin', 'teller'), (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let customers = db.getCustomers();

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (status) {
      customers = customers.filter(customer => customer.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCustomers = customers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        customers: paginatedCustomers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(customers.length / limit),
          totalItems: customers.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const customer = db.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's accounts
    const accounts = db.getAccountsByCustomerId(req.params.id);

    res.json({
      success: true,
      data: {
        customer,
        accounts
      }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new customer
router.post('/', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('dateOfBirth').isISO8601().toDate(),
  body('socialSecurityNumber').notEmpty().trim()
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

    const customerData = req.body;
    const customer = db.createCustomer(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update customer
router.put('/:id', [
  authenticateToken,
  authorizeRoles('admin', 'teller'),
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().notEmpty().trim(),
  body('address').optional().notEmpty().trim(),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
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

    const customer = db.updateCustomer(req.params.id, req.body);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const customer = db.deleteCustomer(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;