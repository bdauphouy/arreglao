import { FlatList, Pressable, Text, View } from 'react-native';

import { JOB_CATEGORIES, JOB_CATEGORY_ICONS, JOB_CATEGORY_LABELS } from '../lib/job-categories';
import type { JobCategory } from '../schemas/job-category';

type CategoryRailProps = {
  onSelect: (category: JobCategory) => void;
};

export function CategoryRail({ onSelect }: CategoryRailProps) {
  return (
    <FlatList
      horizontal
      data={JOB_CATEGORIES}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-4 px-6"
      renderItem={({ item }) => {
        const Icon = JOB_CATEGORY_ICONS[item];
        return (
          <Pressable
            onPress={() => onSelect(item)}
            className="w-20 items-center gap-2 active:opacity-70"
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-olive-100">
              <Icon color="#14170F" size={26} strokeWidth={1.75} />
            </View>
            <Text numberOfLines={2} className="text-center font-sans-medium text-xs text-ink-900">
              {JOB_CATEGORY_LABELS[item]}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
