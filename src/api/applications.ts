import { supabase } from '../lib/supabase';

export type Application = {
  id: string;
  annonceId: string;
  applicantId: string;
  message: string;
  createdAt: string;
};

const APPLICATION_COLUMNS = 'id, annonce_id, applicant_id, message, created_at';

function toApplication(row: {
  id: string;
  annonce_id: string;
  applicant_id: string;
  message: string;
  created_at: string;
}): Application {
  return {
    id: row.id,
    annonceId: row.annonce_id,
    applicantId: row.applicant_id,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function applyToAnnonce(
  annonceId: string,
  applicantId: string,
  message: string,
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({ annonce_id: annonceId, applicant_id: applicantId, message })
    .select(APPLICATION_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toApplication(data);
}

export async function listApplicationsForAnnonce(annonceId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_COLUMNS)
    .eq('annonce_id', annonceId)
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return data.map(toApplication);
}

export async function hasApplied(annonceId: string, applicantId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('annonce_id', annonceId)
    .eq('applicant_id', applicantId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data != null;
}
