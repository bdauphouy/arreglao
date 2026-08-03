import { z } from 'zod';

import { jobCategorySchema } from './job-category';

export const profileDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export type ProfileDetailsInput = z.infer<typeof profileDetailsSchema>;

export const profileEditSchema = z.object({
  displayName: z.string().min(1, 'El nombre es obligatorio'),
  bio: z.string(),
  categoryTags: z.array(jobCategorySchema).min(1, 'Selecciona al menos una categoría'),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
