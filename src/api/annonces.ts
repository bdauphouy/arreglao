import { supabase } from '../lib/supabase';
import type { AnnonceStatus } from '../lib/annonce-status';
import type { Coordinates } from '../lib/distance';
import type { AnnonceCreateInput } from '../schemas/annonce';

export type Annonce = {
  id: string;
  posterId: string;
  title: string;
  description: string;
  category: string;
  location: Coordinates;
  budgetMin: number | null;
  budgetMax: number | null;
  applicationsCount: number;
  status: AnnonceStatus;
  chosenHelperId: string | null;
  createdAt: string;
};

const ANNONCE_COLUMNS =
  'id, poster_id, title, description, category, location_lat, location_lng, budget_min, budget_max, applications_count, status, chosen_helper_id, created_at';

function toAnnonce(row: {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  category: string;
  location_lat: number;
  location_lng: number;
  budget_min: number | null;
  budget_max: number | null;
  applications_count: number;
  status: AnnonceStatus;
  chosen_helper_id: string | null;
  created_at: string;
}): Annonce {
  return {
    id: row.id,
    posterId: row.poster_id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: { lat: row.location_lat, lng: row.location_lng },
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    applicationsCount: row.applications_count,
    status: row.status,
    chosenHelperId: row.chosen_helper_id,
    createdAt: row.created_at,
  };
}

export async function createAnnonce(
  posterId: string,
  input: AnnonceCreateInput,
  location: Coordinates,
): Promise<Annonce> {
  const { data, error } = await supabase
    .from('annonces')
    .insert({
      poster_id: posterId,
      title: input.title,
      description: input.description,
      category: input.category,
      location_lat: location.lat,
      location_lng: location.lng,
      budget_min: input.budgetMin,
      budget_max: input.budgetMax,
    })
    .select(ANNONCE_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toAnnonce(data);
}

export async function listOpenAnnonces(filter?: { category?: string }): Promise<Annonce[]> {
  let query = supabase.from('annonces').select(ANNONCE_COLUMNS).eq('status', 'open');
  if (filter?.category) {
    query = query.eq('category', filter.category);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(toAnnonce);
}

export async function getAnnonces(ids: string[]): Promise<Annonce[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from('annonces').select(ANNONCE_COLUMNS).in('id', ids);
  if (error) {
    throw error;
  }
  return data.map(toAnnonce);
}

export async function getAnnonce(id: string): Promise<Annonce> {
  const { data, error } = await supabase
    .from('annonces')
    .select(ANNONCE_COLUMNS)
    .eq('id', id)
    .single();
  if (error) {
    throw error;
  }
  return toAnnonce(data);
}

export async function assignAnnonce(id: string, helperId: string): Promise<void> {
  const { error } = await supabase
    .from('annonces')
    .update({ status: 'assigned', chosen_helper_id: helperId })
    .eq('id', id);
  if (error) {
    throw error;
  }
}

export async function cancelAnnonce(id: string): Promise<void> {
  const { error } = await supabase
    .from('annonces')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .in('status', ['open', 'in_review']);
  if (error) {
    throw error;
  }
}
