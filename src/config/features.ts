export const useOfflineFallback = true;

export const features = {
  useOfflineFallback,
  enableHaptics: true,
  wizard: true,
};

export type FeatureFlags = typeof features;
