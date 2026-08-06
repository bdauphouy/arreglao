import {
  Baby,
  GraduationCap,
  HeartHandshake,
  Laptop,
  PawPrint,
  Sparkles,
  Sprout,
  Tag,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import type { JobCategory } from '../schemas/job-category';

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  bricolaje: 'Bricolaje',
  jardineria: 'Jardinería',
  mudanza: 'Mudanza',
  limpieza: 'Limpieza',
  ninos: 'Niños',
  animales: 'Animales',
  informatica: 'Informática',
  ayuda_domicilio: 'Ayuda a domicilio',
  clases_particulares: 'Clases particulares',
  otro: 'Otro',
};

export const JOB_CATEGORIES = Object.keys(JOB_CATEGORY_LABELS) as JobCategory[];

export const JOB_CATEGORY_ICONS: Record<JobCategory, LucideIcon> = {
  bricolaje: Wrench,
  jardineria: Sprout,
  mudanza: Truck,
  limpieza: Sparkles,
  ninos: Baby,
  animales: PawPrint,
  informatica: Laptop,
  ayuda_domicilio: HeartHandshake,
  clases_particulares: GraduationCap,
  otro: Tag,
};

// Per-category tint pairs (background/text) for CategoryBadge — warm, muted
// tones consistent with DESIGN.md's olive/sand palette rather than neon
// tailwind defaults. Not expressed as tailwind.config.js tokens since these
// ten one-off tints are only used by this single component.
export const JOB_CATEGORY_COLORS: Record<JobCategory, { bg: string; text: string }> = {
  bricolaje: { bg: '#F3E4D2', text: '#8A5A22' },
  jardineria: { bg: '#DEEBD3', text: '#3F6B2B' },
  mudanza: { bg: '#E1E7F0', text: '#33507D' },
  limpieza: { bg: '#DFF0EA', text: '#296B58' },
  ninos: { bg: '#F7E2E8', text: '#9C3E5B' },
  animales: { bg: '#EDE3F3', text: '#6B3F94' },
  informatica: { bg: '#DDEBF2', text: '#2C6B87' },
  ayuda_domicilio: { bg: '#FBE9D7', text: '#96591C' },
  clases_particulares: { bg: '#F5E9D0', text: '#8C6A18' },
  otro: { bg: '#E7E4D3', text: '#5C5A44' },
};
