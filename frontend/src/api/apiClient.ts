import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshInFlight: Promise<string> | null = null;

const isUnauthorizedStatus = (status?: number): boolean => status === 401 || status === 403;

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<string>(
        `${import.meta.env.VITE_API_URL}/users/refresh-token`,
        {},
        { withCredentials: true }
      )
      .then((response) => {
        const accessToken = response.data;
        setAuthToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

// Initialize token from localStorage immediately to avoid race conditions
const savedToken = localStorage.getItem('linuxdle_token');
if (savedToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('linuxdle_token', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('linuxdle_token');
  }
};

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
    };

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // Update the original request's authorization header
        originalRequest.headers ??= {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        const refreshStatus = (refreshError as { response?: { status?: number } }).response?.status;

        // Only clear auth when refresh credentials are actually invalid.
        if (isUnauthorizedStatus(refreshStatus)) {
          setAuthToken(null);
          // Dispatch event so useAuth hook can re-register
          window.dispatchEvent(new Event('auth:token-cleared'));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
