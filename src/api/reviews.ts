import { supabase } from '../lib/supabase';

export type Review = {
  id: string;
  profileId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  relationshipRating: number | null;
  punctualityRating: number | null;
  comment: string;
  serviceLabel: string | null;
  photoUrl: string | null;
  isRepeatCustomer: boolean;
  reviewerLocationLabel: string | null;
  createdAt: string;
};

export type ReviewStats = {
  averageRating: number | null;
  reviewCount: number;
  starCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  relationshipPercent: number | null;
  punctualityPercent: number | null;
};

const REVIEW_COLUMNS =
  'id, profile_id, reviewer_id, rating, relationship_rating, punctuality_rating, comment, service_label, photo_url, is_repeat_customer, reviewer_location_label, created_at, reviewer:profiles!reviews_reviewer_id_fkey(first_name, last_name, avatar_url)';

type ReviewRow = {
  id: string;
  profile_id: string;
  reviewer_id: string;
  rating: number;
  relationship_rating: number | null;
  punctuality_rating: number | null;
  comment: string;
  service_label: string | null;
  photo_url: string | null;
  is_repeat_customer: boolean;
  reviewer_location_label: string | null;
  created_at: string;
  reviewer: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

function toReview(row: ReviewRow): Review {
  const reviewerName = `${row.reviewer?.first_name ?? ''} ${row.reviewer?.last_name ?? ''}`.trim();

  return {
    id: row.id,
    profileId: row.profile_id,
    reviewerId: row.reviewer_id,
    reviewerName: reviewerName || 'Usuario',
    reviewerAvatarUrl: row.reviewer?.avatar_url ?? null,
    rating: row.rating,
    relationshipRating: row.relationship_rating,
    punctualityRating: row.punctuality_rating,
    comment: row.comment,
    serviceLabel: row.service_label,
    photoUrl: row.photo_url,
    isRepeatCustomer: row.is_repeat_customer,
    reviewerLocationLabel: row.reviewer_location_label,
    createdAt: row.created_at,
  };
}

export async function listReviewsForProfile(profileId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return (data as unknown as ReviewRow[]).map(toReview);
}

export function computeReviewStats(reviews: Review[]): ReviewStats {
  const starCounts: ReviewStats['starCounts'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  let relationshipSum = 0;
  let relationshipCount = 0;
  let punctualitySum = 0;
  let punctualityCount = 0;

  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    starCounts[star] += 1;
    ratingSum += review.rating;

    if (review.relationshipRating != null) {
      relationshipSum += review.relationshipRating;
      relationshipCount += 1;
    }
    if (review.punctualityRating != null) {
      punctualitySum += review.punctualityRating;
      punctualityCount += 1;
    }
  }

  return {
    averageRating: reviews.length > 0 ? ratingSum / reviews.length : null,
    reviewCount: reviews.length,
    starCounts,
    relationshipPercent:
      relationshipCount > 0 ? Math.round((relationshipSum / relationshipCount / 5) * 100) : null,
    punctualityPercent:
      punctualityCount > 0 ? Math.round((punctualitySum / punctualityCount / 5) * 100) : null,
  };
}
