const API_BASE_URL = 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  register: async (userData: any) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Customers API
export const customersAPI = {
  getAll: async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string) => {
    return apiRequest(`/customers/${id}`);
  },

  create: async (customerData: any) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  update: async (id: string, updates: any) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Accounts API
export const accountsAPI = {
  getAll: async (params?: { customerId?: string; accountType?: string; status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string) => {
    return apiRequest(`/accounts/${id}`);
  },

  create: async (accountData: any) => {
    return apiRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },

  update: async (id: string, updates: any) => {
    return apiRequest(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getStats: async () => {
    return apiRequest('/accounts/stats');
  },

  delete: async (id: string) => {
    return apiRequest(`/accounts/${id}`, {
      method: 'DELETE',
    });
  },

  getBalance: async (id: string) => {
    return apiRequest(`/accounts/${id}/balance`);
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params?: { 
    accountId?: string; 
    type?: string; 
    status?: string; 
    startDate?: string; 
    endDate?: string; 
    page?: number; 
    limit?: number 
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string) => {
    return apiRequest(`/transactions/${id}`);
  },

  create: async (transactionData: any) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getStats: async () => {
    return apiRequest('/transactions/stats/summary');
  },

  delete: async (id: string) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reports API
export const reportsAPI = {
  getDashboard: async () => {
    return apiRequest('/reports/dashboard');
  },

  getFinancialSummary: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/reports/financial-summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  getCustomerAnalytics: async () => {
    return apiRequest('/reports/customer-analytics');
  },

  getAccountAnalytics: async () => {
    return apiRequest('/reports/account-analytics');
  },

  getTransactionAnalytics: async (period?: string) => {
    const endpoint = `/reports/transaction-analytics${period ? `?period=${period}` : ''}`;
    return apiRequest(endpoint);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};