import { z } from 'zod';

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+[1-9]\d{7,14}$/, 'Enter your number in international format, e.g. +15555550100'),
});

export type PhoneInput = z.infer<typeof phoneSchema>;

export const otpSchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export type OtpInput = z.infer<typeof otpSchema>;
