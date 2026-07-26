import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiClient } from '../utils/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('aptcomm_token');
      if (token) {
        try {
          const profile = await apiClient.get('/api/auth/profile');
          setUser(profile);
        } catch (err) {
          console.error("Profile load failed, logging out", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { username, password });
      localStorage.setItem('aptcomm_token', response.token);
      localStorage.setItem('aptcomm_user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      return await apiClient.post('/api/auth/register', userData);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('aptcomm_token');
    localStorage.removeItem('aptcomm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
