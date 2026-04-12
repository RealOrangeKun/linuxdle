import { useState, useEffect } from 'react';
import apiClient, { refreshAccessToken, setAuthToken, setCountryBlocked } from '../api/apiClient';

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
        const refreshedToken = await refreshAccessToken();

        setCountryBlocked(false);
        setAuthToken(refreshedToken);
        setToken(refreshedToken);
        return;
      } catch (refreshError: unknown) {
        const status = (refreshError as { response?: { status?: number } }).response?.status;

        if (status === 451) {
          setCountryBlocked(true);
          window.dispatchEvent(new Event('geo:blocked'));
          setLoading(false);
          return;
        }

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
        
        setCountryBlocked(false);
        setAuthToken(accessToken);
        setToken(accessToken);
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 451) {
          setCountryBlocked(true);
          window.dispatchEvent(new Event('geo:blocked'));
        } else {
          console.error('Failed to register user:', error);
        }
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
