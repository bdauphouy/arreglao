import { Star } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';

import type { Review } from '../api/reviews';
import { relativeTimeFromNow } from '../lib/relative-time';
import { Avatar } from './avatar';
import { Card } from './card';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="w-72 gap-3">
      <View className="flex-row items-center gap-3">
        <Avatar
          src={review.reviewerAvatarUrl}
          initials={review.reviewerName.charAt(0).toUpperCase() || '?'}
          size={40}
        />
        <View className="flex-1">
          <Text numberOfLines={1} className="font-sans-semibold text-sm text-ink-900">
            {review.reviewerName}
          </Text>
          {review.reviewerLocationLabel ? (
            <Text className="font-sans text-xs text-olive-600">{review.reviewerLocationLabel}</Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
        <View className="flex-row gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={14}
              color="#14170F"
              fill={index < review.rating ? '#14170F' : 'transparent'}
            />
          ))}
        </View>
        <Text className="font-sans text-xs text-olive-600">
          {relativeTimeFromNow(review.createdAt)}
        </Text>
      </View>

      <Text numberOfLines={4} className="font-sans text-sm text-olive-700">
        {review.comment}
      </Text>

      {review.photoUrl ? (
        <Image
          source={{ uri: review.photoUrl }}
          className="h-32 w-full rounded-md"
          resizeMode="cover"
        />
      ) : null}

      {review.serviceLabel ? (
        <Text className="font-sans text-xs text-olive-500">{review.serviceLabel}</Text>
      ) : null}
    </Card>
  );
}
