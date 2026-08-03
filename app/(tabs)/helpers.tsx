import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listHelpers, type Profile } from '../../src/api/profiles';
import { CategoryRail } from '../../src/components/category-rail';
import { ProfileSlider } from '../../src/components/profile-slider';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from '../../src/lib/job-categories';
import type { JobCategory } from '../../src/schemas/job-category';

export default function HelpersScreen() {
  const meQuery = useCurrentProfile();
  const myLocation = meQuery.data?.location ?? null;

  const helpersQuery = useQuery({
    queryKey: ['helpers'],
    queryFn: () => listHelpers(),
  });

  const helpers = useMemo(() => helpersQuery.data ?? [], [helpersQuery.data]);

  const helpersByCategory = useMemo(() => {
    const map = new Map<JobCategory, Profile[]>();
    for (const category of JOB_CATEGORIES) {
      map.set(
        category,
        helpers.filter((helper) => helper.categoryTags.includes(category)),
      );
    }
    return map;
  }, [helpers]);

  const handleSelectCategory = (category: JobCategory) => {
    router.push(`/helpers/category/${category}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 pb-10 pt-6">
        <View className="gap-1 px-6">
          <Text className="font-sans-extrabold text-3xl text-ink-900">Ayudantes</Text>
          <Text className="font-sans text-base text-olive-600">
            Encuentra ayudantes cerca de ti
          </Text>
        </View>

        <CategoryRail onSelect={handleSelectCategory} />

        {!helpersQuery.isLoading && helpers.length === 0 ? (
          <Text className="px-6 font-sans text-base text-olive-600">
            Todavía no hay ayudantes disponibles.
          </Text>
        ) : (
          JOB_CATEGORIES.map((category) => (
            <ProfileSlider
              key={category}
              title={JOB_CATEGORY_LABELS[category]}
              profiles={helpersByCategory.get(category) ?? []}
              myLocation={myLocation}
              onSeeAll={() => router.push(`/helpers/category/${category}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
