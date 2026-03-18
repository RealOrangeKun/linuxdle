export const ALL_STORAGE_KEYS = {
  commands: 'linuxdle_commands_state',
  distros: 'linuxdle_distros_state',
  des: 'linuxdle_des_state',
};

const REDIRECT_FLAG_KEY = 'linuxdle_redirected_today';

export const checkAllGamesCompleted = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  
  const status = Object.values(ALL_STORAGE_KEYS).map(key => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state && typeof state === 'object') {
          const isValidDate = typeof state.date === 'string';
          const isValidGameOverFlag = typeof state.isGameOver === 'boolean';

          if (isValidDate && isValidGameOverFlag) {
            return state.date === today && state.isGameOver;
          }
        }

        localStorage.removeItem(key);
        return false;
      } catch {
        localStorage.removeItem(key);
        return false;
      }
    }
    return false;
  });

  return status.every(s => s === true);
};

export const hasRedirectedToday = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const redirectFlag = sessionStorage.getItem(REDIRECT_FLAG_KEY);
  return redirectFlag === today;
};

export const markAsRedirected = (): void => {
  const today = new Date().toISOString().split('T')[0];
  sessionStorage.setItem(REDIRECT_FLAG_KEY, today);
};
