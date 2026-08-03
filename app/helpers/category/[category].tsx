import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { displayNameFor, listHelpers } from '../../../src/api/profiles';
import { Avatar } from '../../../src/components/avatar';
import { Card } from '../../../src/components/card';
import { IconButton } from '../../../src/components/icon-button';
import { useCurrentProfile } from '../../../src/hooks/use-current-profile';
import { distanceKm } from '../../../src/lib/distance';
import { JOB_CATEGORY_LABELS } from '../../../src/lib/job-categories';
import { jobCategorySchema } from '../../../src/schemas/job-category';

export default function HelpersCategoryScreen() {
  const { category: rawCategory } = useLocalSearchParams<{ category: string }>();
  const parsed = jobCategorySchema.safeParse(rawCategory);

  const meQuery = useCurrentProfile();
  const myLocation = meQuery.data?.location ?? null;

  const helpersQuery = useQuery({
    queryKey: ['helpers'],
    queryFn: () => listHelpers(),
  });

  const helpers = (helpersQuery.data ?? []).filter((helper) =>
    parsed.success ? helper.categoryTags.includes(parsed.data) : false,
  );

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-row items-center gap-3 px-6 pt-6">
        <IconButton onPress={() => router.back()}>
          <ArrowLeft color="#14170F" size={20} />
        </IconButton>
        <Text className="font-sans-extrabold text-2xl text-ink-900">
          {parsed.success ? JOB_CATEGORY_LABELS[parsed.data] : 'Categoría'}
        </Text>
      </View>

      <FlatList
        data={parsed.success ? helpers : []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 px-6 py-6"
        ListEmptyComponent={
          !parsed.success ? (
            <Text className="font-sans text-base text-olive-600">Categoría no encontrada.</Text>
          ) : helpersQuery.isLoading ? null : (
            <Text className="font-sans text-base text-olive-600">
              No hay ayudantes en esta categoría por ahora.
            </Text>
          )
        }
        renderItem={({ item }) => {
          const name = displayNameFor(item);
          return (
            <Pressable onPress={() => router.push(`/profile/${item.id}`)}>
              <Card className="flex-row items-center gap-3">
                <Avatar
                  src={item.avatarUrl}
                  initials={name.charAt(0).toUpperCase() || '?'}
                  size={48}
                />
                <View className="flex-1">
                  <Text className="font-sans-semibold text-base text-ink-900">{name}</Text>
                  <Text className="font-sans text-sm text-olive-600">
                    {item.averageRating != null
                      ? `★ ${item.averageRating.toFixed(1)}`
                      : 'Sin reseñas'}
                    {myLocation && item.location
                      ? ` · ${distanceKm(myLocation, item.location).toFixed(1)} km`
                      : ''}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
