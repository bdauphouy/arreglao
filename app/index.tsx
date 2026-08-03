import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { getProfile } from '../src/api/profiles';
import { supabase } from '../src/lib/supabase';
import { useAppStore } from '../src/stores/app-store';

export default function Index() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  // Temporary: proves the profile-details step actually persisted data.
  // Remove once there's a real home/profile screen to show this instead.
  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }
      return getProfile(user.id);
    },
  });

  const start = () => {
    router.push(hasCompletedOnboarding ? '/(auth)/sign-in' : '/(onboarding)/welcome');
  };

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-sand">
      <Text className="font-sans-extrabold text-xl text-ink-900">Arreglao</Text>
      {profileQuery.data ? (
        <View className="items-center gap-1">
          <Text className="font-sans-medium text-base text-ink-900">
            {profileQuery.data.firstName} {profileQuery.data.lastName}
          </Text>
          <Text className="font-sans text-sm text-olive-600">{profileQuery.data.email}</Text>
        </View>
      ) : null}
      <Pressable
        className="rounded-full bg-accent px-6 py-3 active:bg-accent-active"
        onPress={start}
      >
        <Text className="font-sans-semibold text-ink-900">Comenzar</Text>
      </Pressable>
    </View>
  );
}
