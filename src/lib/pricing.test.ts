import { describe, expect, it } from 'vitest';

import { clampPrice, MAX_PRICE, parsePriceInput, suggestedApplicationPrice } from './pricing';

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
