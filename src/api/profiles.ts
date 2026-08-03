import { decode } from 'base64-arraybuffer';

import { supabase } from '../lib/supabase';
import type { JobCategory } from '../schemas/profile';

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

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, first_name, last_name, display_name, avatar_url, bio, location_lat, location_lng, category_tags, average_rating',
    )
    .eq('id', userId)
    .single();
  if (error) {
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    location:
      data.location_lat != null && data.location_lng != null
        ? { lat: data.location_lat, lng: data.location_lng }
        : null,
    categoryTags: data.category_tags ?? [],
    averageRating: data.average_rating,
  };
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
