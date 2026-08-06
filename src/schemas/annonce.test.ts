import { describe, expect, it } from 'vitest';

import { annonceCreateSchema } from './annonce';

describe('annonceCreateSchema', () => {
  it('accepts a valid annonce', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'bricolaje',
      budget: 600,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = annonceCreateSchema.safeParse({
      title: '',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'bricolaje',
      budget: 600,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty description', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: '',
      category: 'bricolaje',
      budget: 600,
    });
    expect(result.success).toBe(false);
  });

  it('accepts the "otro" catch-all category', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'otro',
      budget: 600,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid category', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'plumbing',
      budget: 600,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing budget', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'bricolaje',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive budget', () => {
    const result = annonceCreateSchema.safeParse({
      title: 'Reparar fuga de agua',
      description: 'Hay una fuga debajo del fregadero de la cocina.',
      category: 'bricolaje',
      budget: 0,
    });
    expect(result.success).toBe(false);
  });
});
