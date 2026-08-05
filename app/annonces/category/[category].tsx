import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listOpenAnnonces } from '../../../src/api/annonces';
import { Card } from '../../../src/components/card';
import { useCurrentProfile } from '../../../src/hooks/use-current-profile';
import { distanceKm } from '../../../src/lib/distance';
import { JOB_CATEGORY_LABELS } from '../../../src/lib/job-categories';
import { jobCategorySchema } from '../../../src/schemas/job-category';

export default function CategoryAnnoncesScreen() {
  const { category: rawCategory } = useLocalSearchParams<{ category: string }>();
  const parsed = jobCategorySchema.safeParse(rawCategory);

  const meQuery = useCurrentProfile();
  const myLocation = meQuery.data?.location ?? null;

  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open', parsed.success ? parsed.data : null],
    queryFn: () => listOpenAnnonces({ category: parsed.data! }),
    enabled: parsed.success,
  });

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-row items-center gap-3 px-6 pt-6">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={1.75} color="#14170F" />
        </Pressable>
        <Text className="font-sans-extrabold text-2xl text-ink-900">
          {parsed.success ? JOB_CATEGORY_LABELS[parsed.data] : 'Categoría'}
        </Text>
      </View>

      <FlatList
        data={parsed.success ? (annoncesQuery.data ?? []) : []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 px-6 py-6"
        ListEmptyComponent={
          !parsed.success ? (
            <Text className="font-sans text-base text-olive-600">Categoría no encontrada.</Text>
          ) : annoncesQuery.isLoading ? null : (
            <Text className="font-sans text-base text-olive-600">
              No hay anuncios abiertos en esta categoría por ahora.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/annonces/${item.id}`)}>
            <Card className="gap-1">
              <Text className="font-sans-semibold text-base text-ink-900">{item.title}</Text>
              <Text className="font-sans text-sm text-olive-600">
                {JOB_CATEGORY_LABELS[item.category]}
                {myLocation ? ` · ${distanceKm(myLocation, item.location).toFixed(1)} km` : ''}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
