import { describe, expect, it } from 'vitest';

import { clampRadiusKm, MAX_RADIUS_KM, MIN_RADIUS_KM, parseRadiusInput } from './radius';

describe('clampRadiusKm', () => {
  it('leaves a radius within bounds untouched', () => {
    expect(clampRadiusKm(15)).toBe(15);
  });

  it('never drops below the minimum', () => {
    expect(clampRadiusKm(0)).toBe(MIN_RADIUS_KM);
    expect(clampRadiusKm(-10)).toBe(MIN_RADIUS_KM);
  });

  it('never exceeds the maximum', () => {
    expect(clampRadiusKm(MAX_RADIUS_KM + 50)).toBe(MAX_RADIUS_KM);
  });
});

describe('parseRadiusInput', () => {
  it('parses a plain numeric string', () => {
    expect(parseRadiusInput('25')).toBe(25);
  });

  it('strips non-digit characters', () => {
    expect(parseRadiusInput('25 km')).toBe(25);
  });

  it('treats an empty or non-numeric string as the minimum', () => {
    expect(parseRadiusInput('')).toBe(MIN_RADIUS_KM);
    expect(parseRadiusInput('km')).toBe(MIN_RADIUS_KM);
  });

  it('never drops below the minimum, even when typed explicitly', () => {
    expect(parseRadiusInput('0')).toBe(MIN_RADIUS_KM);
  });

  it('caps a typed amount at the max', () => {
    expect(parseRadiusInput('9999')).toBe(MAX_RADIUS_KM);
  });
});
