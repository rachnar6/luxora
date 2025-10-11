import React, { createContext, useState, useContext } from 'react';
import { login, register } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // This part is correct: it loads the user from localStorage on initial load
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      
      // --- FIXED: Save the complete user object to localStorage ---
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await register(name, email, password);

      // --- FIXED: Save the complete user object to localStorage on registration ---
      localStorage.setItem('userInfo', JSON.stringify(data));

      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token: user?.token, // ADD THIS LINE
        loading, 
        error, 
        loginUser, 
        logoutUser, 
        registerUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// The AuthReducer below was not being used by your AuthProvider,
// which uses useState hooks instead. It has been removed for clarity.