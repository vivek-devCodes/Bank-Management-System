import React from 'react';
import { 
  Home, 
  Users, 
  CreditCard, 
  ArrowUpDown, 
  FileText, 
  Settings,
  Building2
} from 'lucide-react';
import { ViewMode } from '../types/banking';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard' as ViewMode, icon: Home, label: 'Dashboard' },
    { id: 'customers' as ViewMode, icon: Users, label: 'Customers' },
    { id: 'accounts' as ViewMode, icon: CreditCard, label: 'Accounts' },
    { id: 'transactions' as ViewMode, icon: ArrowUpDown, label: 'Transactions' },
    { id: 'reports' as ViewMode, icon: FileText, label: 'Reports' }
  ];

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">SecureBank Pro</h1>
        </div>
      </div>
      
      <nav className="space-y-2">
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
      
      <div className="mt-auto pt-8">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;