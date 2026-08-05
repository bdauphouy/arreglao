import { Clock, Star, Users } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { ReviewStats } from '../api/reviews';

type RatingBreakdownProps = {
  stats: ReviewStats;
};

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

export function RatingBreakdown({ stats }: RatingBreakdownProps) {
  const total = stats.reviewCount;

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Star size={20} color="#14170F" fill="#14170F" />
        <Text className="font-sans-extrabold text-xl text-ink-900">
          {stats.averageRating != null ? stats.averageRating.toFixed(2) : '—'}
        </Text>
        <Text className="font-sans text-base text-olive-600">
          ({total} {total === 1 ? 'valoración' : 'valoraciones'})
        </Text>
      </View>

      <View className="flex-row gap-6">
        <View className="flex-1 gap-2">
          {STAR_ROWS.map((star) => {
            const count = stats.starCounts[star];
            const ratio = total > 0 ? count / total : 0;
            return (
              <View key={star} className="flex-row items-center gap-2">
                <Text className="w-4 font-sans text-xs text-olive-600">{star}★</Text>
                <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-olive-100">
                  <View
                    className="h-full rounded-full bg-ink-900"
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View className="gap-3">
          {stats.relationshipPercent != null ? (
            <View className="items-center gap-1">
              <Users size={18} color="#14170F" />
              <Text className="font-sans-bold text-base text-ink-900">
                {stats.relationshipPercent}%
              </Text>
              <Text className="font-sans text-xs text-olive-600">Relación</Text>
            </View>
          ) : null}
          {stats.punctualityPercent != null ? (
            <View className="items-center gap-1">
              <Clock size={18} color="#14170F" />
              <Text className="font-sans-bold text-base text-ink-900">
                {stats.punctualityPercent}%
              </Text>
              <Text className="font-sans text-xs text-olive-600">Puntualidad</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
