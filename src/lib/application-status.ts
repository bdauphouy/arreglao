import type { BadgeTone } from '../components/badge';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'En revisión',
  accepted: 'Aprobado',
  rejected: 'Rechazado',
  withdrawn: 'Cancelado',
};

export const APPLICATION_STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
};

// A withdrawn application isn't a dead-end outcome to render — it just
// means the applicant isn't currently applied (#41). Centralized so every
// "is this application still live" check reads the same way.
export function isWithdrawn(status: ApplicationStatus): boolean {
  return status === 'withdrawn';
}
