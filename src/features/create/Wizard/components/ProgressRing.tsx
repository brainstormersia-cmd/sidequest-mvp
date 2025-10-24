import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTokens } from '../../../shared/lib/theme';

type Props = {
  progress: number;
  children?: React.ReactNode;
};

export const ProgressRing = ({ progress, children }: Props) => {
  const tokens = useTokens();
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const clamped = Math.max(0, Math.min(progress, 1));
  const angle = clamped * 360;
  const firstHalf = Math.min(angle, 180);
  const secondHalf = Math.max(angle - 180, 0);

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={[styles.half, { transform: [{ rotate: `${-135 + firstHalf}deg` }], opacity: clamped > 0 ? 1 : 0 }]} />
      <View
        style={[
          styles.half,
          styles.halfSecond,
          { transform: [{ rotate: `${45 + secondHalf}deg` }], opacity: clamped > 0.5 ? 1 : 0 },
        ]}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
};

const createStyles = (tokens: ReturnType<typeof useTokens>) =>
  StyleSheet.create({
    container: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    background: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 6,
      borderColor: tokens.color.border.subtle,
    },
    half: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 6,
      borderColor: 'transparent',
      borderTopColor: tokens.color.brand.primary,
      borderRightColor: tokens.color.brand.primary,
      transform: [{ rotate: '-135deg' }],
    },
    halfSecond: {
      borderTopColor: tokens.color.brand.primary,
      borderRightColor: tokens.color.brand.primary,
      borderLeftColor: tokens.color.brand.primary,
      borderBottomColor: tokens.color.brand.primary,
    },
    inner: {
      width: 60 - 12,
      height: 60 - 12,
      borderRadius: (60 - 12) / 2,
      backgroundColor: tokens.color.bg.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: tokens.shadow.soft.color,
      shadowOpacity: 0.12,
      shadowOffset: tokens.shadow.soft.offset,
      shadowRadius: tokens.shadow.soft.radius,
    },
  });
