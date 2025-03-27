import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/auth';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await auth.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const user = await auth.login(email, password);
      setUser(user);
    } catch (error) {
      console.error('Failed to login', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const user = await auth.register(username, email, password);
      setUser(user);
    } catch (error) {
      console.error('Failed to register', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
