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
  etaMinutes: number;
  etaTone: 'success' | 'review' | 'warning';
  doerName: string;
  doerSummary: string;
  doerAvatarInitials: string;
  progress: number;
  progressLabel: string;
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

export const useGiverHomeState = () => {
  return useMemo<GiverHomeState>(() => {
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
        etaLabel: '⏱ 17:35',
        etaMinutes: 12,
        etaTone: 'success',
        doerName: 'Peter Parker',
        doerSummary: 'Ritirando ordine',
        doerAvatarInitials: 'PP',
        progress: 0.6,
        progressLabel: '60% completato',
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

    return buildStateFromPayload(payload);
  }, []);
};

export type { RawHomePayload };
