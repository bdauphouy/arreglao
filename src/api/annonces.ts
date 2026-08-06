import { supabase } from '../lib/supabase';
import type { AnnonceStatus } from '../lib/annonce-status';
import type { Coordinates } from '../lib/distance';
import type { AnnonceCreateInput } from '../schemas/annonce';
import type { JobCategory } from '../schemas/job-category';
import { getOrCreateConversation } from './conversations';
import { notifyPush } from './push-notifications';

export type Annonce = {
  id: string;
  posterId: string;
  title: string;
  description: string;
  category: JobCategory;
  location: Coordinates;
  budget: number | null;
  applicationsCount: number;
  status: AnnonceStatus;
  chosenHelperId: string | null;
  createdAt: string;
};

const ANNONCE_COLUMNS =
  'id, poster_id, title, description, category, location_lat, location_lng, budget, applications_count, status, chosen_helper_id, created_at';

function toAnnonce(row: {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  category: JobCategory;
  location_lat: number;
  location_lng: number;
  budget: number | null;
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
    budget: row.budget,
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
      budget: input.budget,
    })
    .select(ANNONCE_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toAnnonce(data);
}

export async function listOpenAnnonces(filter?: { category?: JobCategory }): Promise<Annonce[]> {
  // 'in_review' is entered automatically as soon as the first application
  // comes in (see advance_annonce_on_application in the applications
  // migration) — it still accepts further applications until the poster
  // assigns or cancels, so it belongs in the open feed alongside 'open'.
  // Filtering to just 'open' here made every annonce vanish from other
  // users' feeds after its first applicant (#33).
  let query = supabase
    .from('annonces')
    .select(ANNONCE_COLUMNS)
    .in('status', ['open', 'in_review']);
  if (filter?.category) {
    query = query.eq('category', filter.category);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(toAnnonce);
}

export async function listAnnoncesForPoster(posterId: string): Promise<Annonce[]> {
  const { data, error } = await supabase
    .from('annonces')
    .select(ANNONCE_COLUMNS)
    .eq('poster_id', posterId)
    .order('created_at', { ascending: false });
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
  const { data, error } = await supabase
    .from('annonces')
    .update({ status: 'assigned', chosen_helper_id: helperId })
    .eq('id', id)
    .select(ANNONCE_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  const annonce = toAnnonce(data);

  // Best-effort: must never turn a successful assignment into a failed one.
  notifyApplicationAccepted(annonce, helperId).catch((error) =>
    console.warn('notifyApplicationAccepted failed', error),
  );
}

async function notifyApplicationAccepted(annonce: Annonce, helperId: string): Promise<void> {
  const conversation = await getOrCreateConversation(annonce.id, annonce.posterId, helperId);
  await notifyPush(helperId, {
    type: 'application_accepted',
    annonceId: annonce.id,
    annonceTitle: annonce.title,
    conversationId: conversation.id,
  });
}

// Poster changing their mind after assigning someone: reopens the annonce
// for review and clears the chosen helper. Everyone's application status
// flows back to 'pending' as a side effect (see
// sync_applications_on_annonce_assignment in the application-status-
// lifecycle migration), except anyone who withdrew in the meantime.
export async function unassignAnnonce(id: string): Promise<void> {
  const { error } = await supabase
    .from('annonces')
    .update({ status: 'in_review', chosen_helper_id: null })
    .eq('id', id)
    .eq('status', 'assigned');
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
