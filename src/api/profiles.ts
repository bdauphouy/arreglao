import { decode } from 'base64-arraybuffer';

import { supabase } from '../lib/supabase';
import type { JobCategory } from '../schemas/job-category';

export type { JobCategory };

export type Profile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: { lat: number; lng: number } | null;
  categoryTags: JobCategory[];
  averageRating: number | null;
};

export function displayNameFor(profile: Profile): string {
  return profile.displayName ?? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
}

const PROFILE_COLUMNS =
  'id, email, first_name, last_name, display_name, avatar_url, bio, location_lat, location_lng, category_tags, average_rating';

function toProfile(row: {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location_lat: number | null;
  location_lng: number | null;
  category_tags: JobCategory[] | null;
  average_rating: number | null;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    location:
      row.location_lat != null && row.location_lng != null
        ? { lat: row.location_lat, lng: row.location_lng }
        : null,
    categoryTags: row.category_tags ?? [],
    averageRating: row.average_rating,
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

export async function listHelpers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS);
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
  displayName: string;
  bio: string;
  categoryTags: JobCategory[];
  location: { lat: number; lng: number } | null;
};

export async function updateProfileDetails(
  userId: string,
  input: ProfileDetailsUpdate,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName,
      bio: input.bio,
      category_tags: input.categoryTags,
      location_lat: input.location?.lat ?? null,
      location_lng: input.location?.lng ?? null,
    })
    .eq('id', userId);
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
