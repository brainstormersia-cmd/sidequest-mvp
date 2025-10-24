import { MissionDraft } from './types';

export type DeepseekResult = {
  category?: string;
  refinedTitle?: string;
  refinedDescription?: string;
  suggestedRange?: { min: number; max: number; avg: number };
  estimatedDuration?: string;
  missing?: string[];
};

export const refineMission = async ({
  title,
  description,
  tags,
  location,
}: Pick<MissionDraft, 'title' | 'description' | 'tags' | 'location'>): Promise<DeepseekResult> => {
  await new Promise((resolve) => setTimeout(resolve, 320));

  const missing: string[] = [];
  if (!location.address && location.mode !== 'remote') {
    missing.push('aggiungi luogo');
  }
  if (!description.trim()) {
    missing.push('aggiungi dettagli');
  }

  const refinedDescription = description
    ? description
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\.$/, '') + '.'
    : '';

  const refinedTitle = title.length > 0 ? title.charAt(0).toUpperCase() + title.slice(1) : title;

  const range = tags.includes('Montaggio')
    ? { min: 20, max: 34, avg: 26 }
    : tags.includes('Spesa')
    ? { min: 12, max: 20, avg: 16 }
    : undefined;

  return {
    category: tags[0],
    refinedTitle,
    refinedDescription,
    suggestedRange: range,
    estimatedDuration: range ? 'circa 1h 30m' : undefined,
    missing,
  };
};
