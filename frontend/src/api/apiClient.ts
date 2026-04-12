import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshInFlight: Promise<string> | null = null;
const COUNTRY_BLOCKED_KEY = 'linuxdle_country_blocked';

const REFRESH_LOCK_KEY = 'linuxdle_refresh_lock';
const REFRESH_LOCK_TTL_MS = 10000;
const REFRESH_WAIT_TIMEOUT_MS = 12000;
const REFRESH_WAIT_INTERVAL_MS = 150;
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

type RefreshLock = {
  owner: string;
  expiresAt: number;
};

const isUnauthorizedStatus = (status?: number): boolean => status === 401 || status === 403;

export const setCountryBlocked = (blocked: boolean) => {
  if (blocked) {
    localStorage.setItem(COUNTRY_BLOCKED_KEY, '1');
  } else {
    localStorage.removeItem(COUNTRY_BLOCKED_KEY);
  }
};

export const isCountryBlocked = (): boolean => localStorage.getItem(COUNTRY_BLOCKED_KEY) === '1';

const buildHealthUrl = (): string => {
  const baseUrl = String(import.meta.env.VITE_API_URL ?? '').trim();
  if (!baseUrl) {
    return '/health';
  }

  if (baseUrl.endsWith('/api')) {
    return `${baseUrl.slice(0, -4)}/health`;
  }

  return `${baseUrl}/health`;
};

export const probeCountryRestriction = async (): Promise<boolean> => {
  try {
    const response = await axios.get(buildHealthUrl(), {
      withCredentials: true,
      validateStatus: () => true,
    });

    const blocked = response.status === 451;
    setCountryBlocked(blocked);

    if (blocked) {
      setAuthToken(null);
      window.dispatchEvent(new Event('geo:blocked'));
    }

    return blocked;
  } catch {
    return isCountryBlocked();
  }
};

const parseRefreshLock = (value: string | null): RefreshLock | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as RefreshLock;
  } catch {
    return null;
  }
};

const getRefreshLock = (): RefreshLock | null => {
  const lock = parseRefreshLock(localStorage.getItem(REFRESH_LOCK_KEY));

  if (!lock) {
    return null;
  }

  if (lock.expiresAt <= Date.now()) {
    localStorage.removeItem(REFRESH_LOCK_KEY);
    return null;
  }

  return lock;
};

const tryAcquireRefreshLock = (): boolean => {
  const existing = getRefreshLock();

  if (existing && existing.owner !== TAB_ID) {
    return false;
  }

  const lock: RefreshLock = {
    owner: TAB_ID,
    expiresAt: Date.now() + REFRESH_LOCK_TTL_MS,
  };

  localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(lock));

  const stored = getRefreshLock();
  return stored?.owner === TAB_ID;
};

const releaseRefreshLock = () => {
  const current = getRefreshLock();
  if (current?.owner === TAB_ID) {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForRefreshFromAnotherTab = async (): Promise<string | null> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < REFRESH_WAIT_TIMEOUT_MS) {
    const lock = getRefreshLock();

    if (!lock) {
      return localStorage.getItem('linuxdle_token');
    }

    await delay(REFRESH_WAIT_INTERVAL_MS);
  }

  return null;
};

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      if (tryAcquireRefreshLock()) {
        try {
          const response = await axios.post<string>(
            `${import.meta.env.VITE_API_URL}/users/refresh-token`,
            {},
            { withCredentials: true }
          );
          const accessToken = response.data;
          setAuthToken(accessToken);
          return accessToken;
        } finally {
          releaseRefreshLock();
        }
      }

      const tokenFromAnotherTab = await waitForRefreshFromAnotherTab();
      if (tokenFromAnotherTab) {
        setAuthToken(tokenFromAnotherTab);
        return tokenFromAnotherTab;
      }

      const response = await axios.post<string>(
        `${import.meta.env.VITE_API_URL}/users/refresh-token`,
        {},
        { withCredentials: true }
      );
      const accessToken = response.data;
      setAuthToken(accessToken);
      return accessToken;
    })().finally(() => {
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
  (response) => {
    setCountryBlocked(false);
    return response;
  },
  async (error) => {
    if (error.response?.status === 451) {
      setCountryBlocked(true);
      setAuthToken(null);
      window.dispatchEvent(new Event('geo:blocked'));
      return Promise.reject(error);
    }

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
