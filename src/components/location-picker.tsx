import * as Location from 'expo-location';
import { AppleMaps } from 'expo-maps';
import { Platform, Pressable, Text, View } from 'react-native';

type LocationPickerProps = {
  value: { lat: number; lng: number } | null;
  onChange: (value: { lat: number; lng: number }) => void;
};

// Roughly centers the target market without naming the specific country.
const DEFAULT_CAMERA = { coordinates: { latitude: 15.5, longitude: -88.0 }, zoom: 6 };

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const useMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
  };

  const markers = value ? [{ coordinates: { latitude: value.lat, longitude: value.lng } }] : [];

  return (
    <View className="gap-3">
      <View className="h-56 overflow-hidden rounded-md border border-olive-200">
        {Platform.OS === 'ios' ? (
          <AppleMaps.View
            style={{ flex: 1 }}
            cameraPosition={
              value
                ? { coordinates: { latitude: value.lat, longitude: value.lng }, zoom: 12 }
                : DEFAULT_CAMERA
            }
            markers={markers}
            onMapClick={(event) => {
              const { latitude, longitude } = event.coordinates;
              if (latitude != null && longitude != null) {
                onChange({ lat: latitude, lng: longitude });
              }
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-olive-50 px-6">
            <Text className="font-sans text-center text-sm text-olive-600">
              El mapa todavía no está disponible en Android.
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={useMyLocation}
        className="items-center rounded-full border border-olive-900 bg-white px-6 py-3"
      >
        <Text className="font-sans-semibold text-sm text-ink-900">Usar mi ubicación</Text>
      </Pressable>
    </View>
  );
}
