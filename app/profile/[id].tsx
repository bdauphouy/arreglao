import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { AppleMaps } from 'expo-maps';
import { Image, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { displayNameFor, getProfile } from '../../src/api/profiles';
import { JOB_CATEGORY_LABELS } from '../../src/lib/job-categories';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const profileQuery = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id),
    enabled: !!id,
  });

  if (!profileQuery.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="font-sans text-base text-olive-600">
          {profileQuery.isError ? 'No se pudo cargar este perfil.' : 'Cargando…'}
        </Text>
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;
  const displayName = displayNameFor(profile);

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-6">
        <View className="items-center gap-3">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-olive-200 bg-white">
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} className="h-24 w-24" />
            ) : (
              <Text className="font-sans-extrabold text-2xl text-olive-400">
                {displayName.charAt(0).toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <Text className="font-sans-extrabold text-xl text-ink-900">
            {displayName || 'Sin nombre'}
          </Text>
          {profile.averageRating != null ? (
            <Text className="font-sans text-sm text-olive-600">
              Calificación: {profile.averageRating.toFixed(1)}
            </Text>
          ) : null}
        </View>

        {profile.bio ? (
          <Text className="font-sans text-base text-olive-700">{profile.bio}</Text>
        ) : null}

        {profile.categoryTags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {profile.categoryTags.map((category) => (
              <View
                key={category}
                className="rounded-full border border-olive-200 bg-white px-4 py-2"
              >
                <Text className="font-sans-medium text-sm text-olive-700">
                  {JOB_CATEGORY_LABELS[category]}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {profile.location && Platform.OS === 'ios' ? (
          <View className="gap-3">
            <Text className="font-sans-semibold text-sm text-olive-700">Ubicación</Text>
            <View className="h-40 overflow-hidden rounded-md border border-olive-200">
              <AppleMaps.View
                style={{ flex: 1 }}
                cameraPosition={{
                  coordinates: { latitude: profile.location.lat, longitude: profile.location.lng },
                  zoom: 12,
                }}
                markers={[
                  {
                    coordinates: {
                      latitude: profile.location.lat,
                      longitude: profile.location.lng,
                    },
                  },
                ]}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
