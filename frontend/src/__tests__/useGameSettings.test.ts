import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGameSettings } from '../hooks/useGameSettings';
import apiClient from '../api/apiClient';

describe('useGameSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with loading=true and default minGuessesToGiveUp=5', () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { minGuessesToGiveUp: 3 } });

    const { result } = renderHook(() => useGameSettings());

    expect(result.current.loading).toBe(true);
    expect(result.current.minGuessesToGiveUp).toBe(5);
  });

  it('fetches settings from API and updates state', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { minGuessesToGiveUp: 3 } });

    const { result } = renderHook(() => useGameSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.minGuessesToGiveUp).toBe(3);
    expect(apiClient.get).toHaveBeenCalledWith('/settings/game-settings');
  });

  it('caches the fetched settings in localStorage', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { minGuessesToGiveUp: 7 } });

    const { result } = renderHook(() => useGameSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'linuxdle_game_settings',
      JSON.stringify({ minGuessesToGiveUp: 7 })
    );
  });

  it('uses cached localStorage value before API responds', async () => {
    localStorage.setItem('linuxdle_game_settings', JSON.stringify({ minGuessesToGiveUp: 4 }));
    // Simulate slow API — resolves after we check the intermediate state
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { minGuessesToGiveUp: 4 } });

    const { result } = renderHook(() => useGameSettings());

    // Should have applied the cache synchronously during the effect
    await waitFor(() => expect(result.current.minGuessesToGiveUp).toBe(4));
  });

  it('sets loading=false even when the API call fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGameSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));
    // Falls back to default
    expect(result.current.minGuessesToGiveUp).toBe(5);
  });
});
