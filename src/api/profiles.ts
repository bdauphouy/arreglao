import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, avatar_url')
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
    avatarUrl: data.avatar_url,
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
