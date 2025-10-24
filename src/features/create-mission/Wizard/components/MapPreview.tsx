import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../../shared/ui/Text';
import { useWizardTokens } from '../tokens';

type Props = {
  address: string;
  remote: boolean;
};

export const MapPreview = ({ address, remote }: Props) => {
  const tokens = useWizardTokens();
  return (
    <View
      style={{
        height: 140,
        borderRadius: tokens.radius.lg,
        backgroundColor: tokens.color.bg.elevated,
        borderWidth: 1,
        borderColor: tokens.color.border.subtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="xs" tone="secondary">
        {remote ? 'Missione remota' : address ? address : 'Anteprima mappa'}
      </Text>
    </View>
  );
};
