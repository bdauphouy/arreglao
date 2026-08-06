export type Coordinates = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// A null point (no saved address) can never be confirmed nearby, so it's
// always treated as outside the radius rather than silently passing through.
export function isWithinRadiusKm(
  center: Coordinates,
  point: Coordinates | null,
  radiusKm: number,
): boolean {
  return point != null && distanceKm(center, point) <= radiusKm;
}
