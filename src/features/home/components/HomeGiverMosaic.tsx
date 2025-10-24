import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/ui/Text';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { theme } from '../../../shared/lib/theme';
import {
  GiverHomeState,
  RecentMissionModel,
  SuggestionModel,
} from '../useGiverHomeState';

export type HomeGiverMosaicProps = {
  state: GiverHomeState;
  onPressMission: (missionId: string) => void;
  onLongPressMission: (missionId: string) => void;
  onPressCreate: () => void;
  onPressExamples: () => void;
};

const gradients = {
  recent: ['#E4E8FF', '#F2F3FF'] as const,
  create: ['#FFE9F3', '#FFEFF8'] as const,
  tips: ['#E8FFF5', '#F3FFF9'] as const,
};

const RecentList: React.FC<{
  missions: RecentMissionModel[];
  onPressMission: (missionId: string) => void;
  onLongPressMission: (missionId: string) => void;
}> = ({ missions, onPressMission, onLongPressMission }) => {
  if (missions.length === 0) {
    return (
      <Text variant="xs" style={styles.mutedCopy}>
        Nessuna missione recente. Inizia a crearne una nuova per popolare questo spazio.
      </Text>
    );
  }

  return (
    <View style={styles.recentList}>
      {missions.slice(0, 3).map((mission) => (
        <Pressable
          key={mission.id}
          {...a11yButtonProps(`Apri missione ${mission.title}`)}
          hitSlop={HITSLOP_44}
          onPress={() => onPressMission(mission.id)}
          onLongPress={() => onLongPressMission(mission.id)}
          style={({ pressed }) => [styles.recentItem, pressed ? styles.recentItemPressed : null]}
        >
          <Text variant="sm" weight="medium" style={styles.recentItemTitle} numberOfLines={1}>
            {mission.title}
          </Text>
          <Text variant="xs" style={styles.recentItemMeta} numberOfLines={1}>
            {mission.amount} • {mission.categoryLabel}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const TipsBlock: React.FC<{ tips: SuggestionModel[] }> = ({ tips }) => {
  if (tips.length === 0) {
    return null;
  }
  return (
    <View style={styles.tipList}>
      {tips.slice(0, 2).map((tip) => (
        <Text key={tip.id} variant="xs" style={styles.tipCopy}>
          {tip.copy}
        </Text>
      ))}
    </View>
  );
};

export const HomeGiverMosaic: React.FC<HomeGiverMosaicProps> = React.memo(
  ({ state, onPressMission, onLongPressMission, onPressCreate, onPressExamples }) => {
    const suggestionCopy = useMemo(() => {
      if (state.kind === 'active' || state.kind === 'recent') {
        return [state.suggestion];
      }
      if (state.kind === 'returning') {
        return [state.suggestion];
      }
      return state.tips;
    }, [state]);

    const recentMissions = useMemo(() => {
      if (state.kind === 'active' || state.kind === 'recent') {
        return state.recentMissions;
      }
      return [];
    }, [state]);

    const statsCopy = useMemo(() => {
      if (state.kind === 'active' || state.kind === 'recent') {
        return `Pubblicate ${state.stats.published} • Completate ${state.stats.completed} • Tempo medio ${state.stats.averageTime}`;
      }
      if (state.kind === 'returning') {
        return `Esempio da riprendere: ${state.exampleMission.title} • ${state.exampleMission.amount}`;
      }
      return 'Non hai ancora missioni pubblicate. Inizia ora e tieni traccia dei progressi qui.';
    }, [state]);

    const creationCopy = useMemo(() => {
      if (state.kind === 'returning') {
        return `Ricomincia da "${state.exampleMission.title}" oppure crea una variante in pochi tocchi.`;
      }
      if (state.kind === 'new') {
        return 'Descrivi il bisogno, scegli tempistiche e ringraziamento: la guida ti accompagna passo dopo passo.';
      }
      return 'Aggiorna dettagli, ricicla missioni riuscite e pubblica in meno di un minuto.';
    }, [state]);

    return (
      <View style={styles.mosaic}>
        <View style={[styles.tilePressable, styles.tileLarge]}>
          <LinearGradient colors={gradients.recent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tileGradient}>
            <Text variant="md" weight="bold" style={styles.tileTitle}>
              Missioni recenti
            </Text>
            <RecentList missions={recentMissions} onPressMission={onPressMission} onLongPressMission={onLongPressMission} />
            <Pressable
              {...a11yButtonProps('Visualizza elenco missioni')}
              onPress={() => {
                if (recentMissions[0]) {
                  onPressMission(recentMissions[0].id);
                } else {
                  onPressCreate();
                }
              }}
              hitSlop={HITSLOP_44}
              style={({ pressed }) => [styles.inlineLink, pressed ? styles.inlineLinkPressed : null]}
            >
              <Text variant="xs" weight="medium" style={styles.linkCopy}>
                Vai alle missioni →
              </Text>
            </Pressable>
            <Text variant="xs" style={styles.mutedCopy}>
              {statsCopy}
            </Text>
          </LinearGradient>
        </View>

        <Pressable
          {...a11yButtonProps('Scopri come creare una missione')}
          onPress={onPressExamples}
          style={({ pressed }) => [styles.tilePressable, styles.tileHalf, pressed ? styles.tilePressed : null]}
        >
          <LinearGradient colors={gradients.create} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tileGradient}>
            <Text variant="md" weight="bold" style={styles.tileTitle}>
              Come creare una missione
            </Text>
            <Text variant="xs" style={styles.bodyCopy}>
              {creationCopy}
            </Text>
            <Text variant="xs" weight="medium" style={styles.linkCopy}>
              Guida rapida →
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={[styles.tilePressable, styles.tileHalf]}>
          <LinearGradient colors={gradients.tips} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tileGradient}>
            <Text variant="md" weight="bold" style={styles.tileTitle}>
              Suggerimenti SideQuest
            </Text>
            <TipsBlock tips={suggestionCopy} />
          </LinearGradient>
        </View>
      </View>
    );
  },
);

HomeGiverMosaic.displayName = 'HomeGiverMosaic';

const styles = StyleSheet.create({
  mosaic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.md,
  },
  tilePressable: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    flexGrow: 1,
    ...theme.shadow.soft,
  },
  tilePressed: {
    opacity: theme.opacity.pressed,
  },
  tileLarge: {
    flexBasis: '100%',
    minHeight: 220,
  },
  tileHalf: {
    flexBasis: '48%',
    minHeight: 180,
  },
  tileGradient: {
    flex: 1,
    padding: theme.space.lg,
    gap: theme.space.md,
    borderRadius: theme.radius.lg,
  },
  tileTitle: {
    color: theme.colors.textPrimary,
  },
  mutedCopy: {
    color: theme.colors.textSecondary,
  },
  bodyCopy: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sm * 1.3,
  },
  linkCopy: {
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
  },
  inlineLink: {
    alignSelf: 'flex-start',
  },
  inlineLinkPressed: {
    opacity: theme.opacity.pressed,
  },
  recentList: {
    gap: theme.space.sm,
  },
  recentItem: {
    padding: theme.space.sm,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  recentItemPressed: {
    opacity: theme.opacity.pressed,
  },
  recentItemTitle: {
    color: theme.colors.textPrimary,
  },
  recentItemMeta: {
    color: theme.colors.textSecondary,
  },
  tipList: {
    gap: theme.space.sm,
  },
  tipCopy: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sm * 1.35,
  },
});
