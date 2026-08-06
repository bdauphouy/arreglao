import { Text, View } from 'react-native';

import { getCategoryColors, getCategoryLabel } from '../lib/job-categories';

type CategoryBadgeProps = {
  category: string;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const { bg, text } = getCategoryColors(category);

  return (
    <View
      style={{ backgroundColor: bg }}
      className="flex-row items-center self-start rounded-full px-2.5 py-1"
    >
      <Text style={{ color: text }} className="font-sans-bold text-xs">
        {getCategoryLabel(category)}
      </Text>
    </View>
  );
}
