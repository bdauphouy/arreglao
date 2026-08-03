import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listOpenAnnonces } from '../../src/api/annonces';
import { AnnonceSlider } from '../../src/components/annonce-slider';
import { CategoryRail } from '../../src/components/category-rail';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { distanceKm } from '../../src/lib/distance';
import type { JobCategory } from '../../src/schemas/job-category';

const SLIDER_LIMIT = 10;

export default function HomeScreen() {
  const meQuery = useCurrentProfile();
  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open'],
    queryFn: () => listOpenAnnonces(),
  });

  const me = meQuery.data ?? null;
  const annonces = useMemo(() => annoncesQuery.data ?? [], [annoncesQuery.data]);
  const myLocation = me?.location ?? null;

  const recent = useMemo(() => annonces.slice(0, SLIDER_LIMIT), [annonces]);

  const forYou = useMemo(() => {
    if (!me || me.categoryTags.length === 0) {
      return recent;
    }
    const tags = new Set(me.categoryTags);
    return annonces.filter((annonce) => tags.has(annonce.category)).slice(0, SLIDER_LIMIT);
  }, [annonces, me, recent]);

  const nearYou = useMemo(() => {
    if (!myLocation) {
      return [];
    }
    return [...annonces]
      .sort((a, b) => distanceKm(myLocation, a.location) - distanceKm(myLocation, b.location))
      .slice(0, SLIDER_LIMIT);
  }, [annonces, myLocation]);

  const greetingName = me?.firstName ?? null;

  const handleSelectCategory = (category: JobCategory) => {
    router.push(`/annonces/category/${category}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 pb-10 pt-6">
        <View className="gap-1 px-6">
          <Text className="font-sans-extrabold text-3xl text-ink-900">
            {greetingName ? `Hola, ${greetingName}` : 'Hola'}
          </Text>
          <Text className="font-sans text-base text-olive-600">
            Encuentra trabajos que te interesan
          </Text>
        </View>

        <CategoryRail onSelect={handleSelectCategory} />

        {!annoncesQuery.isLoading && annonces.length === 0 ? (
          <Text className="px-6 font-sans text-base text-olive-600">
            No hay anuncios abiertos por ahora.
          </Text>
        ) : (
          <>
            <AnnonceSlider title="Para ti" annonces={forYou} myLocation={myLocation} />
            <AnnonceSlider title="Cerca de ti" annonces={nearYou} myLocation={myLocation} />
            <AnnonceSlider title="Recientes" annonces={recent} myLocation={myLocation} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
