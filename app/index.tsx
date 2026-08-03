import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { getCurrentUserId } from '../src/api/auth';
import { getProfile } from '../src/api/profiles';
import { useAppStore } from '../src/stores/app-store';

export default function Index() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        return null;
      }
      return getProfile(userId);
    },
  });

  const start = () => {
    router.push(hasCompletedOnboarding ? '/(auth)/sign-in' : '/(onboarding)/welcome');
  };

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-sand">
      <Text className="font-sans-extrabold text-xl text-ink-900">Arreglao</Text>
      {profileQuery.data ? (
        <>
          <Pressable
            className="rounded-full bg-white px-6 py-3"
            onPress={() => router.push('/profile')}
          >
            <Text className="font-sans-semibold text-ink-900">Mi perfil</Text>
          </Pressable>
          <Pressable
            className="rounded-full bg-white px-6 py-3"
            onPress={() => router.push('/annonces')}
          >
            <Text className="font-sans-semibold text-ink-900">Ver anuncios</Text>
          </Pressable>
          <Pressable
            className="rounded-full bg-white px-6 py-3"
            onPress={() => router.push('/annonces/new')}
          >
            <Text className="font-sans-semibold text-ink-900">Publicar anuncio</Text>
          </Pressable>
        </>
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
