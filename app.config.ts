import { ConfigContext, ExpoConfig } from '@expo/config';

type AppExtra = {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const envExtra: AppExtra = {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };

  return {
    ...config,
    name: 'Sidequest MVP',
    slug: 'sidequest-mvp',
    version: '1.0.0',
    owner: undefined,
    orientation: 'portrait',
    scheme: 'sidequestmvp',
    userInterfaceStyle: 'automatic',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0B0B0F',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sidequest.mvp',
    },
    android: {
      package: 'com.sidequest.mvp',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0B0B0F',
      },
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    extra: {
      ...envExtra,
      ...(config.extra as AppExtra),
      eas: {
        projectId: '00000000-0000-0000-0000-000000000000',
      },
    },
  };
};
