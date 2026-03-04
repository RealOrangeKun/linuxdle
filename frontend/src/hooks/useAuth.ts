import { useState, useEffect } from 'react';
import apiClient, { setAuthToken } from '../api/apiClient';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('linuxdle_token');
  });
  const [loading, setLoading] = useState(!token);

  useEffect(() => {
    const registerUser = async () => {
      if (token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.post<string>('/users');
        const accessToken = response.data;
        
        setAuthToken(accessToken);
        setToken(accessToken);
      } catch (error) {
        console.error('Failed to register user:', error);
      } finally {
        setLoading(false);
      }
    };

    registerUser();
  }, [token]);

  return { token, loading };
};
