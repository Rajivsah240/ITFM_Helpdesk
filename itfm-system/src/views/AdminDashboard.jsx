import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import TicketTable from '../components/TicketTable';
import AssignModal from '../components/AssignModal';
import {
  Ticket,
  AlertTriangle,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function AdminDashboard({ activeView }) {
  const { tickets, getUnassignedTickets, getActiveTickets, getEngineerWorkload, assignTicket } = useTickets();
  const { getEngineers } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const unassigned = getUnassignedTickets();
  const active = getActiveTickets();
  const workload = getEngineerWorkload();
  const engineers = getEngineers();

  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const totalActive = tickets.filter((t) => t.status !== 'resolved').length;

  const stats = [
    {
      label: 'Unassigned',
      value: unassigned.length,
      icon: Ticket,
      color: 'bg-red-50 text-red-600',
      iconBg: 'bg-red-100',
    },
    {
      label: 'Active Issues',
      value: active.length,
      icon: AlertTriangle,
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100',
    },
    {
      label: 'Total Active',
      value: totalActive,
      icon: Clock,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100',
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Tickets */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Unassigned Tickets</h3>
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {unassigned.length} pending
            </span>
          </div>
          {unassigned.length > 0 ? (
            <div className="space-y-3">
              {unassigned.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{ticket.id}</p>
                    <p className="text-sm text-slate-500 truncate">{ticket.problemDescription}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors">
                    Assign
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              All tickets are assigned!
            </div>
          )}
        </div>

        {/* Engineer Workload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Engineer Workload</h3>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {engineers.map((engineer) => {
              const load = workload[engineer.id];
              const count = load?.count || 0;
              const maxLoad = 5;
              const percentage = Math.min((count / maxLoad) * 100, 100);
              return (
                <div key={engineer.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{engineer.name}</span>
                    <span className="text-sm text-slate-500">{count} tickets</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${
                        percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnassigned = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Unassigned Tickets</h2>
          <p className="text-sm text-slate-500">Tickets waiting for engineer assignment</p>
        </div>
        <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
          {unassigned.length} tickets
        </span>
      </div>
      <TicketTable
        tickets={unassigned}
        onRowClick={(ticket) => setSelectedTicket(ticket)}
        showAssignee={false}
      />
    </div>
  );

  const renderActive = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Active Issues</h2>
          <p className="text-sm text-slate-500">Tickets currently being worked on</p>
        </div>
        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
          {active.length} tickets
        </span>
      </div>
      <TicketTable tickets={active} />
    </div>
  );

  const renderWorkload = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Engineer Workload</h2>
        <p className="text-sm text-slate-500">Current ticket distribution across engineers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {engineers.map((engineer) => {
          const load = workload[engineer.id];
          const count = load?.count || 0;
          const engineerTickets = tickets.filter(
            (t) => t.assignedTo === engineer.id && t.status !== 'resolved'
          );

          return (
            <motion.div
              key={engineer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-semibold">
                    {engineer.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{engineer.name}</p>
                  <p className="text-sm text-slate-500">{engineer.department}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Active Tickets</span>
                  <span className="font-semibold text-slate-800">{count}</span>
                </div>
                {engineerTickets.length > 0 && (
                  <div className="space-y-2">
                    {engineerTickets.slice(0, 3).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="px-3 py-2 bg-slate-50 rounded-lg text-sm"
                      >
                        <span className="font-mono text-blue-800">{ticket.id}</span>
                        <span className="text-slate-400 mx-2">·</span>
                        <span className="text-slate-600">{ticket.callType}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'unassigned' && renderUnassigned()}
          {activeView === 'active' && renderActive()}
          {activeView === 'workload' && renderWorkload()}
        </motion.div>
      </AnimatePresence>

      {/* Assign Modal */}
      {selectedTicket && (
        <AssignModal
          ticket={selectedTicket}
          engineers={engineers}
          onAssign={assignTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
}
