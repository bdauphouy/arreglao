import { supabase } from '../lib/supabase';
import { getAnnonce } from './annonces';
import { notifyPush } from './push-notifications';

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

  // Best-effort: must never turn a successful save into a failed one.
  notifyAnnonceSaved(userId, annonceId).catch((error) =>
    console.warn('notifyAnnonceSaved failed', error),
  );
}

async function notifyAnnonceSaved(userId: string, annonceId: string): Promise<void> {
  const annonce = await getAnnonce(annonceId);
  if (annonce.posterId === userId) {
    return;
  }
  await notifyPush(annonce.posterId, {
    type: 'annonce_saved',
    annonceId,
    annonceTitle: annonce.title,
  });
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
