import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  UserPlus,
  Building2,
  User,
  BadgeCheck,
  Lock,
  AlertCircle,
} from 'lucide-react';

export default function AuthWrapper({ children }) {
  const { user, login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
    name: '',
    role: 'user',
    department: '',
  });
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (user) {
    return children;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      const result = login(formData.employeeId, formData.password);
      if (!result.success) {
        setError(result.error);
      }
    } else {
      if (!formData.name || !formData.employeeId || !formData.password || !formData.department) {
        setError('All fields are required');
        return;
      }
      const result = register(formData);
      if (result.success) {
        setIsLoginMode(true);
        setError('');
        setFormData({ ...formData, password: '' });
      } else {
        setError(result.error);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-800 rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ITFM System</h1>
          <p className="text-slate-500 mt-1">IT Facilities Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => {
                setIsLoginMode(true);
                setError('');
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                isLoginMode
                  ? 'text-blue-800 border-b-2 border-blue-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLoginMode(false);
                setError('');
              }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                !isLoginMode
                  ? 'text-blue-800 border-b-2 border-blue-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role
                    </label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all appearance-none bg-white"
                      >
                        <option value="user">User</option>
                        <option value="engineer">Engineer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Department Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="IT Support"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Employee ID Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee ID
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-800/25"
            >
              {isLoginMode ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-medium">Admin:</span> EMP001 / admin123</p>
                <p><span className="font-medium">Engineer:</span> EMP002 / eng123</p>
                <p><span className="font-medium">User:</span> EMP004 / user123</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
