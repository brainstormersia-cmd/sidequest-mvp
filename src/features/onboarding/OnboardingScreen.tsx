import React, { useMemo, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { strings } from '../../config/strings';
import { RootStackParamList } from '../../routes/RootNavigator';
import { Text } from '../../shared/ui/Text';
import { Button } from '../../shared/ui/Button';
import { Spacer } from '../../shared/ui/Spacer';
import {
  getOrCreateDeviceId,
  markOnboardingSeen,
  upsertDeviceProfile,
} from '../../shared/lib/device';
import { hasSupabase } from '../../shared/lib/supabase';

const slides = [
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
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'> & {
  onFinished: () => void;
};

export const OnboardingScreen = ({ navigation, onFinished }: Props) => {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentSlide = useMemo(() => slides[index], [index]);
  const isLast = index === slides.length - 1;

  const handleStart = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      if (hasSupabase) {
        await upsertDeviceProfile(deviceId);
      }
      await markOnboardingSeen();
      onFinished();
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      console.warn('Errore completamento onboarding', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleStart();
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/splash.png')}
          accessibilityIgnoresInvertColors
          style={styles.image}
        />
        <Spacer size="lg" />
        <Text variant="lg" weight="bold" accessibilityRole="header">
          {currentSlide.title}
        </Text>
        <Spacer size="sm" />
        <Text variant="sm" style={styles.body}>
          {currentSlide.body}
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.indicators}>
          {slides.map((slide, idx) => (
            <View
              key={slide.key}
              style={[styles.dot, idx === index ? styles.dotActive : null]}
              accessibilityRole="text"
              accessibilityLabel={`${idx + 1} di ${slides.length}`}
            />
          ))}
        </View>
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
  container: {
    flex: 1,
    backgroundColor: '#05050A',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    marginTop: 80,
  },
  image: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  body: {
    textAlign: 'center',
  },
  footer: {
    marginBottom: 32,
    gap: 24,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E2E46',
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
  },
});
