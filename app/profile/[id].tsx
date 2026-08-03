import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { displayNameFor, getProfile } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import { LocationPreview } from '../../src/components/location-preview';
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
          <Avatar
            src={profile.avatarUrl}
            initials={displayName.charAt(0).toUpperCase() || '?'}
            size={96}
          />
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
              <Badge key={category} tone="neutral">
                {JOB_CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </View>
        ) : null}

        {profile.location ? (
          <View className="gap-3">
            <Text className="font-sans-semibold text-sm text-olive-700">Ubicación</Text>
            <LocationPreview location={profile.location} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
