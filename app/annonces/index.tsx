import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listOpenAnnonces } from '../../src/api/annonces';
import { getCurrentUserId } from '../../src/api/auth';
import { getProfile } from '../../src/api/profiles';
import { Card } from '../../src/components/card';
import { Pill } from '../../src/components/pill';
import { distanceKm } from '../../src/lib/distance';
import { JOB_CATEGORIES, JOB_CATEGORY_LABELS } from '../../src/lib/job-categories';
import type { JobCategory } from '../../src/schemas/job-category';

export default function BrowseAnnoncesScreen() {
  const [category, setCategory] = useState<JobCategory | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  const meQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      return userId ? getProfile(userId) : null;
    },
  });

  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open', category],
    queryFn: () => listOpenAnnonces(category ? { category } : undefined),
  });

  const myLocation = meQuery.data?.location ?? null;

  const annonces = useMemo(() => {
    const list = annoncesQuery.data ?? [];
    if (!sortByDistance || !myLocation) {
      return list;
    }
    return [...list].sort(
      (a, b) => distanceKm(myLocation, a.location) - distanceKm(myLocation, b.location),
    );
  }, [annoncesQuery.data, sortByDistance, myLocation]);

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="gap-4 px-6 pt-6">
        <Text className="font-sans-extrabold text-3xl text-ink-900">Anuncios</Text>

        <View className="flex-row flex-wrap gap-2">
          <Pill selected={category === null} onPress={() => setCategory(null)}>
            Todas
          </Pill>
          {JOB_CATEGORIES.map((item) => (
            <Pill key={item} selected={category === item} onPress={() => setCategory(item)}>
              {JOB_CATEGORY_LABELS[item]}
            </Pill>
          ))}
        </View>

        <View className="self-start">
          <Pill
            selected={sortByDistance}
            disabled={!myLocation}
            onPress={() => setSortByDistance((prev) => !prev)}
          >
            {myLocation ? 'Ordenar por cercanía' : 'Agrega tu ubicación para ordenar por cercanía'}
          </Pill>
        </View>
      </View>

      <FlatList
        data={annonces}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 px-6 py-6"
        ListEmptyComponent={
          annoncesQuery.isLoading ? null : (
            <Text className="font-sans text-base text-olive-600">
              No hay anuncios abiertos por ahora.
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
