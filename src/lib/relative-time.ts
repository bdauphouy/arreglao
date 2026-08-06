export function yearsSince(isoDate: string): number {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
}

function hace(n: number, singular: string, plural: string): string {
  return n === 1 ? `Hace 1 ${singular}` : `Hace ${n} ${plural}`;
}

export function relativeTimeFromNow(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Ahora';
  }
  if (diffMinutes < 60) {
    return hace(diffMinutes, 'minuto', 'minutos');
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return hace(diffHours, 'hora', 'horas');
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return hace(diffDays, 'día', 'días');
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return hace(diffMonths, 'mes', 'meses');
  }

  const diffYears = Math.floor(diffMonths / 12);
  return hace(diffYears, 'año', 'años');
}
