import React from 'react';
import { View } from 'react-native';
import { theme } from '../lib/theme';

type SpacerSize = keyof Pick<typeof theme.spacing, 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>;

type SpacerProps = {
  size?: SpacerSize;
};

export const Spacer = ({ size = 'md' }: SpacerProps) => (
  <View style={{ height: theme.spacing[size] }} />
);
