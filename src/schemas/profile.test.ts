import { describe, expect, it } from 'vitest';

import { profileDetailsSchema } from './profile';

describe('profileDetailsSchema', () => {
  it('accepts a valid first and last name', () => {
    const result = profileDetailsSchema.safeParse({ firstName: 'Ana', lastName: 'Pérez' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty first name', () => {
    const result = profileDetailsSchema.safeParse({ firstName: '', lastName: 'Pérez' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty last name', () => {
    const result = profileDetailsSchema.safeParse({ firstName: 'Ana', lastName: '' });
    expect(result.success).toBe(false);
  });
});
