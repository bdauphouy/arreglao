import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import type { Profile } from '../api/profiles';
import { displayNameFor } from '../api/profiles';
import { distanceKm } from '../lib/distance';
import type { Coordinates } from '../lib/distance';
import { Avatar } from './avatar';
import { Card } from './card';

type ProfileSliderProps = {
  title: string;
  profiles: Profile[];
  myLocation?: Coordinates | null;
  onSeeAll?: () => void;
};

export function ProfileSlider({ title, profiles, myLocation, onSeeAll }: ProfileSliderProps) {
  if (profiles.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between px-6">
        <Text className="font-sans-bold text-lg text-ink-900">{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll}>
            <Text className="font-sans-semibold text-sm text-olive-600">Ver todos</Text>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        horizontal
        data={profiles}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-6"
        renderItem={({ item }) => {
          const name = displayNameFor(item);
          return (
            <Pressable onPress={() => router.push(`/profile/${item.id}`)}>
              <Card className="w-44 items-center gap-2">
                <Avatar
                  src={item.avatarUrl}
                  initials={name.charAt(0).toUpperCase() || '?'}
                  size={56}
                />
                <Text numberOfLines={1} className="font-sans-semibold text-sm text-ink-900">
                  {name}
                </Text>
                <Text className="font-sans text-xs text-olive-600">
                  {item.averageRating != null
                    ? `★ ${item.averageRating.toFixed(1)}`
                    : 'Sin reseñas'}
                  {myLocation && item.location
                    ? ` · ${distanceKm(myLocation, item.location).toFixed(1)} km`
                    : ''}
                </Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
