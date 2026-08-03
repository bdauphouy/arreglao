import { AppleMaps } from 'expo-maps';
import { Platform, View } from 'react-native';

type LocationPreviewProps = {
  location: { lat: number; lng: number };
  heightClassName?: string;
};

export function LocationPreview({ location, heightClassName = 'h-40' }: LocationPreviewProps) {
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View className={`${heightClassName} overflow-hidden rounded-md border border-olive-200`}>
      <AppleMaps.View
        style={{ flex: 1 }}
        cameraPosition={{
          coordinates: { latitude: location.lat, longitude: location.lng },
          zoom: 12,
        }}
        markers={[{ coordinates: { latitude: location.lat, longitude: location.lng } }]}
      />
    </View>
  );
}
