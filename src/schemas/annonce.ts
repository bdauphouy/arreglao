import { z } from 'zod';

import { jobCategorySchema } from './job-category';

export const annonceCreateSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: jobCategorySchema,
  location: z.object({ lat: z.number(), lng: z.number() }),
});

export type AnnonceCreateInput = z.infer<typeof annonceCreateSchema>;
