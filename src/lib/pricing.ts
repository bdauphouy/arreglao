export const QUICK_PICK_PRICES = [100, 300, 500, 1000] as const;

export const PRICE_STEP = 50;

export const FALLBACK_PRICE = 300;

// 0 is a valid price (e.g. a favor done for free). Kept separate from
// PRICE_STEP so tuning the stepper's increment can never silently change
// the floor a price is allowed to reach.
const MIN_PRICE = 0;

export const MAX_PRICE = 999_999_999;

export function suggestedApplicationPrice(budget: number | null): number {
  return budget ?? FALLBACK_PRICE;
}

export function clampPrice(price: number): number {
  return Math.min(MAX_PRICE, Math.max(MIN_PRICE, price));
}

export function parsePriceInput(text: string): number {
  const digitsOnly = text.replace(/[^0-9]/g, '');
  return digitsOnly === '' ? 0 : Math.min(MAX_PRICE, Number(digitsOnly));
}
