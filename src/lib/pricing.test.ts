import { describe, expect, it } from 'vitest';

import { clampPrice, suggestedApplicationPrice } from './pricing';

describe('suggestedApplicationPrice', () => {
  it('returns the rounded mean of the budget range', () => {
    expect(suggestedApplicationPrice(300, 600)).toBe(450);
  });

  it('rounds a fractional mean to the nearest integer', () => {
    expect(suggestedApplicationPrice(300, 601)).toBe(451);
  });

  it('falls back to a default when the budget range is missing', () => {
    expect(suggestedApplicationPrice(null, null)).toBe(300);
  });

  it('falls back to a default when only one bound is missing', () => {
    expect(suggestedApplicationPrice(300, null)).toBe(300);
    expect(suggestedApplicationPrice(null, 600)).toBe(300);
  });
});

describe('clampPrice', () => {
  it('leaves a price above the floor untouched', () => {
    expect(clampPrice(300)).toBe(300);
  });

  it('never drops below the floor', () => {
    expect(clampPrice(10)).toBe(50);
    expect(clampPrice(-100)).toBe(50);
  });
});
