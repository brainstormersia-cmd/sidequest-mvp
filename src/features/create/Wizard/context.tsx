import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MissionDraft, MissionQualityLevel, WizardValidation } from './types';
import { computeQuality } from './utils/quality';
import { ensureRange, suggestCategory } from './utils/suggestions';

const STORAGE_KEY = 'mission-wizard-draft-v2';

const createDefaultDraft = (): MissionDraft => ({
  title: '',
  description: '',
  category: '',
  categorySource: 'auto',
  tags: [],
  quality: 'Completa',
  location: {
    mode: 'in_person',
    address: '',
    coordinates: null,
  },
  schedule: {
    option: 'now',
    start: null,
    deadline: null,
  },
  price: 18,
  priceInput: '18',
  priceRangeHint: { min: 12, max: 24, avg: 18 },
  tip: null,
  urgency: 'Normale',
  skills: [],
  notes: '',
  access: '',
  attachments: [],
  visibility: 'public',
  refined: undefined,
  templateKey: null,
  quickMode: false,
  updatedAt: Date.now(),
});

type WizardContextValue = {
  state: MissionDraft;
  setDraft: (updater: (prev: MissionDraft) => MissionDraft) => void;
  setField: <K extends keyof MissionDraft>(field: K, value: MissionDraft[K], options?: { manual?: boolean }) => void;
  setLocation: (address: string, coordinates?: { lat: number; lng: number } | null) => void;
  setSchedule: (updater: MissionDraft['schedule']) => void;
  setErrors: React.Dispatch<React.SetStateAction<WizardValidation>>;
  errors: WizardValidation;
  clearErrors: () => void;
  loadingDraft: boolean;
  reset: (next?: MissionDraft) => Promise<void>;
};

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

const withDerivedValues = (draft: MissionDraft): MissionDraft => {
  const next = { ...draft };
  const suggestion = suggestCategory(next.title, next.description, next.category);
  if (suggestion && next.categorySource !== 'manual') {
    next.category = suggestion.category;
    next.categorySource = 'auto';
  }

  const suggestedRange = next.refined?.suggestedRange ?? ensureRange(next);
  next.priceRangeHint = suggestedRange;

  const parsedPrice = Number.isFinite(next.price) ? Number(next.price) : Number(next.priceInput);
  const baseValue = Number.isFinite(parsedPrice) ? Math.max(5, Math.round(parsedPrice)) : next.priceRangeHint.avg;
  const clamped = Math.min(Math.max(next.priceRangeHint.min, baseValue), next.priceRangeHint.max);
  next.price = clamped;
  next.priceInput = `${clamped}`;

  const quality: MissionQualityLevel = computeQuality({
    title: next.title,
    description: next.description,
    tags: next.tags,
    skills: next.skills,
    attachments: next.attachments,
  });
  next.quality = quality;

  next.updatedAt = Date.now();
  return next;
};

export const WizardProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, internalSetState] = useState<MissionDraft>(createDefaultDraft);
  const [errors, setErrors] = useState<WizardValidation>({});
  const [loadingDraft, setLoadingDraft] = useState(true);
  const readyRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as Partial<MissionDraft>;
          const merged = withDerivedValues({ ...createDefaultDraft(), ...parsed });
          internalSetState(merged);
        }
      } catch (error) {
        console.warn('Impossibile caricare la bozza missione', error);
      } finally {
        if (mounted) {
          setLoadingDraft(false);
          readyRef.current = true;
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!readyRef.current) {
      return;
    }
    const handle = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) => {
        console.warn('Errore autosalvataggio missione', error);
      });
    }, 280);
    return () => clearTimeout(handle);
  }, [state]);

  const setDraft = useCallback((updater: (prev: MissionDraft) => MissionDraft) => {
    internalSetState((prev) => withDerivedValues(updater(prev)));
  }, []);

  const setField = useCallback<WizardContextValue['setField']>(
    (field, value, options) => {
      setDraft((prev) => {
        const next = { ...prev, [field]: value } as MissionDraft;
        if (field === 'category' && options?.manual) {
          next.categorySource = 'manual';
        }
        if (field === 'price') {
          next.priceInput = `${value}`;
        }
        return next;
      });
    },
    [setDraft],
  );

  const setLocation = useCallback<WizardContextValue['setLocation']>((address, coordinates) => {
    setDraft((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address,
        coordinates: coordinates ?? null,
      },
    }));
  }, [setDraft]);

  const setSchedule = useCallback<WizardContextValue['setSchedule']>((schedule) => {
    setDraft((prev) => ({
      ...prev,
      schedule,
    }));
  }, [setDraft]);

  const clearErrors = useCallback(() => setErrors({}), []);

  const reset = useCallback(async (next?: MissionDraft) => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch((error) => console.warn('Errore reset bozza', error));
    internalSetState(withDerivedValues(next ?? createDefaultDraft()));
    setErrors({});
  }, []);

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      setDraft,
      setField,
      setLocation,
      setSchedule,
      setErrors,
      errors,
      clearErrors,
      loadingDraft,
      reset,
    }),
    [state, setDraft, setField, setLocation, setSchedule, errors, clearErrors, loadingDraft, reset],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error('useWizard deve essere usato dentro WizardProvider');
  }
  return ctx;
};

export const loadDraftFromStorage = async (): Promise<MissionDraft | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return withDerivedValues({ ...createDefaultDraft(), ...(JSON.parse(raw) as MissionDraft) });
  } catch (error) {
    console.warn('Errore lettura bozza missione', error);
    return null;
  }
};

export const clearDraftStorage = () => AsyncStorage.removeItem(STORAGE_KEY);

export const defaultDraft = createDefaultDraft;
