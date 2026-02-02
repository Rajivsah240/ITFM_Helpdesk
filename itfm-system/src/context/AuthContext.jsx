import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock users database
const mockUsers = [
  { id: 'EMP001', name: 'Admin User', role: 'admin', department: 'IT Management', password: 'admin123' },
  { id: 'EMP002', name: 'John Engineer', role: 'engineer', department: 'IT Support', password: 'eng123' },
  { id: 'EMP003', name: 'Jane Engineer', role: 'engineer', department: 'IT Support', password: 'eng123' },
  { id: 'EMP004', name: 'Mike Smith', role: 'user', department: 'Finance', password: 'user123' },
  { id: 'EMP005', name: 'Sarah Johnson', role: 'user', department: 'HR', password: 'user123' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('itfm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (employeeId, password) => {
    const foundUser = users.find(
      (u) => u.id === employeeId && u.password === password
    );
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('itfm_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (userData) => {
    const existingUser = users.find((u) => u.id === userData.employeeId);
    if (existingUser) {
      return { success: false, error: 'Employee ID already exists' };
    }
    const newUser = {
      id: userData.employeeId,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      password: userData.password,
    };
    setUsers([...users, newUser]);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('itfm_user');
  };

  const getEngineers = () => {
    return users.filter((u) => u.role === 'engineer');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, isLoading, getEngineers }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
