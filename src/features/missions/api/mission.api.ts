import { getSupabaseClient, hasSupabase } from '../../../shared/lib/supabase';
import localMissions from '../../../data/missions.local.json';
import { Mission, MissionInput } from '../model/mission.types';

export type MissionsResponse = {
  missions: Mission[];
  offline: boolean;
};

const readLocalMissions = () => (localMissions as Mission[]).map((mission) => ({ ...mission }));

export const fetchMissions = async (tag?: string): Promise<MissionsResponse> => {
  let offline = false;
  let missions: Mission[] = [];

  if (!hasSupabase) {
    offline = true;
    missions = readLocalMissions();
  } else {
    const supabase = getSupabaseClient();
    if (!supabase) {
      offline = true;
      missions = readLocalMissions();
    } else {
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          throw error;
        }
        missions = (data ?? []) as Mission[];
      } catch (error) {
        console.warn('Errore fetch missions, fallback locale', error);
        offline = true;
        missions = readLocalMissions();
      }
    }
  }

  const filtered = tag ? missions.filter((mission) => mission.tags?.includes(tag)) : missions;
  return { missions: filtered, offline };
};

export const createMission = async (
  payload: MissionInput,
  ownerDeviceId: string,
): Promise<Mission> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const error = new Error('SUPABASE_UNAVAILABLE');
    (error as Error & { code?: string }).code = 'SUPABASE_UNAVAILABLE';
    throw error;
  }

  const { data, error } = await supabase
    .from('missions')
    .insert({
      owner_device_id: ownerDeviceId,
      title: payload.title,
      description: payload.description,
      reward: payload.reward,
      location: payload.location,
      date: payload.date,
      tags: payload.tags ?? [],
      contact_visible: payload.contact_visible,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Mission;
};

export const fetchMyMissions = async (ownerDeviceId: string): Promise<Mission[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('owner_device_id', ownerDeviceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as Mission[];
  } catch (error) {
    console.warn('Errore fetch missioni personali', error);
    return [];
  }
};
