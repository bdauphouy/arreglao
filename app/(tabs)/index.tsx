import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Annonce } from '../../src/api/annonces';
import { listOpenAnnonces } from '../../src/api/annonces';
import { displayNameFor, getProfiles, type Profile } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import { Card } from '../../src/components/card';
import { CategoryRail } from '../../src/components/category-rail';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { distanceKm, type Coordinates } from '../../src/lib/distance';
import { JOB_CATEGORY_LABELS } from '../../src/lib/job-categories';
import type { JobCategory } from '../../src/schemas/job-category';

export default function HomeScreen() {
  const meQuery = useCurrentProfile();
  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open'],
    queryFn: () => listOpenAnnonces(),
  });

  const me = meQuery.data ?? null;
  const annonces = useMemo(() => annoncesQuery.data ?? [], [annoncesQuery.data]);
  const myLocation = me?.location ?? null;

  const posterIds = useMemo(
    () => Array.from(new Set(annonces.map((annonce) => annonce.posterId))),
    [annonces],
  );
  const postersQuery = useQuery({
    queryKey: ['profiles', posterIds],
    queryFn: () => getProfiles(posterIds),
    enabled: posterIds.length > 0,
  });
  const posterById = useMemo(
    () => new Map((postersQuery.data ?? []).map((profile) => [profile.id, profile])),
    [postersQuery.data],
  );

  const recent = annonces;

  const forYou = useMemo(() => {
    if (!me || me.categoryTags.length === 0) {
      return recent;
    }
    const tags = new Set(me.categoryTags);
    return annonces.filter((annonce) => tags.has(annonce.category));
  }, [annonces, me, recent]);

  const nearYou = useMemo(() => {
    if (!myLocation) {
      return [];
    }
    return [...annonces].sort(
      (a, b) => distanceKm(myLocation, a.location) - distanceKm(myLocation, b.location),
    );
  }, [annonces, myLocation]);

  const greetingName = me?.firstName ?? null;

  const handleSelectCategory = (category: JobCategory) => {
    router.push(`/annonces/category/${category}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 pb-10 pt-6">
        <View className="gap-4 px-6">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.push('/account')}>
              <Avatar
                src={me?.avatarUrl}
                initials={me ? displayNameFor(me).charAt(0).toUpperCase() || '?' : '?'}
                size={44}
              />
            </Pressable>
            <Text className="font-sans-extrabold text-2xl text-ink-900">
              {greetingName ? `Hola, ${greetingName}` : 'Hola'}
            </Text>
          </View>

          <Pressable onPress={() => router.push('/annonces/new')}>
            <View className="h-14 flex-row items-center rounded-full border border-olive-900 bg-white px-6">
              <Text className="font-sans text-base text-olive-600">¿Qué necesitas hoy?</Text>
            </View>
          </Pressable>
        </View>

        <CategoryRail onSelect={handleSelectCategory} />

        {!annoncesQuery.isLoading && annonces.length === 0 ? (
          <Text className="px-6 font-sans text-base text-olive-600">
            No hay anuncios abiertos por ahora.
          </Text>
        ) : (
          <>
            <FeedSection
              title="Para ti"
              annonces={forYou}
              posterById={posterById}
              myLocation={myLocation}
            />
            <FeedSection
              title="Cerca de ti"
              annonces={nearYou}
              posterById={posterById}
              myLocation={myLocation}
            />
            <FeedSection
              title="Recientes"
              annonces={recent}
              posterById={posterById}
              myLocation={myLocation}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedSection({
  title,
  annonces,
  posterById,
  myLocation,
}: {
  title: string;
  annonces: Annonce[];
  posterById: Map<string, Profile>;
  myLocation: Coordinates | null;
}) {
  if (annonces.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="px-6 font-sans-bold text-lg text-ink-900">{title}</Text>
      <View className="gap-3 px-6">
        {annonces.map((annonce) => (
          <AnnonceFeedCard
            key={annonce.id}
            annonce={annonce}
            poster={posterById.get(annonce.posterId)}
            myLocation={myLocation}
          />
        ))}
      </View>
    </View>
  );
}

function AnnonceFeedCard({
  annonce,
  poster,
  myLocation,
}: {
  annonce: Annonce;
  poster: Profile | undefined;
  myLocation: Coordinates | null;
}) {
  return (
    <Pressable onPress={() => router.push(`/annonces/${annonce.id}`)}>
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <Avatar
            src={poster?.avatarUrl}
            initials={poster ? displayNameFor(poster).charAt(0).toUpperCase() || '?' : '?'}
            size={36}
          />
          <Text className="flex-1 font-sans-semibold text-sm text-ink-900">
            {poster ? displayNameFor(poster) : 'Cargando…'}
          </Text>
          <Badge tone="neutral">{JOB_CATEGORY_LABELS[annonce.category]}</Badge>
        </View>

        <View className="gap-1">
          <Text className="font-sans-semibold text-base text-ink-900">{annonce.title}</Text>
          <Text numberOfLines={2} className="font-sans text-sm text-olive-700">
            {annonce.description}
          </Text>
        </View>

        {myLocation ? (
          <Text className="font-sans text-xs text-olive-600">
            {distanceKm(myLocation, annonce.location).toFixed(1)} km
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}
