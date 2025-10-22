import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { Button } from '../../shared/ui/Button';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type MissionOverview = {
  id: string;
  title: string;
  budget: string;
  status: string;
  updatedAt: string;
  actionLabel: string;
};

type Props = {
  onCreateMission: () => void;
  onManageListings: () => void;
};

const ACTIVE_TAB = 'Attive';
const TABS = ['Bozze', 'Attive', 'In revisione', 'Chiuse'];

const MISSIONS: MissionOverview[] = [
  {
    id: 'giver-1',
    title: 'Montaggio palco talk serale',
    budget: 'Budget: €320',
    status: 'In corso · Task 2/4',
    updatedAt: 'Ultimo aggiornamento 2 h fa',
    actionLabel: 'Apri chat',
  },
  {
    id: 'giver-2',
    title: 'Accoglienza volontari evento tech',
    budget: 'Budget: €210',
    status: 'In attesa di feedback',
    updatedAt: 'Ultimo aggiornamento 5 h fa',
    actionLabel: 'Rilascia fondi',
  },
];

export const HomeGiverSection: React.FC<Props> = ({ onCreateMission, onManageListings }) => {
  const hasMissions = MISSIONS.length > 0;

  return (
    <View style={styles.section}>
      <View style={styles.heroCard}>
        <Text variant="md" weight="bold" style={styles.heroTitle}>
          Pubblica una missione
        </Text>
        <Text variant="xs" style={styles.heroSubtitle}>
          Descrivi cosa ti serve e paga in escrow in pochi minuti.
        </Text>
        <Button label="Pubblica una missione" onPress={onCreateMission} />
      </View>

      <View style={styles.escrowBanner}>
        <View style={styles.escrowBlock}>
          <Text variant="xs" style={styles.escrowLabel}>
            In attesa
          </Text>
          <Text variant="md" weight="bold" style={styles.escrowValue}>
            0 €
          </Text>
        </View>
        <View style={styles.escrowDivider} />
        <View style={styles.escrowBlock}>
          <Text variant="xs" style={styles.escrowLabel}>
            In revisione
          </Text>
          <Text variant="md" weight="bold" style={styles.escrowValue}>
            0
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab === ACTIVE_TAB;
          return (
            <Pressable
              key={tab}
              {...a11yButtonProps(`Mostra missioni ${tab.toLowerCase()}`)}
              accessibilityState={{ selected: isActive }}
              onPress={onManageListings}
              hitSlop={HITSLOP_44}
              style={({ pressed }) => [
                styles.tabChip,
                isActive ? styles.tabChipActive : null,
                pressed ? styles.tabChipPressed : null,
              ]}
            >
              <Text variant="xs" weight={isActive ? 'bold' : 'medium'} style={isActive ? styles.tabTextActive : styles.tabText}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hasMissions ? (
        <View style={styles.missionList}>
          {MISSIONS.map((mission) => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionHeader}>
                <Text variant="md" weight="bold" style={styles.missionTitle}>
                  {mission.title}
                </Text>
                <Text variant="xs" style={styles.missionBudget}>
                  {mission.budget}
                </Text>
              </View>
              <Text variant="xs" style={styles.missionStatus}>
                {mission.status}
              </Text>
              <Text variant="xs" style={styles.missionUpdate}>
                {mission.updatedAt}
              </Text>
              <Pressable
                {...a11yButtonProps(mission.actionLabel)}
                hitSlop={HITSLOP_44}
                onPress={onManageListings}
                style={({ pressed }) => [styles.missionAction, pressed ? styles.missionActionPressed : null]}
              >
                <Text variant="sm" weight="medium" style={styles.missionActionText}>
                  {mission.actionLabel}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration} />
          <Text variant="md" weight="bold" style={styles.emptyTitle}>
            Non hai ancora pubblicato
          </Text>
          <Text variant="xs" style={styles.emptySubtitle}>
            Inizia in 60 secondi con il nostro brief guidato.
          </Text>
          <Button label="Crea missione" onPress={onCreateMission} />
        </View>
      )}

      <Button label="Gestisci missioni" onPress={onManageListings} variant="secondary" />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  escrowBlock: {
    flex: 1,
  },
  escrowLabel: {
    color: theme.colors.textSecondary,
  },
  escrowValue: {
    color: theme.colors.textPrimary,
  },
  escrowDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabChipPressed: {
    opacity: 0.9,
  },
  tabText: {
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.onPrimary,
  },
  missionList: {
    gap: theme.spacing.md,
  },
  missionCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  missionTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  missionBudget: {
    color: theme.colors.primary,
  },
  missionStatus: {
    color: theme.colors.textPrimary,
  },
  missionUpdate: {
    color: theme.colors.textSecondary,
  },
  missionAction: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 12,
    alignItems: 'center',
  },
  missionActionPressed: {
    opacity: 0.9,
  },
  missionActionText: {
    color: theme.colors.primary,
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
    width: 96,
    height: 96,
    borderRadius: 36,
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
