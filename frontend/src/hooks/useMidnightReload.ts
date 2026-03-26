import { useEffect } from 'react';

/**
 * Schedules a full page reload at the next UTC midnight.
 * This ensures that if a user keeps the page open past midnight,
 * the game resets correctly (new puzzle, fresh screenshot URL, etc.)
 * instead of serving the previous day's data mixed with today's backend state.
 */
export function useMidnightReload() {
  useEffect(() => {
    const now = new Date();
    const nextMidnightUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const msUntilMidnight = nextMidnightUtc.getTime() - now.getTime();

    const timer = setTimeout(() => {
      window.location.reload();
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);
}
