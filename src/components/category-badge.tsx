import { Text, View } from 'react-native';

import { JOB_CATEGORY_COLORS, JOB_CATEGORY_LABELS } from '../lib/job-categories';
import type { JobCategory } from '../schemas/job-category';

type CategoryBadgeProps = {
  category: JobCategory;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const { bg, text } = JOB_CATEGORY_COLORS[category];

  return (
    <View
      style={{ backgroundColor: bg }}
      className="flex-row items-center self-start rounded-full px-2.5 py-1"
    >
      <Text style={{ color: text }} className="font-sans-bold text-xs">
        {JOB_CATEGORY_LABELS[category]}
      </Text>
    </View>
  );
}
