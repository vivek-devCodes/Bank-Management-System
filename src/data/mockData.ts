import { Customer, Account, Transaction } from '../types/banking';

export const mockCustomers: Customer[] = [
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

export const mockAccounts: Account[] = [
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

export const mockTransactions: Transaction[] = [
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