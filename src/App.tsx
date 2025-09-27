import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomersView from './components/CustomersView';
import AccountsView from './components/AccountsView';
import TransactionsView from './components/TransactionsView';
import ReportsView from './components/ReportsView';
import TransactionsManager from './components/TransactionsManager';
import { ViewMode } from './types/banking';

type AppView = 'landing' | 'login' | 'signup' | 'dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [appView, setAppView] = useState<AppView>('landing');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  const renderCurrentView = () => {
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

  // If user is authenticated, show the banking dashboard
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="flex-1 overflow-auto">
          {renderCurrentView()}
        </div>
      </div>
    );
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