import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../hooks/useAuth';
import apiClient, * as apiClientModule from '../api/apiClient';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('reads an existing token from localStorage without calling the API', async () => {
    localStorage.getItem = vi.fn().mockReturnValueOnce('existing-token');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.token).toBe('existing-token');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('uses refresh token when no access token exists', async () => {
    localStorage.getItem = vi.fn().mockReturnValueOnce(null);
    vi.spyOn(apiClientModule, 'refreshAccessToken').mockResolvedValueOnce('refreshed-token');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.token).toBe('refreshed-token');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('registers a new user when refresh token is unauthorized', async () => {
    localStorage.getItem = vi.fn().mockReturnValueOnce(null);
    vi.spyOn(apiClientModule, 'refreshAccessToken').mockRejectedValueOnce({ response: { status: 401 } });
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: 'new-token' });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiClient.post).toHaveBeenCalledWith('/users');
    expect(result.current.token).toBe('new-token');
  });

  it('does not auto-register when refresh fails with transient error', async () => {
    localStorage.getItem = vi.fn().mockReturnValueOnce(null);
    vi.spyOn(apiClientModule, 'refreshAccessToken').mockRejectedValueOnce({ response: { status: 500 } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(apiClient.post).not.toHaveBeenCalled();
    expect(result.current.token).toBeNull();
  });

  it('re-registers when auth:token-cleared event is dispatched', async () => {
    localStorage.getItem = vi.fn().mockReturnValueOnce('old-token');
    vi.spyOn(apiClientModule, 'refreshAccessToken').mockRejectedValueOnce({ response: { status: 401 } });
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: 'refreshed-token' });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Simulate the interceptor clearing the token
    act(() => {
      window.dispatchEvent(new Event('auth:token-cleared'));
    });

    await waitFor(() => expect(result.current.token).toBe('refreshed-token'));
    expect(apiClient.post).toHaveBeenCalledWith('/users');
  });
});
