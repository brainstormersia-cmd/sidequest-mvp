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
    slug: 'sonom', // allinea allo slug del progetto Expo creato
    version: '1.0.1',
    owner: 'horizon7', // <-- IMPORTANTISSIMO
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
      versionCode: 3, // <--- AGGIUNGI/AGGIORNA QUI
      package: 'com.sidequest.mvp', // tienilo così SOLO se non hai già pubblicato su Play; dopo la prima pubblicazione non si cambia più
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
        projectId: '4845c73f-ca62-41d3-821b-08a69b0d921b', // <-- QUELLO GIUSTO
      },
    },
  };
};
