export const QUICK_PICK_PRICES = [100, 300, 500, 1000] as const;

export const PRICE_STEP = 50;

const FALLBACK_PRICE = 300;

// Kept separate from PRICE_STEP so tuning the stepper's increment can never
// silently change the floor a price is allowed to reach.
const MIN_PRICE = 50;

export function suggestedApplicationPrice(
  budgetMin: number | null,
  budgetMax: number | null,
): number {
  if (budgetMin == null || budgetMax == null) {
    return FALLBACK_PRICE;
  }
  return Math.round((budgetMin + budgetMax) / 2);
}

export function clampPrice(price: number): number {
  return Math.max(MIN_PRICE, price);
}
