import { decode } from 'base64-arraybuffer';

import { supabase } from '../lib/supabase';
import type { JobCategory } from '../schemas/job-category';

export type Profile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: { lat: number; lng: number } | null;
  addressLabel: string | null;
  categoryTags: JobCategory[];
  averageRating: number | null;
  reviewCount: number;
  isTopProvider: boolean;
  experienceYears: number | null;
  certification: string | null;
  equipmentTags: string[];
  commitmentTags: string[];
  serviceRadiusKm: number | null;
  identityVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
};

export function displayNameFor(profile: Profile): string {
  return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
}

const PROFILE_COLUMNS =
  'id, email, first_name, last_name, avatar_url, bio, location_lat, location_lng, address_label, category_tags, average_rating, review_count, is_top_provider, experience_years, certification, equipment_tags, commitment_tags, service_radius_km, identity_verified, phone_verified, created_at';

function toProfile(row: {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address_label: string | null;
  category_tags: JobCategory[] | null;
  average_rating: number | null;
  review_count: number;
  is_top_provider: boolean;
  experience_years: number | null;
  certification: string | null;
  equipment_tags: string[] | null;
  commitment_tags: string[] | null;
  service_radius_km: number | null;
  identity_verified: boolean;
  phone_verified: boolean;
  created_at: string;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    location:
      row.location_lat != null && row.location_lng != null
        ? { lat: row.location_lat, lng: row.location_lng }
        : null,
    addressLabel: row.address_label,
    categoryTags: row.category_tags ?? [],
    averageRating: row.average_rating,
    reviewCount: row.review_count,
    isTopProvider: row.is_top_provider,
    experienceYears: row.experience_years,
    certification: row.certification,
    equipmentTags: row.equipment_tags ?? [],
    commitmentTags: row.commitment_tags ?? [],
    serviceRadiusKm: row.service_radius_km,
    identityVerified: row.identity_verified,
    phoneVerified: row.phone_verified,
    createdAt: row.created_at,
  };
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();
  if (error) {
    throw error;
  }
  return toProfile(data);
}

export async function getProfiles(userIds: string[]): Promise<Profile[]> {
  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).in('id', userIds);
  if (error) {
    throw error;
  }
  return data.map(toProfile);
}

export async function listHelpers(excludeUserId?: string): Promise<Profile[]> {
  let query = supabase.from('profiles').select(PROFILE_COLUMNS);
  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data.map(toProfile).filter((profile) => profile.categoryTags.length > 0);
}

export async function updateProfileName(
  userId: string,
  input: { firstName: string; lastName: string },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ first_name: input.firstName, last_name: input.lastName })
    .eq('id', userId);
  if (error) {
    throw error;
  }
}

export type ProfileDetailsUpdate = {
  firstName: string;
  lastName: string;
  bio: string;
  categoryTags: JobCategory[];
  location: { lat: number; lng: number } | null;
  addressLabel: string | null;
};

export async function updateProfileDetails(
  userId: string,
  input: ProfileDetailsUpdate,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      bio: input.bio,
      category_tags: input.categoryTags,
      location_lat: input.location?.lat ?? null,
      location_lng: input.location?.lng ?? null,
      address_label: input.addressLabel,
    })
    .eq('id', userId);
  if (error) {
    throw error;
  }
}

export async function registerPushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  if (error) {
    throw error;
  }
}

export async function clearPushToken(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ push_token: null }).eq('id', userId);
  if (error) {
    throw error;
  }
}

export async function uploadAvatar(userId: string, base64: string): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, decode(base64), { contentType: 'image/jpeg', upsert: true });
  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);
  if (updateError) {
    throw updateError;
  }

  return publicUrl;
}
