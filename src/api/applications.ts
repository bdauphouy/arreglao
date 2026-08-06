import { supabase } from '../lib/supabase';
import type { ApplicationStatus } from '../lib/application-status';

export type Application = {
  id: string;
  annonceId: string;
  applicantId: string;
  message: string;
  proposedPrice: number;
  status: ApplicationStatus;
  createdAt: string;
};

const APPLICATION_COLUMNS =
  'id, annonce_id, applicant_id, message, proposed_price, status, created_at';

function toApplication(row: {
  id: string;
  annonce_id: string;
  applicant_id: string;
  message: string;
  proposed_price: number;
  status: ApplicationStatus;
  created_at: string;
}): Application {
  return {
    id: row.id,
    annonceId: row.annonce_id,
    applicantId: row.applicant_id,
    message: row.message,
    proposedPrice: row.proposed_price,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function applyToAnnonce(
  annonceId: string,
  applicantId: string,
  message: string,
  proposedPrice: number,
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({ annonce_id: annonceId, applicant_id: applicantId, message, proposed_price: proposedPrice })
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

export async function listApplicationsForApplicant(applicantId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_COLUMNS)
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(toApplication);
}

export async function getApplication(
  annonceId: string,
  applicantId: string,
): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_COLUMNS)
    .eq('annonce_id', annonceId)
    .eq('applicant_id', applicantId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data ? toApplication(data) : null;
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

// The applicant backing out of an application they're not ready to follow
// through on. If this was the poster's chosen helper, reopen_annonce_on_-
// chosen_withdrawal() (see the application-status-lifecycle migration)
// reopens the annonce for review as a side effect.
export async function withdrawApplication(applicationId: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ status: 'withdrawn' })
    .eq('id', applicationId)
    .in('status', ['pending', 'accepted']);
  if (error) {
    throw error;
  }
}
