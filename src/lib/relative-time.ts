export function yearsSince(isoDate: string): number {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
}

export function relativeTimeFromNow(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return 'Hoy';
  }
  if (diffDays === 1) {
    return 'Hace 1 día';
  }
  if (diffDays < 30) {
    return `Hace ${diffDays} días`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? 'Hace 1 año' : `Hace ${diffYears} años`;
}
