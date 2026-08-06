import { describe, expect, it } from 'vitest';

import { clampPrice, MAX_PRICE, parsePriceInput, suggestedApplicationPrice } from './pricing';

describe('suggestedApplicationPrice', () => {
  it('returns the annonce budget as-is', () => {
    expect(suggestedApplicationPrice(600)).toBe(600);
  });

  it('falls back to a default when the budget is missing', () => {
    expect(suggestedApplicationPrice(null)).toBe(300);
  });
});

describe('clampPrice', () => {
  it('leaves a price above the floor untouched', () => {
    expect(clampPrice(300)).toBe(300);
  });

  it('treats 0 as a valid price', () => {
    expect(clampPrice(0)).toBe(0);
  });

  it('never drops below 0', () => {
    expect(clampPrice(-100)).toBe(0);
  });

  it('never exceeds the max', () => {
    expect(clampPrice(MAX_PRICE + 1)).toBe(MAX_PRICE);
  });
});

describe('parsePriceInput', () => {
  it('parses a plain numeric string', () => {
    expect(parsePriceInput('750')).toBe(750);
  });

  it('strips non-digit characters', () => {
    expect(parsePriceInput('L 1,250')).toBe(1250);
  });

  it('treats an empty or non-numeric string as 0', () => {
    expect(parsePriceInput('')).toBe(0);
    expect(parsePriceInput('L ')).toBe(0);
  });

  it('caps a typed amount at the max', () => {
    expect(parsePriceInput('9999999999')).toBe(MAX_PRICE);
  });
});
