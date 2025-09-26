export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Account {
  id: string;
  customerId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'business';
  balance: number;
  status: 'active' | 'closed' | 'frozen';
  createdAt: string;
  interestRate?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'fee';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  fromAccount?: string;
  toAccount?: string;
}

export type ViewMode = 'dashboard' | 'customers' | 'accounts' | 'transactions' | 'reports';