import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { Button } from '../../shared/ui/Button';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type Mission = {
  id: string;
  title: string;
  payout: string;
  distance: string;
  duration: string;
  rating: string;
};

type Props = {
  onExploreAll: () => void;
};

const QUICK_FILTERS = ['Vicino', 'Pagate meglio', 'Urgenti'];

const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    title: 'Volantinaggio quartiere Navigli',
    payout: '€45 netti',
    distance: '2,1 km',
    duration: '45 min',
    rating: '4,9 su 5',
  },
  {
    id: 'mission-2',
    title: 'Setup stand mercatino solidale',
    payout: '€60 netti',
    distance: '1,3 km',
    duration: '1 h 20',
    rating: '4,8 su 5',
  },
];

export const HomeDoerSection: React.FC<Props> = ({ onExploreAll }) => {
  const hasMissions = MISSIONS.length > 0;

  return (
    <View style={styles.section}>
      <View style={styles.heroCard}>
        <Text variant="xs" weight="medium" style={styles.heroBadge}>
          Obiettivo settimanale
        </Text>
        <Text variant="md" weight="bold" style={styles.heroTitle}>
          Avvia la prossima missione in 3 tocchi
        </Text>
        <Text variant="xs" style={styles.heroSubtitle}>
          Completa 3 missioni per sbloccare il bonus fedeltà.
        </Text>
      </View>

      <View style={styles.balanceBanner}>
        <View style={styles.balanceBlock}>
          <Text variant="xs" style={styles.balanceLabel}>
            Disponibile
          </Text>
          <Text variant="md" weight="bold" style={styles.balanceValue}>
            €0
          </Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceBlock}>
          <Text variant="xs" style={styles.balanceLabel}>
            In attesa
          </Text>
          <Text variant="md" weight="bold" style={styles.balanceValue}>
            €0
          </Text>
        </View>
      </View>

      <View style={styles.quickFilters}>
        {QUICK_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            {...a11yButtonProps(`Filtra missioni: ${filter}`)}
            hitSlop={HITSLOP_44}
            style={({ pressed }) => [styles.filterChip, pressed ? styles.filterChipPressed : null]}
            onPress={onExploreAll}
          >
            <Text variant="xs" weight="medium" style={styles.filterText}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {hasMissions ? (
        <View style={styles.missionList}>
          {MISSIONS.map((mission) => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionHeading}>
                <Text variant="md" weight="bold" style={styles.missionTitle}>
                  {mission.title}
                </Text>
                <Text variant="xs" weight="medium" style={styles.missionPayout}>
                  {mission.payout}
                </Text>
              </View>
              <View style={styles.missionMetaRow}>
                <Text variant="xs" style={styles.missionMeta}>
                  {mission.distance}
                </Text>
                <View style={styles.metaDivider} />
                <Text variant="xs" style={styles.missionMeta}>
                  {mission.duration}
                </Text>
                <View style={styles.metaDivider} />
                <Text variant="xs" style={styles.missionMeta}>
                  {mission.rating}
                </Text>
              </View>
              <Pressable
                {...a11yButtonProps('Candidati alla missione')}
                hitSlop={HITSLOP_44}
                style={({ pressed }) => [styles.missionCta, pressed ? styles.missionCtaPressed : null]}
                onPress={onExploreAll}
              >
                <Text variant="sm" weight="medium" style={styles.missionCtaText}>
                  Candidati
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration} />
          <Text variant="md" weight="bold" style={styles.emptyTitle}>
            Nessuna missione accettata
          </Text>
          <Text variant="xs" style={styles.emptySubtitle}>
            Appena pronte, te le mostreremo qui.
          </Text>
          <Button label="Scopri missioni" onPress={onExploreAll} />
        </View>
      )}

      <Button label="Scopri tutte" onPress={onExploreAll} variant="secondary" />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.lg,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroBadge: {
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
  heroTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  balanceBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  balanceLabel: {
    color: theme.colors.textSecondary,
  },
  balanceValue: {
    color: theme.colors.textPrimary,
  },
  balanceDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterChipPressed: {
    opacity: 0.85,
  },
  filterText: {
    color: theme.colors.textSecondary,
  },
  missionList: {
    gap: theme.spacing.md,
  },
  missionCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  missionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  missionTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  missionPayout: {
    color: theme.colors.primary,
  },
  missionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  missionMeta: {
    color: theme.colors.textSecondary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  missionCta: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  missionCtaPressed: {
    opacity: 0.9,
  },
  missionCtaText: {
    color: theme.colors.onPrimary,
  },
  emptyState: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emptyIllustration: {
    width: 88,
    height: 88,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
