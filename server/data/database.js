const { v4: uuidv4 } = require('uuid');

// In-memory database (replace with real database in production)
let customers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Springfield, IL 62701',
    dateOfBirth: '1985-03-15',
    socialSecurityNumber: 'XXX-XX-1234',
    createdAt: '2023-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Chicago, IL 60601',
    dateOfBirth: '1990-07-22',
    socialSecurityNumber: 'XXX-XX-5678',
    createdAt: '2023-02-20T14:30:00Z',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@email.com',
    phone: '(555) 345-6789',
    address: '789 Pine St, Austin, TX 78701',
    dateOfBirth: '1978-11-08',
    socialSecurityNumber: 'XXX-XX-9012',
    createdAt: '2023-03-10T09:15:00Z',
    status: 'active'
  }
];

let accounts = [
  {
    id: '1',
    customerId: '1',
    accountNumber: '****1234',
    accountType: 'checking',
    balance: 2500.75,
    status: 'active',
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    customerId: '1',
    accountNumber: '****5678',
    accountType: 'savings',
    balance: 15000.00,
    status: 'active',
    createdAt: '2023-01-15T10:05:00Z',
    interestRate: 2.5
  },
  {
    id: '3',
    customerId: '2',
    accountNumber: '****9012',
    accountType: 'checking',
    balance: 875.50,
    status: 'active',
    createdAt: '2023-02-20T14:30:00Z'
  },
  {
    id: '4',
    customerId: '3',
    accountNumber: '****3456',
    accountType: 'business',
    balance: 45000.25,
    status: 'active',
    createdAt: '2023-03-10T09:15:00Z'
  }
];

let transactions = [
  {
    id: '1',
    accountId: '1',
    type: 'deposit',
    amount: 1500.00,
    description: 'Salary Deposit - ABC Corporation',
    timestamp: '2024-01-15T09:00:00Z',
    status: 'completed'
  },
  {
    id: '2',
    accountId: '1',
    type: 'withdrawal',
    amount: 250.00,
    description: 'ATM Withdrawal - Main St Branch',
    timestamp: '2024-01-14T16:30:00Z',
    status: 'completed'
  },
  {
    id: '3',
    accountId: '2',
    type: 'transfer',
    amount: 500.00,
    description: 'Transfer to Checking Account',
    timestamp: '2024-01-13T11:45:00Z',
    status: 'completed',
    fromAccount: '****5678',
    toAccount: '****1234'
  },
  {
    id: '4',
    accountId: '3',
    type: 'deposit',
    amount: 2000.00,
    description: 'Direct Deposit - XYZ Company',
    timestamp: '2024-01-12T08:15:00Z',
    status: 'completed'
  },
  {
    id: '5',
    accountId: '4',
    type: 'deposit',
    amount: 5000.00,
    description: 'Business Revenue Deposit',
    timestamp: '2024-01-11T14:20:00Z',
    status: 'completed'
  }
];

let users = [
  {
    id: '1',
    email: 'admin@securebank.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Database operations
const db = {
  // Customers
  getCustomers: () => customers,
  getCustomerById: (id) => customers.find(c => c.id === id),
  createCustomer: (customerData) => {
    const customer = {
      id: uuidv4(),
      ...customerData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    customers.push(customer);
    return customer;
  },
  updateCustomer: (id, updates) => {
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates };
      return customers[index];
    }
    return null;
  },
  deleteCustomer: (id) => {
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      return customers.splice(index, 1)[0];
    }
    return null;
  },

  // Accounts
  getAccounts: () => accounts,
  getAccountById: (id) => accounts.find(a => a.id === id),
  getAccountsByCustomerId: (customerId) => accounts.filter(a => a.customerId === customerId),
  createAccount: (accountData) => {
    const account = {
      id: uuidv4(),
      ...accountData,
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    accounts.push(account);
    return account;
  },
  updateAccount: (id, updates) => {
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...updates };
      return accounts[index];
    }
    return null;
  },
  deleteAccount: (id) => {
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      return accounts.splice(index, 1)[0];
    }
    return null;
  },

  // Transactions
  getTransactions: () => transactions,
  getTransactionById: (id) => transactions.find(t => t.id === id),
  getTransactionsByAccountId: (accountId) => transactions.filter(t => t.accountId === accountId),
  createTransaction: (transactionData) => {
    const transaction = {
      id: uuidv4(),
      ...transactionData,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    transactions.push(transaction);
    return transaction;
  },
  updateTransaction: (id, updates) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      return transactions[index];
    }
    return null;
  },

  // Users
  getUsers: () => users,
  getUserById: (id) => users.find(u => u.id === id),
  getUserByEmail: (email) => users.find(u => u.email === email),
  createUser: (userData) => {
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    return user;
  }
};

module.exports = db;