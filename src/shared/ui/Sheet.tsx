import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { theme } from '../lib/theme';
import { Text } from './Text';
import { reduceMotionEnabled, a11yButtonProps, HITSLOP_44 } from '../lib/a11y';
import { strings } from '../../config/strings';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  accessibilityLabel?: string;
  presentation?: 'sheet' | 'overlay';
};

export const Sheet = ({
  visible,
  onClose,
  children,
  title,
  accessibilityLabel,
  presentation = 'sheet',
}: SheetProps) => {
  const [mounted, setMounted] = useState(visible);
  const animated = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    reduceMotionEnabled().then(setReduceMotion).catch(() => setReduceMotion(false));
  }, []);

  useEffect(() => {
    if (visible && title) {
      AccessibilityInfo.announceForAccessibility(title);
    }
  }, [visible, title]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(animated, {
        toValue: 1,
        duration: reduceMotion ? 0 : 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animated, {
        toValue: 0,
        duration: reduceMotion ? 0 : 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [visible, animated, reduceMotion]);

  const animatedStyle = useMemo(() => {
    if (presentation === 'overlay') {
      return { opacity: animated };
    }
    const translateY = animated.interpolate({
      inputRange: [0, 1],
      outputRange: [400, 0],
    });
    return { transform: [{ translateY }] };
  }, [animated, presentation]);

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title || strings.accessibility.close}
        onPress={onClose}
      >
        <View />
      </Pressable>
      <View style={[styles.contentWrapper, presentation === 'overlay' ? styles.overlayWrapper : null]}>
        <Animated.View
          style={[
            presentation === 'overlay' ? styles.overlayContent : styles.sheetContainer,
            animatedStyle,
          ]}
        >
          {title ? (
            <View style={styles.header}>
              <Text variant="md" weight="bold" accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Pressable
                {...a11yButtonProps(strings.accessibility.close)}
                onPress={onClose}
                hitSlop={HITSLOP_44}
                style={styles.closeButton}
              >
                <Text variant="md" weight="bold">
                  ×
                </Text>
              </Pressable>
            </View>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 10, 0.7)',
  },
  contentWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.sm,
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: theme.spacing.xs,
  },
  overlayWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  overlayContent: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    width: '100%',
    maxWidth: 420,
  },
});
