import { describe, expect, it } from 'vitest';

import { distanceKm } from './distance';

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
