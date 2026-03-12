/**
 * Utility for caching yesterday's target with UTC midnight expiration
 */

interface CachedData<T> {
  data: T;
  expiresAt: string;
  date: string; // Date for which this is "yesterday's" target
}

/**
 * Calculate milliseconds until next UTC midnight
 */
function getTimeUntilMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime() - now.getTime();
}

/**
 * Get today's date in UTC as YYYY-MM-DD
 */
function getTodayUTC(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    .toISOString()
    .split('T')[0];
}

/**
 * Get cached yesterday's target if valid
 */
export function getCachedYesterday<T>(gameType: 'commands' | 'distros' | 'des'): T | null {
  const key = `yesterday-${gameType}`;
  const cached = localStorage.getItem(key);
  
  if (!cached) {
    return null;
  }

  try {
    const parsed: CachedData<T> = JSON.parse(cached);
    const now = new Date();
    const expiresAt = new Date(parsed.expiresAt);
    const today = getTodayUTC();

    // Check if cache is still valid (not expired and for correct date)
    if (now < expiresAt && parsed.date === today) {
      return parsed.data;
    }

    // Cache expired or for wrong date, remove it
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    // Invalid cache data, remove it
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Cache yesterday's target until UTC midnight
 */
export function cacheYesterday<T>(gameType: 'commands' | 'distros' | 'des', data: T): void {
  const key = `yesterday-${gameType}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + getTimeUntilMidnightUTC());
  const today = getTodayUTC();

  const cacheData: CachedData<T> = {
    data,
    expiresAt: expiresAt.toISOString(),
    date: today,
  };

  try {
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    // localStorage might be full or disabled, fail silently
    console.warn('Failed to cache yesterday\'s target:', error);
  }
}

/**
 * Clear all yesterday caches (useful when user logs out or data changes)
 */
export function clearAllYesterdayCaches(): void {
  localStorage.removeItem('yesterday-commands');
  localStorage.removeItem('yesterday-distros');
  localStorage.removeItem('yesterday-des');
}
