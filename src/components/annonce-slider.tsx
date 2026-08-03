import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import type { Annonce } from '../api/annonces';
import { distanceKm } from '../lib/distance';
import type { Coordinates } from '../lib/distance';
import { JOB_CATEGORY_LABELS } from '../lib/job-categories';
import { Card } from './card';

type AnnonceSliderProps = {
  title: string;
  annonces: Annonce[];
  myLocation?: Coordinates | null;
};

export function AnnonceSlider({ title, annonces, myLocation }: AnnonceSliderProps) {
  if (annonces.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="px-6 font-sans-bold text-lg text-ink-900">{title}</Text>
      <FlatList
        horizontal
        data={annonces}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-6"
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/annonces/${item.id}`)}>
            <Card className="w-64 gap-1">
              <Text numberOfLines={1} className="font-sans-semibold text-base text-ink-900">
                {item.title}
              </Text>
              <Text className="font-sans text-sm text-olive-600">
                {JOB_CATEGORY_LABELS[item.category]}
                {myLocation ? ` · ${distanceKm(myLocation, item.location).toFixed(1)} km` : ''}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
