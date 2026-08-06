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
