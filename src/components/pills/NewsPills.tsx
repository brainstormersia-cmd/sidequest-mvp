import React, { memo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type NewsItem = {
  id: string;
  title: string;
  imageUri?: string;
  onPress?: () => void;
};

type Props = {
  items: NewsItem[];
};

const horizontalPadding = theme.space.none;
const pillSpacing = theme.space.sm;
const thumbSize = theme.space.lg;
const pillMaxWidth = theme.space['5xl'] * 3;

export const NewsPills = memo(({ items }: Props) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Pressable
          {...a11yButtonProps(item.title)}
          hitSlop={HITSLOP_44}
          onPress={item.onPress}
          style={({ pressed }) => [styles.pill, pressed ? styles.pillPressed : null]}
        >
          <View style={styles.thumbnail}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </View>
          <Text numberOfLines={1} variant="xs" weight="medium" style={styles.title}>
            {item.title}
          </Text>
        </Pressable>
      )}
    />
  );
});

NewsPills.displayName = 'NewsPills';

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: horizontalPadding,
    gap: pillSpacing,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pillSpacing,
    paddingVertical: theme.space.xs,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: pillSpacing,
    maxWidth: pillMaxWidth,
    ...theme.shadow.soft,
  },
  pillPressed: {
    opacity: theme.opacity.pressed,
  },
  thumbnail: {
    width: thumbSize,
    height: thumbSize,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    opacity: 0.4,
  },
  title: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
});

