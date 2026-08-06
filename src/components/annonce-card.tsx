import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { Annonce } from '../api/annonces';
import { displayNameFor, type Profile } from '../api/profiles';
import { distanceKm, type Coordinates } from '../lib/distance';
import { relativeTimeFromNow } from '../lib/relative-time';
import { Avatar } from './avatar';
import { Card } from './card';
import { CategoryBadge } from './category-badge';

type AnnonceCardProps = {
  annonce: Annonce;
  poster: Profile | undefined;
  myLocation: Coordinates | null;
};

export function AnnonceCard({ annonce, poster, myLocation }: AnnonceCardProps) {
  const budgetLabel =
    annonce.budgetMin != null && annonce.budgetMax != null
      ? `L ${annonce.budgetMin} - L ${annonce.budgetMax}`
      : null;

  return (
    <Pressable onPress={() => router.push(`/annonces/${annonce.id}`)}>
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <Avatar
            src={poster?.avatarUrl}
            initials={poster ? displayNameFor(poster).charAt(0).toUpperCase() || '?' : '?'}
            size={36}
          />
          <View className="flex-1">
            <Text className="font-sans-semibold text-sm text-ink-900">
              {poster ? displayNameFor(poster) : 'Cargando…'}
            </Text>
            <Text className="font-sans text-xs text-olive-600">
              {relativeTimeFromNow(annonce.createdAt)}
            </Text>
          </View>
          <CategoryBadge category={annonce.category} />
        </View>

        <View className="gap-1">
          <Text className="font-sans-semibold text-base text-ink-900">{annonce.title}</Text>
          <Text numberOfLines={2} className="font-sans text-sm text-olive-700">
            {annonce.description}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {budgetLabel ? (
            <Text className="font-sans-semibold text-sm text-ink-900">{budgetLabel}</Text>
          ) : null}
          {myLocation ? (
            <Text className="font-sans text-xs text-olive-600">
              {distanceKm(myLocation, annonce.location).toFixed(1)} km
            </Text>
          ) : null}
          <Text className="font-sans text-xs text-olive-600">
            {annonce.applicationsCount}{' '}
            {annonce.applicationsCount === 1 ? 'aplicante' : 'aplicantes'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
