import React, { memo } from 'react';
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

const gridPadding = theme.space.md;
const gridGap = theme.space.md;
const tilePadding = theme.space.lg;
const largeHeight = theme.space['5xl'] * 3;
const mediumHeight = theme.space['5xl'] * 2.5;
const smallHeight = theme.space['4xl'] * 2;

const TileView = ({ tile }: { tile?: Tile }) => {
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
        tile.kind === 'large' ? styles.largeTile : null,
        tile.kind === 'medium' ? styles.mediumTile : null,
        tile.kind === 'small' ? styles.smallTile : null,
        pressed ? styles.tilePressed : null,
      ]}
    >
      <Text variant="md" weight="bold" style={styles.tileTitle}>
        {tile.title}
      </Text>
    </Pressable>
  );
};

export const TetrisGrid = memo(({ items }: Props) => {
  const large = items.find((item) => item.kind === 'large');
  const smallTiles = items.filter((item) => item.kind === 'small');
  const medium = items.find((item) => item.kind === 'medium');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftColumn}>
          <TileView tile={large} />
        </View>
        <View style={styles.rightColumn}>
          <TileView tile={smallTiles[0]} />
          <TileView tile={smallTiles[1]} />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <TileView tile={medium} />
      </View>
    </View>
  );
});

TetrisGrid.displayName = 'TetrisGrid';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: gridPadding,
    gap: gridGap,
  },
  topRow: {
    flexDirection: 'row',
    gap: gridGap,
  },
  leftColumn: {
    flex: 1.2,
  },
  rightColumn: {
    flex: 1,
    gap: gridGap,
  },
  bottomRow: {
    marginTop: gridGap,
  },
  tile: {
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: tilePadding,
    justifyContent: 'flex-end',
    minHeight: mediumHeight,
    ...theme.shadow.soft,
  },
  tilePressed: {
    opacity: theme.opacity.pressed,
  },
  tileTitle: {
    color: theme.colors.textPrimary,
  },
  largeTile: {
    minHeight: largeHeight,
  },
  mediumTile: {
    minHeight: mediumHeight,
  },
  smallTile: {
    minHeight: smallHeight,
  },
  tilePlaceholder: {
    opacity: 0,
  },
});

