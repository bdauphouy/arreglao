import { supabase } from '../lib/supabase';

export async function listSavedAnnonceIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_annonces')
    .select('annonce_id')
    .eq('user_id', userId);
  if (error) {
    throw error;
  }
  return data.map((row) => row.annonce_id);
}

export async function saveAnnonce(userId: string, annonceId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_annonces')
    .insert({ user_id: userId, annonce_id: annonceId });
  if (error) {
    throw error;
  }
}

export async function unsaveAnnonce(userId: string, annonceId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_annonces')
    .delete()
    .eq('user_id', userId)
    .eq('annonce_id', annonceId);
  if (error) {
    throw error;
  }
}
