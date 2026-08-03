import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { getCurrentUserId } from '../src/api/auth';
import { getProfile } from '../src/api/profiles';
import { Button } from '../src/components/button';
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
          <Button variant="outline" onPress={() => router.push('/profile')}>
            Mi perfil
          </Button>
          <Button variant="outline" onPress={() => router.push('/annonces')}>
            Ver anuncios
          </Button>
          <Button variant="outline" onPress={() => router.push('/annonces/new')}>
            Publicar anuncio
          </Button>
        </>
      ) : null}
      <Button onPress={start}>Comenzar</Button>
    </View>
  );
}
