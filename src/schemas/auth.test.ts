import { describe, expect, it } from 'vitest';

import { emailSchema, otpSchema } from './auth';

describe('emailSchema', () => {
  it('accepts a valid email address', () => {
    const result = emailSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty email', () => {
    const result = emailSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an email missing the @', () => {
    const result = emailSchema.safeParse({ email: 'userexample.com' });
    expect(result.success).toBe(false);
  });

  it('rejects an email missing a domain', () => {
    const result = emailSchema.safeParse({ email: 'user@' });
    expect(result.success).toBe(false);
  });
});

describe('otpSchema', () => {
  it('accepts a 6-digit code', () => {
    const result = otpSchema.safeParse({ token: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects a code shorter than 6 digits', () => {
    const result = otpSchema.safeParse({ token: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects a code longer than 6 digits', () => {
    const result = otpSchema.safeParse({ token: '1234567' });
    expect(result.success).toBe(false);
  });

  it('rejects a code with non-digit characters', () => {
    const result = otpSchema.safeParse({ token: 'abcdef' });
    expect(result.success).toBe(false);
  });
});
