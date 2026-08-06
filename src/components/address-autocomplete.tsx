import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { LocateFixed } from 'lucide-react-native';

export type Address = { lat: number; lng: number; label: string };

type AddressAutocompleteProps = {
  value: Address | null;
  onChange: (value: Address) => void;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
// Required by Nominatim's usage policy — identifies the app to their free
// public instance instead of an anonymous client.
const NOMINATIM_HEADERS = { 'User-Agent': 'arreglao-app (bdauphouy@gmail.com)' };
// Greater San Pedro Sula bounding box (lon min, lat min, lon max, lat max) —
// biases (doesn't exclude) results toward the metro area, where most of our
// users are, without narrowing the search away from the rest of Honduras.
const SAN_PEDRO_SULA_VIEWBOX = '-88.08,15.42,-87.92,15.58';

export function AddressAutocomplete({ value, onChange }: AddressAutocompleteProps) {
  // Lazy-initialized once from the incoming address — this component is
  // remounted (via a `key`) whenever the underlying profile changes, so
  // there's no need to re-sync `query` from `value` on every prop change,
  // which avoids a setState-in-effect (see react-hooks/set-state-in-effect).
  const [query, setQuery] = useState(() => value?.label ?? '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchIsTooShort = query.trim().length < 3 || query === value?.label;
  const visibleResults = searchIsTooShort ? [] : results;

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchIsTooShort) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          format: 'json',
          addressdetails: '1',
          limit: '8',
          countrycodes: 'hn',
          viewbox: SAN_PEDRO_SULA_VIEWBOX,
          q: query,
        });
        const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
          headers: NOMINATIM_HEADERS,
        });
        const data: NominatimResult[] = await response.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSelect = (result: NominatimResult) => {
    setQuery(result.display_name);
    setResults([]);
    setOpen(false);
    onChange({ lat: Number(result.lat), lng: Number(result.lon), label: result.display_name });
  };

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación',
          'Activa el acceso a tu ubicación para usar esta opción.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;

      const params = new URLSearchParams({
        format: 'json',
        addressdetails: '1',
        lat: String(latitude),
        lon: String(longitude),
      });
      const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
        headers: NOMINATIM_HEADERS,
      });
      const result: NominatimResult = await response.json();
      const label = result?.display_name ?? `${latitude}, ${longitude}`;

      setQuery(label);
      setResults([]);
      setOpen(false);
      onChange({ lat: latitude, lng: longitude, label });
    } catch {
      Alert.alert('No se pudo obtener tu ubicación', 'Inténtalo de nuevo.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View className="gap-2">
      <View className="h-14 flex-row items-center rounded-full border border-olive-200 bg-white px-6">
        <TextInput
          placeholderTextColor="#9C9877"
          placeholder="Escribe tu dirección en Honduras"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 font-sans p-0 text-base leading-tight text-ink-900"
        />
        {loading ? <ActivityIndicator size="small" color="#5E5C49" /> : null}
      </View>

      <Pressable
        onPress={handleLocate}
        disabled={locating}
        className="flex-row items-center gap-2 self-start px-1 py-1 active:opacity-60"
      >
        {locating ? (
          <ActivityIndicator size="small" color="#5E5C49" />
        ) : (
          <LocateFixed size={16} color="#5E5C49" />
        )}
        <Text className="font-sans-medium text-sm text-olive-600">Usar mi ubicación actual</Text>
      </Pressable>

      {open && visibleResults.length > 0 ? (
        <View className="gap-1 rounded-md border border-olive-200 bg-white p-2">
          {visibleResults.map((result, index) => (
            <Pressable
              key={index}
              onPress={() => handleSelect(result)}
              className="rounded-sm px-3 py-2 active:bg-olive-50"
            >
              <Text className="font-sans text-sm text-ink-900">{result.display_name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
