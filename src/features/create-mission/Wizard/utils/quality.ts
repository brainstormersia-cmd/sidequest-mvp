import { MissionDraft, MissionQualityLevel } from '../types';

export const computeQuality = (draft: Pick<MissionDraft, 'title' | 'description' | 'tags' | 'skills' | 'attachments'>): MissionQualityLevel => {
  let score = 0;

  if (draft.title.trim().length >= 24) {
    score += 2;
  } else if (draft.title.trim().length >= 12) {
    score += 1;
  }

  if (draft.description.trim().length >= 180) {
    score += 2;
  } else if (draft.description.trim().length >= 60) {
    score += 1;
  }

  if (draft.tags.length >= 3) {
    score += 1;
  }

  if (draft.skills.length >= 2) {
    score += 1;
  }

  if (draft.attachments.length > 0) {
    score += 1;
  }

  if (score >= 5) {
    return 'Eccellente';
  }

  if (score >= 3) {
    return 'Ottimizzata';
  }

  return 'Completa';
};
