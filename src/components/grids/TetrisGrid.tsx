import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type Tile = {
  id: string;
  title: string;
  kind: 'large' | 'small' | 'medium';
  onPress?: () => void;
};

type Props = {
  items: Tile[];
};

const horizontalPadding = theme.space.md;
const gap = theme.space.xs;
const tilePadding = theme.space.lg;
const tileMinHeight = theme.space['4xl'] * 2;
const largeMinHeight = theme.space['5xl'] * 2;

export const TetrisGrid = memo(({ items }: Props) => {
  const layout = useMemo(() => {
    const large = items.find((item) => item.kind === 'large');
    const smallTiles = items.filter((item) => item.kind === 'small');
    const medium = items.find((item) => item.kind === 'medium');
    return { large, smallTiles, medium };
  }, [items]);

  const renderTile = (tile?: Tile) => {
    if (!tile) {
      return <View style={[styles.tile, styles.tilePlaceholder]} />;
    }

    return (
      <Pressable
        {...a11yButtonProps(tile.title)}
        hitSlop={HITSLOP_44}
        onPress={tile.onPress}
        style={({ pressed }) => [
          styles.tile,
          styles[tile.kind],
          pressed ? styles.tilePressed : null,
        ]}
      >
        <Text variant="md" weight="bold" style={styles.tileTitle}>
          {tile.title}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftColumn}>{renderTile(layout.large)}</View>
        <View style={styles.rightColumn}>
          {renderTile(layout.smallTiles[0])}
          {renderTile(layout.smallTiles[1])}
        </View>
      </View>
      <View style={styles.bottomRow}>{renderTile(layout.medium)}</View>
    </View>
  );
});

TetrisGrid.displayName = 'TetrisGrid';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalPadding,
    gap,
  },
  topRow: {
    flexDirection: 'row',
    gap,
  },
  leftColumn: {
    flex: 1.2,
  },
  rightColumn: {
    flex: 1,
    gap,
  },
  bottomRow: {
    marginTop: gap,
  },
  tile: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: tilePadding,
    justifyContent: 'flex-end',
    minHeight: tileMinHeight,
    shadowColor: theme.shadow.soft.shadowColor,
    shadowOffset: theme.shadow.soft.shadowOffset,
    shadowOpacity: theme.shadow.soft.shadowOpacity,
    shadowRadius: theme.shadow.soft.shadowRadius,
    elevation: theme.elevation.level0,
  },
  large: {
    minHeight: largeMinHeight,
  },
  medium: {
    minHeight: tileMinHeight,
  },
  small: {
    minHeight: tileMinHeight,
  },
  tilePressed: {
    opacity: theme.opacity.pressed,
  },
  tileTitle: {
    color: theme.colors.textPrimary,
  },
  tilePlaceholder: {
    opacity: 0,
  },
});
