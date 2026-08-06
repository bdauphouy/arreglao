import { z } from 'zod';

export const jobCategorySchema = z.enum([
  'bricolaje',
  'jardineria',
  'mudanza',
  'limpieza',
  'ninos',
  'animales',
  'informatica',
  'ayuda_domicilio',
  'clases_particulares',
]);

export type JobCategory = z.infer<typeof jobCategorySchema>;

// Annonces accept a custom category (#29): posters can type one of their own
// when nothing in the suggested job_category list fits. profiles.category_tags
// (the helper skills picker) stays the closed enum above — unrelated to this.
export const annonceCategorySchema = z
  .string()
  .trim()
  .min(1, 'La categoría es obligatoria')
  .max(40, 'La categoría es demasiado larga (máx. 40 caracteres)');
