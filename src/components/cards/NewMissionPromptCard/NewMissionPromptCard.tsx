import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { Button } from '../../../shared/ui/Button';
import { theme } from '../../../shared/lib/theme';
import { NewMissionPromptCardProps } from './NewMissionPromptCard.types';

export const NewMissionPromptCard: React.FC<NewMissionPromptCardProps> = React.memo(
  ({ title, subtitle, illustration = '⭕', tips, ctaLabel, onPressCta }) => {
    return (
      <View style={styles.card}>
        <View style={styles.illustration}>
          <Text variant="lg" style={styles.illustrationText}>
            {illustration}
          </Text>
        </View>
        <Text variant="md" weight="bold" style={styles.title}>
          {title}
        </Text>
        <Text variant="sm" style={styles.subtitle}>
          {subtitle}
        </Text>
        <View style={styles.tipList}>
          {tips.map((tip) => (
            <Text key={tip.id} variant="sm" style={styles.tipCopy}>
              {`💡 ${tip.copy}`}
            </Text>
          ))}
        </View>
        <Button label={ctaLabel} onPress={onPressCta} />
      </View>
    );
  },
);

NewMissionPromptCard.displayName = 'NewMissionPromptCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.space.lg,
    gap: theme.space.md,
    alignItems: 'center',
  },
  illustration: {
    width: theme.space['3xl'],
    height: theme.space['3xl'],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    color: theme.colors.textSecondary,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tipList: {
    gap: theme.space.xs,
    width: '100%',
  },
  tipCopy: {
    color: theme.colors.textSecondary,
  },
});
