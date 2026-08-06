import { describe, expect, it } from 'vitest';

import { distanceKm, isWithinRadiusKm } from './distance';

describe('distanceKm', () => {
  it('returns 0 for the same point', () => {
    expect(distanceKm({ lat: 14.6, lng: -90.5 }, { lat: 14.6, lng: -90.5 })).toBeCloseTo(0);
  });

  it('computes the distance between two known points', () => {
    // Guatemala City to Tegucigalpa, roughly 380km apart.
    const result = distanceKm({ lat: 14.6349, lng: -90.5069 }, { lat: 14.0723, lng: -87.1921 });
    expect(result).toBeGreaterThan(340);
    expect(result).toBeLessThan(400);
  });
});

describe('isWithinRadiusKm', () => {
  const center = { lat: 15.5049, lng: -88.025 };

  it('is true for a point inside the radius', () => {
    // Roughly 5km north of center.
    expect(isWithinRadiusKm(center, { lat: 15.5499, lng: -88.025 }, 20)).toBe(true);
  });

  it('is false for a point outside the radius', () => {
    // Guatemala City, ~340km+ away.
    expect(isWithinRadiusKm(center, { lat: 14.6349, lng: -90.5069 }, 20)).toBe(false);
  });

  it('is false when the point is null (unknown location)', () => {
    expect(isWithinRadiusKm(center, null, 20)).toBe(false);
  });
});
