import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [engineers, setEngineers] = useState([]);

  useEffect(() => {
    // Check for stored session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await authService.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.error || 'Invalid credentials';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        // Auto-login after registration
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateDetails(data);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, error: 'Update failed' };
    } catch (error) {
      const message = error.response?.data?.error || 'Update failed';
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.updatePassword({
        currentPassword,
        newPassword
      });
      return { success: response.success };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      return { success: false, error: message };
    }
  };

  const getEngineers = async () => {
    try {
      const response = await userService.getEngineers();
      if (response.success) {
        setEngineers(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching engineers:', error);
      return [];
    }
  };

  const getWorkload = async () => {
    try {
      const response = await userService.getWorkload();
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error fetching workload:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
        getEngineers,
        getWorkload,
        engineers
      }}
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
