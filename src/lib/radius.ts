export const QUICK_PICK_RADII_KM = [5, 10, 25, 50] as const;

export const RADIUS_STEP_KM = 5;

// Falls back to this when a profile has no service_radius_km set (it's only
// ever populated for providers today — see src/api/profiles.ts).
export const DEFAULT_MAP_RADIUS_KM = 15;

// Default scope for the Helpers tab (GH #38) — fixed, not user-editable.
export const DEFAULT_HELPERS_RADIUS_KM = 20;

export const MIN_RADIUS_KM = 1;

export const MAX_RADIUS_KM = 200;

export function clampRadiusKm(radiusKm: number): number {
  return Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, radiusKm));
}

export function parseRadiusInput(text: string): number {
  const digitsOnly = text.replace(/[^0-9]/g, '');
  return digitsOnly === '' ? MIN_RADIUS_KM : clampRadiusKm(Number(digitsOnly));
}
