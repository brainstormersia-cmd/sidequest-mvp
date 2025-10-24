export type MissionQualityLevel = 'Completa' | 'Ottimizzata' | 'Eccellente';

export type Attachment = {
  id: string;
  uri: string;
  type: 'photo' | 'video';
};

export type MissionScheduleOption = 'now' | 'tonight' | 'tomorrow' | 'custom';

export type MissionDraft = {
  title: string;
  description: string;
  category: string;
  categorySource: 'auto' | 'manual' | 'template';
  tags: string[];
  quality: MissionQualityLevel;
  location: {
    mode: 'in_person' | 'remote';
    address: string;
    coordinates?: { lat: number; lng: number } | null;
    note?: string;
  };
  schedule: {
    option: MissionScheduleOption;
    start?: string | null;
    deadline?: string | null;
  };
  price: number;
  priceInput: string;
  priceRangeHint: { min: number; max: number; avg: number } | null;
  tip?: number | null;
  urgency: 'Normale' | 'Prioritaria' | 'ASAP';
  skills: string[];
  notes: string;
  access: string;
  attachments: Attachment[];
  visibility: 'public' | 'private';
  refined?: {
    category?: string;
    refinedTitle?: string;
    refinedDescription?: string;
    suggestedRange?: { min: number; max: number; avg: number };
    estimatedDuration?: string;
    missing?: string[];
  };
  templateKey?: string | null;
  quickMode?: boolean;
  updatedAt: number;
};

export type WizardValidation = Partial<Record<keyof MissionDraft | `location.${keyof MissionDraft['location']}` | `schedule.${keyof MissionDraft['schedule']}`, string>>;
