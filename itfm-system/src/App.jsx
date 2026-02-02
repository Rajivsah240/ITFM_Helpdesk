import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import AuthWrapper from './components/AuthWrapper';
import Sidebar from './components/Sidebar';
import AdminDashboard from './views/AdminDashboard';
import EngineerDashboard from './views/EngineerDashboard';
import UserDashboard from './views/UserDashboard';
import { Bell, Search } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('');

  // Set default view based on role
  useEffect(() => {
    if (user) {
      const defaultViews = {
        admin: 'dashboard',
        engineer: 'assigned',
        user: 'raise',
      };
      setActiveView(defaultViews[user.role] || 'dashboard');
    }
  }, [user]);

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      unassigned: 'Unassigned Tickets',
      active: 'Active Issues',
      workload: 'Engineer Workload',
      assigned: 'My Assigned Tickets',
      raise: 'Raise Query',
      mytickets: 'My Tickets',
    };
    return titles[activeView] || 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                key={activeView}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-slate-800"
              >
                {getPageTitle()}
              </motion.h1>
              <p className="text-sm text-slate-500">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
                />
              </div>
              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {/* User Avatar */}
              <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {user.role === 'admin' && <AdminDashboard activeView={activeView} />}
          {user.role === 'engineer' && <EngineerDashboard />}
          {user.role === 'user' && <UserDashboard activeView={activeView} />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <AuthWrapper>
          <Dashboard />
        </AuthWrapper>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App
