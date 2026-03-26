import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMidnightReload } from '../hooks/useMidnightReload';

describe('useMidnightReload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('schedules a reload at the next UTC midnight', () => {
    // Fix "now" to 23:00 UTC — midnight is 1 hour away (3600000ms)
    const fakeNow = new Date('2026-03-26T23:00:00.000Z');
    vi.setSystemTime(fakeNow);

    renderHook(() => useMidnightReload());

    expect(window.location.reload).not.toHaveBeenCalled();

    // Advance just under 1 hour — should not have fired yet
    vi.advanceTimersByTime(3_599_999);
    expect(window.location.reload).not.toHaveBeenCalled();

    // Cross midnight
    vi.advanceTimersByTime(1);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('clears the timer on unmount', () => {
    vi.setSystemTime(new Date('2026-03-26T23:59:00.000Z'));

    const { unmount } = renderHook(() => useMidnightReload());
    unmount();

    // Advance past midnight — reload should NOT be called since timer was cleared
    vi.advanceTimersByTime(120_000);
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('fires immediately if somehow called right at midnight', () => {
    // Set time exactly to midnight UTC
    vi.setSystemTime(new Date('2026-03-27T00:00:00.000Z'));

    renderHook(() => useMidnightReload());

    // Next midnight is 24h away
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
