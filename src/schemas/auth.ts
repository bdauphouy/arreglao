import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type EmailInput = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export type OtpInput = z.infer<typeof otpSchema>;
