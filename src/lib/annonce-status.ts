import type { BadgeTone } from '../components/badge';

export type AnnonceStatus = 'open' | 'in_review' | 'assigned' | 'done' | 'cancelled';

export const ANNONCE_STATUS_LABELS: Record<AnnonceStatus, string> = {
  open: 'Abierto',
  in_review: 'En revisión',
  assigned: 'Asignado',
  done: 'Terminado',
  cancelled: 'Cancelado',
};

export const ANNONCE_STATUS_TONES: Record<AnnonceStatus, BadgeTone> = {
  open: 'info',
  in_review: 'warning',
  assigned: 'accent',
  done: 'success',
  cancelled: 'danger',
};
