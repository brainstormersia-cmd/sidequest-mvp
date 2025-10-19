import { getSupabaseClient } from '../../../shared/lib/supabase';
import { Application, ApplicationInput } from '../model/application.types';

const supabaseUnavailableError = () => {
  const error = new Error('SUPABASE_UNAVAILABLE');
  (error as Error & { code?: string }).code = 'SUPABASE_UNAVAILABLE';
  return error;
};

export const createApplication = async (input: ApplicationInput): Promise<Application> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw supabaseUnavailableError();
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      mission_id: input.mission_id,
      applicant_device_id: input.applicant_device_id,
      applicant_name: input.applicant_name,
      applicant_contact: input.applicant_contact,
      note: input.note,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Application;
};

export const fetchMyApplications = async (deviceId: string): Promise<Application[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('applicant_device_id', deviceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Application[];
  } catch (error) {
    console.warn('Errore fetch candidature personali', error);
    return [];
  }
};
