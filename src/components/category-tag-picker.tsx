import { Pressable, Text, View } from 'react-native';

import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from '../lib/job-categories';
import type { JobCategory } from '../schemas/profile';

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
      {JOB_CATEGORIES.map((category) => {
        const selected = value.includes(category);
        return (
          <Pressable
            key={category}
            onPress={() => toggle(category)}
            className={`rounded-full border px-4 py-2 ${
              selected ? 'border-accent bg-accent' : 'border-olive-200 bg-white'
            }`}
          >
            <Text
              className={`font-sans-medium text-sm ${selected ? 'text-ink-900' : 'text-olive-700'}`}
            >
              {JOB_CATEGORY_LABELS[category]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
