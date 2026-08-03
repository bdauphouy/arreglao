import { describe, expect, it } from 'vitest';

import { otpSchema, phoneSchema } from './auth';

describe('phoneSchema', () => {
  it('accepts a phone number in international format', () => {
    const result = phoneSchema.safeParse({ phone: '+15555550100' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty phone number', () => {
    const result = phoneSchema.safeParse({ phone: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number missing the leading +', () => {
    const result = phoneSchema.safeParse({ phone: '15555550100' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number with letters', () => {
    const result = phoneSchema.safeParse({ phone: '+1555555abcd' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number that starts with a 0 after the country code', () => {
    const result = phoneSchema.safeParse({ phone: '+0555550100' });
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
