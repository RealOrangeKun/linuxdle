import { useState, useEffect } from 'react';
import axios from 'axios';
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
        // Recover an existing session from refresh cookie before creating a new user.
        const refreshResponse = await axios.post<string>(
          `${import.meta.env.VITE_API_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        const refreshedToken = refreshResponse.data;

        setAuthToken(refreshedToken);
        setToken(refreshedToken);
        return;
      } catch (refreshError: unknown) {
        const status = (refreshError as { response?: { status?: number } }).response?.status;

        // Only register a new user when there is no valid refresh session.
        if (status !== 401 && status !== 403) {
          console.error('Failed to restore session from refresh token:', refreshError);
          setLoading(false);
          return;
        }
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

  useEffect(() => {
    // Listen for token clearing events from the interceptor
    const handleTokenCleared = () => {
      setToken(null); // This will trigger the registerUser effect above
    };

    window.addEventListener('auth:token-cleared', handleTokenCleared);
    return () => window.removeEventListener('auth:token-cleared', handleTokenCleared);
  }, []);

  return { token, loading };
};
