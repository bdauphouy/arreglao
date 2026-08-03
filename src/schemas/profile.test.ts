import { describe, expect, it } from 'vitest';

import { profileDetailsSchema, profileEditSchema } from './profile';

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

describe('profileEditSchema', () => {
  it('accepts a valid profile edit', () => {
    const result = profileEditSchema.safeParse({
      displayName: 'Ana Pérez',
      bio: 'Plomera con 5 años de experiencia.',
      categoryTags: ['bricolaje', 'jardineria'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty bio', () => {
    const result = profileEditSchema.safeParse({
      displayName: 'Ana Pérez',
      bio: '',
      categoryTags: ['bricolaje'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty display name', () => {
    const result = profileEditSchema.safeParse({
      displayName: '',
      bio: '',
      categoryTags: ['bricolaje'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects no category tags selected', () => {
    const result = profileEditSchema.safeParse({
      displayName: 'Ana Pérez',
      bio: '',
      categoryTags: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category tag', () => {
    const result = profileEditSchema.safeParse({
      displayName: 'Ana Pérez',
      bio: '',
      categoryTags: ['plumbing'],
    });
    expect(result.success).toBe(false);
  });
});
