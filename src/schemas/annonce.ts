import { z } from 'zod';

import { jobCategorySchema } from './job-category';

export const annonceCreateSchema = z
  .object({
    title: z.string().min(1, 'El título es obligatorio'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    category: jobCategorySchema,
    budgetMin: z.number({ message: 'Indica un presupuesto mínimo' }).positive('Debe ser mayor a 0'),
    budgetMax: z.number({ message: 'Indica un presupuesto máximo' }).positive('Debe ser mayor a 0'),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: 'El máximo debe ser mayor o igual al mínimo',
    path: ['budgetMax'],
  });

export type AnnonceCreateInput = z.infer<typeof annonceCreateSchema>;
