import { useMemo } from 'react';

export type GiverHeaderModel = {
  variant: 'default' | 'geolocated';
  userName: string;
  addressLabel?: string;
  avatarInitials: string;
  role: 'giver' | 'doer';
};

export type ActiveMissionModel = {
  id: string;
  role: 'courier' | 'quester' | 'doer';
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'review' | 'muted';
  etaLabel: string;
  etaSubLabel?: string;
  etaMinutes: number;
  etaTone: 'success' | 'review' | 'warning';
  doerName: string;
  doerSummary: string;
  doerAvatarInitials: string;
  doerRating: number;
  doerCompletedMissions: number;
  progress: number;
  progressLabel: string;
  missionTitle: string;
  missionReward: string;
  missionRoute: string;
  missionNotes?: string;
  roadmap: Array<{
    id: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
};

export type RecentMissionModel = {
  id: string;
  title: string;
  status: 'completed' | 'inProgress' | 'draft';
  amount: string;
  categoryLabel: string;
};

export type StatsModel = {
  published: number;
  completed: number;
  averageTime: string;
};

export type SuggestionModel = {
  id: string;
  copy: string;
};

type CalendarMissionStatus = 'active' | 'draft' | 'scheduled';

type CalendarMissionSummary = {
  id: string;
  status: CalendarMissionStatus;
};

type CalendarSelectorState = {
  selectMissionsByDate: (date: Date) => CalendarMissionSummary[];
  selectActiveMissionByDate: (date: Date) => ActiveMissionModel | null;
};

export type ExampleMissionModel = {
  title: string;
  amount: string;
  duration: string;
};

type BaseGiverState = {
  header: GiverHeaderModel;
};

export type GiverHomeState =
  | (BaseGiverState & {
      kind: 'active';
      activeMission: ActiveMissionModel;
      recentMissions: RecentMissionModel[];
      stats: StatsModel;
      suggestion: SuggestionModel;
    })
  | (BaseGiverState & {
      kind: 'recent';
      recentMissions: RecentMissionModel[];
      stats: StatsModel;
      suggestion: SuggestionModel;
    })
  | (BaseGiverState & {
      kind: 'returning';
      exampleMission: ExampleMissionModel;
      suggestion: SuggestionModel;
    })
  | (BaseGiverState & {
      kind: 'new';
      tips: SuggestionModel[];
    });

type RawHomePayload = {
  header: GiverHeaderModel;
  activeMission?: ActiveMissionModel;
  recentMissions: RecentMissionModel[];
  publishedCount: number;
  completedCount: number;
  averageTime: string;
  hasPublishedBefore: boolean;
  suggestionPool: SuggestionModel[];
  exampleMission: ExampleMissionModel;
};

const buildStateFromPayload = (payload: RawHomePayload): GiverHomeState => {
  const stats: StatsModel = {
    published: payload.publishedCount,
    completed: payload.completedCount,
    averageTime: payload.averageTime,
  };

  if (payload.activeMission) {
    return {
      kind: 'active',
      header: payload.header,
      activeMission: payload.activeMission,
      recentMissions: payload.recentMissions.slice(0, 6),
      stats,
      suggestion: payload.suggestionPool[0],
    };
  }

  if (payload.recentMissions.length > 0) {
    return {
      kind: 'recent',
      header: payload.header,
      recentMissions: payload.recentMissions.slice(0, 12),
      stats,
      suggestion: payload.suggestionPool[1] ?? payload.suggestionPool[0],
    };
  }

  if (payload.hasPublishedBefore) {
    return {
      kind: 'returning',
      header: payload.header,
      exampleMission: payload.exampleMission,
      suggestion: payload.suggestionPool[2] ?? payload.suggestionPool[0],
    };
  }

  return {
    kind: 'new',
    header: payload.header,
    tips: payload.suggestionPool.slice(0, 3),
  };
};

const withCalendarSelectors = <T extends GiverHomeState>(state: T): T & CalendarSelectorState => {
  const today = new Date();
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const calendarDayKey = (date: Date) => startOfDay(date).getTime();
  const createDayFromToday = (offset: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);

  const calendarEntries = new Map<number, CalendarMissionSummary[]>();

  const registerMission = (date: Date, mission: CalendarMissionSummary) => {
    const key = calendarDayKey(date);
    const existing = calendarEntries.get(key);
    if (existing) {
      existing.push(mission);
      return;
    }
    calendarEntries.set(key, [mission]);
  };

  if (state.kind === 'active') {
    registerMission(createDayFromToday(0), {
      id: state.activeMission.id,
      status: 'active',
    });
  }

  if ('recentMissions' in state) {
    const draftMission = state.recentMissions.find((mission) => mission.status === 'draft');
    if (draftMission) {
      registerMission(createDayFromToday(2), {
        id: draftMission.id,
        status: 'draft',
      });
    }

    const scheduledSource = state.recentMissions.find((mission) => mission.status !== 'draft');
    if (scheduledSource) {
      registerMission(createDayFromToday(4), {
        id: scheduledSource.id,
        status: 'scheduled',
      });
    }
  }

  const selectMissionsByDate = (date: Date): CalendarMissionSummary[] => {
    const key = calendarDayKey(date);
    const missions = calendarEntries.get(key);
    return missions ? [...missions] : [];
  };

  const selectActiveMissionByDate = (date: Date): ActiveMissionModel | null => {
    if (state.kind !== 'active') {
      return null;
    }

    const key = calendarDayKey(date);
    const missions = calendarEntries.get(key);
    if (!missions) {
      return null;
    }

    const hasActiveMission = missions.some((mission) => mission.id === state.activeMission.id);
    return hasActiveMission ? state.activeMission : null;
  };

  return {
    ...state,
    selectMissionsByDate,
    selectActiveMissionByDate,
  };
};

export const useGiverHomeState = () => {
  return useMemo<GiverHomeState & CalendarSelectorState>(() => {
    const payload: RawHomePayload = {
      header: {
        variant: 'geolocated',
        userName: 'Sara',
        addressLabel: 'Via Emilio Scajone 12',
        avatarInitials: 'SA',
        role: 'giver',
      },
      activeMission: {
        id: 'active-1',
        role: 'courier',
        statusLabel: 'Sta arrivando',
        statusTone: 'success',
        etaLabel: '2h',
        etaSubLabel: '35 min',
        etaMinutes: 155,
        etaTone: 'success',
        doerName: 'Peter Parker',
        doerSummary: 'Ritirando ordine',
        doerAvatarInitials: 'PP',
        doerRating: 4.8,
        doerCompletedMissions: 32,
        progress: 0.6,
        progressLabel: '60% completato',
        missionTitle: 'Consegna pacco Bartolini',
        missionReward: '€25',
        missionRoute: 'Ritiro → Destinazione',
        missionNotes: 'Lasciare al portiere se il destinatario non risponde.',
        roadmap: [
          { id: 'checkpoint-1', label: 'Ritiro completato', status: 'completed' },
          { id: 'checkpoint-2', label: 'In viaggio', status: 'current' },
          { id: 'checkpoint-3', label: 'Arrivo previsto', status: 'upcoming' },
          { id: 'checkpoint-4', label: 'Consegna al destinatario', status: 'upcoming' },
        ],
      },
      recentMissions: [
        {
          id: 'recent-1',
          title: 'Consegna documenti urgente',
          status: 'completed',
          amount: '€25',
          categoryLabel: 'Corriere',
        },
        {
          id: 'recent-2',
          title: 'Allestimento stand coffee corner',
          status: 'inProgress',
          amount: '€40',
          categoryLabel: 'Eventi',
        },
        {
          id: 'recent-3',
          title: 'Supporto remoto onboarding team',
          status: 'draft',
          amount: '—',
          categoryLabel: 'Supporto',
        },
      ],
      publishedCount: 6,
      completedCount: 4,
      averageTime: '22 min',
      hasPublishedBefore: true,
      suggestionPool: [
        { id: 'tip-active', copy: 'Visualizza il percorso in tempo reale per anticipare i prossimi step.' },
        { id: 'tip-recent', copy: 'Aggiungi dettagli precisi alle tue missioni per ricevere più candidature.' },
        { id: 'tip-returning', copy: 'Torna più tardi per controllare le candidature.' },
        { id: 'tip-new', copy: 'Descrivi il tuo bisogno in modo chiaro per ricevere risposte più veloci.' },
        { id: 'tip-new-2', copy: 'Puoi salvare bozze e pubblicarle più tardi.' },
      ],
      exampleMission: {
        title: 'Consegna spesa',
        amount: '15 €',
        duration: '30 min',
      },
    };

    const state = buildStateFromPayload(payload);

    return withCalendarSelectors(state);
  }, []);
};

export type { RawHomePayload };
