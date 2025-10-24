import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useTokens } from '../../../../shared/lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  hint?: string;
};

export const StepHeader = ({ title, subtitle, hint }: Props) => {
  const tokens = useTokens();
  return (
    <View style={{ gap: tokens.space.xxxs }}>
      <Text variant="lg" weight="bold">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="sm" tone="secondary">
          {subtitle}
        </Text>
      ) : null}
      {hint ? (
        <Text variant="xs" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
};
