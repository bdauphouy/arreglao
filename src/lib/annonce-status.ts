export type AnnonceStatus = 'open' | 'in_review' | 'assigned' | 'done' | 'cancelled';

export const ANNONCE_STATUS_LABELS: Record<AnnonceStatus, string> = {
  open: 'Abierto',
  in_review: 'En revisión',
  assigned: 'Asignado',
  done: 'Terminado',
  cancelled: 'Cancelado',
};
