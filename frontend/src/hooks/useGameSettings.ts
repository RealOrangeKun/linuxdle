import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface GameSettings {
  minGuessesToGiveUp: number;
}

const STORAGE_KEY = 'linuxdle_game_settings';

export const useGameSettings = () => {
  const [minGuessesToGiveUp, setMinGuessesToGiveUp] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setMinGuessesToGiveUp(parsed.minGuessesToGiveUp);
        }

        const response = await apiClient.get<GameSettings>('/settings/game-settings');
        setMinGuessesToGiveUp(response.data.minGuessesToGiveUp);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
      } catch (error) {
        console.error('Failed to fetch game settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { minGuessesToGiveUp, loading };
};
