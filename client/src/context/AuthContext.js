import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const API = axios.create();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await API.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        console.log('Token verification failed');
        setToken(null);
        localStorage.removeItem('token');
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      console.log('Token is null, setting loading to false');
      setLoading(false);
    }
  }, [setLoading, token, API]);

  const signup = async (email, password, name) => {
    try {
      const response = await API.post('/api/auth/signup', {
        email,
        password,
        name,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', {
        email,
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
