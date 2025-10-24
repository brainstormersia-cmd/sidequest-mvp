import { MissionDraft } from '../types';

const timeFormatter = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatPrice = (draft: MissionDraft) => `${draft.price.toFixed(0)} €`;

export const formatTip = (tip?: number | null) => {
  if (!tip || tip <= 0) {
    return '—';
  }
  return `${tip.toFixed(0)} €`;
};

export const formatWhen = (draft: MissionDraft) => {
  const { option, start, deadline } = draft.schedule;
  switch (option) {
    case 'now':
      return 'Subito';
    case 'tonight':
      return 'Oggi sera';
    case 'tomorrow':
      return 'Domani';
    default: {
      const startDate = start ? new Date(start) : null;
      const endDate = deadline ? new Date(deadline) : null;
      const startValid = startDate && !Number.isNaN(startDate.getTime());
      const endValid = endDate && !Number.isNaN(endDate.getTime());
      if (startValid && endValid) {
        return `${timeFormatter.format(startDate)} → ${timeFormatter.format(endDate)}`;
      }
      if (startValid) {
        return timeFormatter.format(startDate);
      }
      if (endValid) {
        return `Entro ${timeFormatter.format(endDate)}`;
      }
      return 'Da pianificare';
    }
  }
};

export const formatWhere = (draft: MissionDraft) => {
  if (draft.location.mode === 'remote') {
    return 'Remoto';
  }
  if (draft.location.address.trim().length > 0) {
    return draft.location.address;
  }
  return 'Da definire';
};
