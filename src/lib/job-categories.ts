import type { JobCategory } from '../schemas/job-category';

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  repairs: 'Reparaciones',
  cleaning: 'Limpieza',
  moving: 'Mudanzas',
  renovation: 'Remodelación',
  other: 'Otro',
};

export const JOB_CATEGORIES = Object.keys(JOB_CATEGORY_LABELS) as JobCategory[];
