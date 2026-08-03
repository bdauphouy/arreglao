import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { AppleMaps } from 'expo-maps';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listOpenAnnonces } from '../../src/api/annonces';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';

// Roughly centers the target market without naming the specific country —
// mirrors src/components/location-picker.tsx's default camera.
const DEFAULT_CAMERA = { coordinates: { latitude: 15.5, longitude: -88.0 }, zoom: 6 };

export default function JoblistScreen() {
  const meQuery = useCurrentProfile();
  const myLocation = meQuery.data?.location ?? null;

  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open'],
    queryFn: () => listOpenAnnonces(),
  });

  const annonces = annoncesQuery.data ?? [];

  const markers = annonces.map((annonce) => ({
    id: annonce.id,
    coordinates: { latitude: annonce.location.lat, longitude: annonce.location.lng },
    title: annonce.title,
  }));

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="gap-1 px-6 pb-4 pt-6">
        <Text className="font-sans-extrabold text-2xl text-ink-900">Mapa de trabajos</Text>
        <Text className="font-sans text-sm text-olive-600">
          {annonces.length} anuncios abiertos
        </Text>
      </View>

      {Platform.OS === 'ios' ? (
        <AppleMaps.View
          style={{ flex: 1 }}
          cameraPosition={
            myLocation
              ? { coordinates: { latitude: myLocation.lat, longitude: myLocation.lng }, zoom: 11 }
              : DEFAULT_CAMERA
          }
          markers={markers}
          onMarkerClick={(marker) => {
            if (marker.id) {
              router.push(`/annonces/${marker.id}`);
            }
          }}
        />
      ) : (
        <View className="flex-1 items-center justify-center bg-olive-50 px-6">
          <Text className="text-center font-sans text-sm text-olive-600">
            El mapa todavía no está disponible en Android.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
