import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { theme } from '../../../shared/lib/theme';
import { ExampleMissionCard } from '../../../components/cards/ExampleMissionCard';
import { SuggestionCard } from '../../../components/cards/SuggestionCard';
import { ExampleMissionModel, SuggestionModel } from '../useGiverHomeState';
import { SectionSurface } from './SectionSurface';

export type ReturningSectionProps = {
  exampleMission: ExampleMissionModel;
  suggestion: SuggestionModel;
};

export const ReturningSection: React.FC<ReturningSectionProps> = React.memo(
  ({ exampleMission, suggestion }) => {
    return (
      <SectionSurface>
        <Text variant="md" weight="bold" style={styles.title}>
          Nessuna missione attiva in questo momento.
        </Text>
        <Text variant="sm" style={styles.subtitle}>
          Ti avviseremo non appena qualcuno accetterà una delle tue pubblicazioni.
        </Text>
        <ExampleMissionCard
          title={exampleMission.title}
          amount={exampleMission.amount}
          duration={exampleMission.duration}
        />
        <SuggestionCard copy={suggestion.copy} />
      </SectionSurface>
    );
  },
);
ReturningSection.displayName = 'ReturningSection';

const styles = StyleSheet.create({
  title: {
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
});
