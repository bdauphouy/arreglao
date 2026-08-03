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
