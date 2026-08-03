import { z } from 'zod';

export const jobCategorySchema = z.enum(['repairs', 'cleaning', 'moving', 'renovation', 'other']);

export type JobCategory = z.infer<typeof jobCategorySchema>;
