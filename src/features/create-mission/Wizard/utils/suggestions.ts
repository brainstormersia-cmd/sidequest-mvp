import { MissionDraft } from '../types';

type CategorySuggestion = {
  category: string;
  confidence: number;
};

type RangeSuggestion = {
  min: number;
  max: number;
  avg: number;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Spesa: ['spesa', 'supermercato', 'cibo', 'spese'],
  "Ritiro pacco": ['pacco', 'ritiro', 'spedizione', 'postale'],
  Montaggio: ['montaggio', 'montare', 'assemblare', 'ikea'],
  "Ripetizioni": ['lezione', 'ripetizione', 'studio', 'tutor'],
  IT: ['computer', 'software', 'bug', 'tecnico', 'installare'],
  Pulizie: ['pulizia', 'casa', 'igienizzare', 'riordino'],
  Consegna: ['consegna', 'delivery', 'porta'],
};

const RANGE_BY_CATEGORY: Record<string, RangeSuggestion> = {
  Spesa: { min: 12, max: 20, avg: 16 },
  "Ritiro pacco": { min: 10, max: 18, avg: 14 },
  Montaggio: { min: 18, max: 32, avg: 24 },
  "Ripetizioni": { min: 18, max: 30, avg: 24 },
  IT: { min: 22, max: 40, avg: 30 },
  Pulizie: { min: 14, max: 24, avg: 18 },
  Consegna: { min: 12, max: 22, avg: 16 },
};

const DEFAULT_RANGE: RangeSuggestion = { min: 12, max: 24, avg: 18 };

const NORMALIZE = /[^\wÀ-ú]+/g;

export const suggestCategory = (title: string, description: string, existing?: string): CategorySuggestion | null => {
  const baseText = `${title} ${description}`.toLowerCase();
  if (!baseText.trim()) {
    return null;
  }

  let best: CategorySuggestion | null = null;
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    const hits = keywords.reduce((acc, keyword) => {
      const normalized = keyword.replace(NORMALIZE, '');
      return baseText.includes(normalized) ? acc + 1 : acc;
    }, 0);

    if (hits === 0) {
      return;
    }

    const confidence = Math.min(1, hits / 3);
    if (!best || confidence > best.confidence || (confidence === best.confidence && category === existing)) {
      best = { category, confidence };
    }
  });

  return best;
};

export const suggestRange = (category: string, locationMode: MissionDraft['location']['mode']): RangeSuggestion => {
  const base = RANGE_BY_CATEGORY[category] ?? DEFAULT_RANGE;
  if (locationMode === 'remote') {
    return {
      min: Math.max(8, base.min - 2),
      max: base.max,
      avg: Math.round((base.min + base.max) / 2),
    };
  }
  return base;
};

export const quickMissionTemplate = {
  title: '',
  whenOption: 'now' as const,
  price: 15,
};

type MissionTemplate = {
  key: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: RangeSuggestion;
  urgency: MissionDraft['urgency'];
};

export const templates: MissionTemplate[] = [
  {
    key: 'grocery',
    title: 'Spesa settimanale al supermercato',
    description: 'Lista pronta, serve qualcuno che faccia la spesa e consegni a casa entro stasera.',
    category: 'Spesa',
    tags: ['Spesa', 'Consegna'],
    price: RANGE_BY_CATEGORY['Spesa'],
    urgency: 'Prioritaria',
  },
  {
    key: 'package',
    title: 'Ritiro pacco DHL',
    description: 'Il pacco è pronto al punto ritiro in centro. Serve consegna entro le 19.',
    category: 'Ritiro pacco',
    tags: ['Consegna'],
    price: RANGE_BY_CATEGORY['Ritiro pacco'],
    urgency: 'Normale',
  },
  {
    key: 'assembly',
    title: 'Montaggio scaffale Ikea Billy',
    description: 'Scatola nuova, strumenti già sul posto. Serve montaggio e fissaggio a parete.',
    category: 'Montaggio',
    tags: ['Montaggio', 'Casa'],
    price: RANGE_BY_CATEGORY['Montaggio'],
    urgency: 'ASAP',
  },
];

export const ensureRange = (draft: MissionDraft): RangeSuggestion => {
  if (draft.priceRangeHint) {
    return draft.priceRangeHint;
  }
  return suggestRange(draft.category, draft.location.mode);
};
