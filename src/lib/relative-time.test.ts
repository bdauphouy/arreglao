import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { relativeTimeFromNow } from './relative-time';

describe('relativeTimeFromNow', () => {
  const now = new Date('2026-08-06T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function minutesAgo(minutes: number): string {
    return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
  }

  function hoursAgo(hours: number): string {
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  }

  it('returns "Ahora" for timestamps under a minute old', () => {
    expect(relativeTimeFromNow(minutesAgo(0))).toBe('Ahora');
    expect(relativeTimeFromNow(new Date(now.getTime() - 30 * 1000).toISOString())).toBe('Ahora');
  });

  it('returns minutes with a minimum of 1 minute', () => {
    expect(relativeTimeFromNow(minutesAgo(1))).toBe('Hace 1 minuto');
    expect(relativeTimeFromNow(minutesAgo(45))).toBe('Hace 45 minutos');
  });

  it('returns hours once an hour has passed', () => {
    expect(relativeTimeFromNow(hoursAgo(1))).toBe('Hace 1 hora');
    expect(relativeTimeFromNow(hoursAgo(5))).toBe('Hace 5 horas');
    expect(relativeTimeFromNow(hoursAgo(23))).toBe('Hace 23 horas');
  });

  it('falls back to days once a full day has passed', () => {
    expect(relativeTimeFromNow(hoursAgo(24))).toBe('Hace 1 día');
    expect(relativeTimeFromNow(hoursAgo(48))).toBe('Hace 2 días');
  });

  it('still reports weeks-old and months-old posts in days/months', () => {
    expect(relativeTimeFromNow(hoursAgo(24 * 10))).toBe('Hace 10 días');

    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTimeFromNow(fortyDaysAgo)).toBe('Hace 1 mes');
  });
});
