import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  Plus,
  ClipboardList,
  Users,
  LogOut,
  Building2,
  ChevronRight,
} from 'lucide-react';

const menuItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'unassigned', label: 'Unassigned Tickets', icon: Ticket },
    { id: 'active', label: 'Active Issues', icon: ClipboardList },
    { id: 'workload', label: 'Engineer Workload', icon: Users },
  ],
  engineer: [
    { id: 'assigned', label: 'Assigned to Me', icon: ClipboardList },
  ],
  user: [
    { id: 'raise', label: 'Raise Query', icon: Plus },
    { id: 'mytickets', label: 'My Tickets', icon: Ticket },
  ],
};

export default function Sidebar({ activeView, setActiveView }) {
  const { user, logout } = useAuth();
  const items = menuItems[user.role] || [];

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-800/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">ITFM System</h1>
            <p className="text-xs text-slate-400">Facilities Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-800 font-semibold text-sm">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 text-sm truncate">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3 mb-3">
          Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-800 text-white shadow-lg shadow-blue-800/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
