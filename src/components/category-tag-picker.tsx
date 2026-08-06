import { View } from 'react-native';

import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from '../lib/job-categories';
import type { JobCategory } from '../schemas/job-category';
import { Pill } from './pill';

type CategoryTagPickerProps = {
  value: JobCategory[];
  onChange: (value: JobCategory[]) => void;
};

export function CategoryTagPicker({ value, onChange }: CategoryTagPickerProps) {
  const toggle = (category: JobCategory) => {
    onChange(
      value.includes(category) ? value.filter((item) => item !== category) : [...value, category],
    );
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {JOB_CATEGORIES.map((category) => (
        <Pill key={category} selected={value.includes(category)} onPress={() => toggle(category)}>
          {JOB_CATEGORY_LABELS[category]}
        </Pill>
      ))}
    </View>
  );
}
