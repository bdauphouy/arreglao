import { z } from 'zod';

import { jobCategorySchema } from './job-category';

export const profileDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export type ProfileDetailsInput = z.infer<typeof profileDetailsSchema>;

export const profileEditSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  bio: z.string(),
  categoryTags: z.array(jobCategorySchema),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
