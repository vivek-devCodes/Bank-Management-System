import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

// Admin Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomersView from './components/CustomersView';
import AccountsView from './components/AccountsView';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';

// Customer Components
import CustomerSidebar, { CustomerViewMode } from './components/customer/CustomerSidebar';
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerAccounts from './components/customer/CustomerAccounts';
import CustomerTransfers from './components/customer/CustomerTransfers';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerStatements from './components/customer/CustomerStatements';

import { ViewMode } from './types/banking';

type AppView = 'landing' | 'login' | 'signup' | 'dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [appView, setAppView] = useState<AppView>('landing');
  
  // Admin views
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // Customer views
  const [customerView, setCustomerView] = useState<CustomerViewMode>('dashboard');

  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomersView />;
      case 'accounts':
        return <AccountsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <Dashboard />;
    }
  };

  const renderCustomerView = () => {
    switch (customerView) {
      case 'dashboard':
        return <CustomerDashboard />;
      case 'accounts':
        return <CustomerAccounts />;
      case 'transfers':
        return <CustomerTransfers />;
      case 'profile':
        return <CustomerProfile />;
      case 'statements':
        return <CustomerStatements />;
      default:
        return <CustomerDashboard />;
    }
  };

  // If user is authenticated, show appropriate dashboard based on role
  if (isAuthenticated) {
    // Show customer portal for customers, admin dashboard for admin/teller
    if (user?.role === 'customer') {
      return (
        <div className="flex h-screen bg-gray-50">
          <CustomerSidebar currentView={customerView} onViewChange={setCustomerView} />
          <div className="flex-1 overflow-auto">
            {renderCustomerView()}
          </div>
        </div>
      );
    } else {
      // Admin/Teller dashboard
      return (
        <div className="flex h-screen bg-gray-50">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          <div className="flex-1 overflow-auto">
            {renderAdminView()}
          </div>
        </div>
      );
    }
  }

  // Show appropriate view based on current state
  switch (appView) {
    case 'login':
      return (
        <LoginPage
          onBack={() => setAppView('landing')}
          onSignup={() => setAppView('signup')}
        />
      );
    case 'signup':
      return (
        <SignupPage
          onBack={() => setAppView('landing')}
          onLogin={() => setAppView('login')}
        />
      );
    default:
      return (
        <LandingPage
          onLogin={() => setAppView('login')}
          onSignup={() => setAppView('signup')}
        />
      );
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;