import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { a11yButtonProps } from '../../../shared/lib/a11y';
import { theme } from '../../../shared/lib/theme';
import { NewMissionPromptCard } from '../../../components/cards/NewMissionPromptCard';
import { SuggestionModel } from '../useGiverHomeState';

export type NewMissionSectionProps = {
  tips: SuggestionModel[];
  onPressCreate: () => void;
  onPressExamples: () => void;
};

export const NewMissionSection: React.FC<NewMissionSectionProps> = React.memo(
  ({ tips, onPressCreate, onPressExamples }) => {
    return (
      <View style={styles.container}>
        <NewMissionPromptCard
          title="Ancora nessuna missione."
          subtitle="Pubblica la tua prima in meno di un minuto."
          tips={tips}
          ctaLabel="+ Crea missione"
          onPressCta={onPressCreate}
        />
        <Pressable
          {...a11yButtonProps('Guarda le missioni più popolari nella tua zona')}
          onPress={onPressExamples}
          style={({ pressed }) => [styles.examplesLink, pressed ? styles.examplesLinkPressed : null]}
        >
          <Text variant="xs" style={styles.examplesCopy}>
            Nessuna idea? Guarda le missioni più popolari nella tua zona.
          </Text>
        </Pressable>
      </View>
    );
  },
);
NewMissionSection.displayName = 'NewMissionSection';

const styles = StyleSheet.create({
  container: {
    gap: theme.space.md,
  },
  examplesLink: {
    alignSelf: 'center',
  },
  examplesLinkPressed: {
    opacity: theme.opacity.pressed,
  },
  examplesCopy: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
