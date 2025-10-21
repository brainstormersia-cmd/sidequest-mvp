import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/RootNavigator';
import { Text } from '../../shared/ui/Text';
import { Button } from '../../shared/ui/Button';
import { Spacer } from '../../shared/ui/Spacer';
import { strings } from '../../config/strings';
import {
  getOrCreateDeviceId,
  markOnboardingSeen,
  upsertDeviceProfile,
} from '../../shared/lib/device';
import { hasSupabase } from '../../shared/lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'> & {
  onFinished?: () => void;
};

type Slide = { key: string; title: string; body: string };

const SLIDES: Slide[] = [
  {
    key: 'slide-1',
    title: strings.onboarding.slide1Title,
    body: strings.onboarding.slide1Body,
  },
  {
    key: 'slide-2',
    title: strings.onboarding.slide2Title,
    body: strings.onboarding.slide2Body,
  },
  // terza slide opzionale, testuale (non fa riferimento a strings inesistenti)
  {
    key: 'slide-3',
    title: 'Missioni veloci e sicure',
    body: 'Pubblica, unisciti e completa quest con pagamenti protetti e reputazione.',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation, onFinished }) => {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / width);
      if (i !== index) setIndex(i);
    },
    [index, width]
  );

  const scrollTo = useCallback(
    (i: number) => listRef.current?.scrollToOffset({ offset: i * width, animated: true }),
    [width]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      void handleStart();
    } else {
      scrollTo(index + 1);
    }
  }, [index, isLast, scrollTo]);

  const handleSkip = useCallback(() => {
    scrollTo(SLIDES.length - 1);
  }, [scrollTo]);

  const handleStart = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      if (hasSupabase) await upsertDeviceProfile(deviceId);
      await markOnboardingSeen();
      onFinished?.();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      console.warn('Errore completamento onboarding', err);
      setLoading(false);
    }
  }, [loading, navigation, onFinished]);

  const renderItem = useCallback(
    ({ item }: { item: Slide }) => (
      <View style={[styles.slide, { width, paddingHorizontal: 24 }]}>
        <Spacer size="lg" />
        <Text variant="lg" weight="bold" style={styles.title} accessibilityRole="header">
          {item.title}
        </Text>
        <Spacer size="sm" />
        <Text variant="md" style={styles.body}>
          {item.body}
        </Text>
      </View>
    ),
    [width]
  );

  const dots = useMemo(
    () =>
      SLIDES.map((s, i) => (
        <View
          key={s.key}
          style={[styles.dot, i === index && styles.dotActive]}
          accessibilityRole="text"
          accessibilityLabel={`${i + 1} di ${SLIDES.length}`}
        />
      )),
    [index]
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* BACKGROUND full-screen con la tua immagine */}
      <ImageBackground
        source={require('../../../assets/splash.png')}
        style={[StyleSheet.absoluteFillObject, { width, height }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      >
        {/* scrim per contrasto */}
        <View style={styles.scrim} />
      </ImageBackground>

      {/* HEADER: brand + Salta */}
      <View style={styles.header}>
        <Text variant="sm" weight="bold" style={styles.brand}>SideQuest</Text>
        <Pressable onPress={handleSkip} hitSlop={8} accessibilityRole="button">
          <Text variant="sm" weight="bold" style={styles.skip}>
            {strings.onboarding.skip}
          </Text>
        </Pressable>
      </View>

      {/* SLIDES */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ flexGrow: 0, height: Math.min(420, height * 0.55) }}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.indicators}>{dots}</View>
        <Button
          label={isLast ? strings.onboarding.start : strings.onboarding.next}
          onPress={handleNext}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05050A',
    justifyContent: 'space-between',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.55)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: '#FFF', opacity: 0.9, letterSpacing: 0.5 },
  skip: { color: '#FFF', opacity: 0.9 },
  slide: { justifyContent: 'flex-end' },
  title: { color: '#FFF', textAlign: 'center' },
  body: { color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  indicators: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: { backgroundColor: '#FFF', width: 20 },
});
