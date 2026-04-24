export const ALL_STORAGE_KEYS = {
  commands: 'linuxdle_commands_state',
  distros: 'linuxdle_distros_state',
  des: 'linuxdle_des_state',
};

export type GameKey = keyof typeof ALL_STORAGE_KEYS;

export interface GameProgressItem {
  key: GameKey;
  label: string;
  path: string;
}

const GAME_PROGRESS_ITEMS: GameProgressItem[] = [
  { key: 'commands', label: 'Daily Commands', path: '/commands' },
  { key: 'distros', label: 'Daily Distros', path: '/distros' },
  { key: 'des', label: 'Daily Desktop Environments', path: '/des' },
];

const REDIRECT_FLAG_KEY = 'linuxdle_redirected_today';

const isStorageStateCompletedForToday = (storageKey: string, today: string): boolean => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return false;
  }

  try {
    const state = JSON.parse(saved);
    if (state && typeof state === 'object') {
      const isValidDate = typeof state.date === 'string';
      const isValidGameOverFlag = typeof state.isGameOver === 'boolean';

      if (isValidDate && isValidGameOverFlag) {
        return state.date === today && state.isGameOver;
      }
    }

    localStorage.removeItem(storageKey);
    return false;
  } catch {
    localStorage.removeItem(storageKey);
    return false;
  }
};

export const getUnfinishedGames = (completedGameKey?: GameKey): GameProgressItem[] => {
  const today = new Date().toISOString().split('T')[0];

  return GAME_PROGRESS_ITEMS.filter((item) => {
    if (completedGameKey && item.key === completedGameKey) {
      return false;
    }

    return !isStorageStateCompletedForToday(ALL_STORAGE_KEYS[item.key], today);
  });
};

export const checkAllGamesCompleted = (): boolean => {
  return getUnfinishedGames().length === 0;
};

export const hasRedirectedToday = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return localStorage.getItem(REDIRECT_FLAG_KEY) === today;
};

export const markAsRedirected = (): void => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(REDIRECT_FLAG_KEY, today);
};
