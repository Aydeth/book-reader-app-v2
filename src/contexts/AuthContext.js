import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { initTelegram } from '../services/telegram';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telegram, setTelegram] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { tg, user: tgUser, initData } = await initTelegram();
        setTelegram({ tg, initData });

        if (tgUser) {
          await loginWithTelegram(tgUser);
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const loginWithTelegram = async (tgUser) => {
    try {
      const response = await api.post('/auth/telegram', {
        id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    telegram,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};