import { View } from 'react-native';

import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from '../lib/job-categories';
import type { JobCategory } from '../schemas/job-category';
import { Pill } from './pill';

type CategoryPickerProps = {
  value: JobCategory | null;
  onChange: (value: JobCategory) => void;
};

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {JOB_CATEGORIES.map((category) => (
        <Pill key={category} selected={value === category} onPress={() => onChange(category)}>
          {JOB_CATEGORY_LABELS[category]}
        </Pill>
      ))}
    </View>
  );
}
