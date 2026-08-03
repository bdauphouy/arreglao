import {
  Baby,
  GraduationCap,
  HeartHandshake,
  Laptop,
  PawPrint,
  Sparkles,
  Sprout,
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
};
