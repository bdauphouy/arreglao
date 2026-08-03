import { describe, expect, it } from 'vitest';

import { annonceCreateSchema } from './annonce';

describe('annonceCreateSchema', () => {
  it('accepts a valid annonce', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'repairs',
      location: { lat: 14.6, lng: -90.5 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = annonceCreateSchema.safeParse({
      title: '',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'repairs',
      location: { lat: 14.6, lng: -90.5 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty description', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: '',
      category: 'repairs',
      location: { lat: 14.6, lng: -90.5 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'plumbing',
      location: { lat: 14.6, lng: -90.5 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing location', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'repairs',
    });
    expect(result.success).toBe(false);
  });
});
