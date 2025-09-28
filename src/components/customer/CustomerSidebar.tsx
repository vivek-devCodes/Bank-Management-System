import React from 'react';
import { 
  Home, 
  CreditCard, 
  Send, 
  User, 
  FileText,
  Settings,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type CustomerViewMode = 'dashboard' | 'accounts' | 'transfers' | 'profile' | 'statements';

interface CustomerSidebarProps {
  currentView: CustomerViewMode;
  onViewChange: (view: CustomerViewMode) => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard' as CustomerViewMode, icon: Home, label: 'Dashboard' },
    { id: 'accounts' as CustomerViewMode, icon: CreditCard, label: 'My Accounts' },
    { id: 'transfers' as CustomerViewMode, icon: Send, label: 'Transfer Money' },
    { id: 'profile' as CustomerViewMode, icon: User, label: 'Profile' },
    { id: 'statements' as CustomerViewMode, icon: FileText, label: 'Statements' }
  ];

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">SecureBank Pro</h1>
        </div>
      </div>

      {/* User Info */}
      <div className="mb-8 p-4 bg-slate-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-300">Personal Banking</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Bottom Actions */}
      <div className="mt-auto pt-8 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </button>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;