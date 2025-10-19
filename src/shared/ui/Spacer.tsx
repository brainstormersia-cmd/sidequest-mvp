import React from 'react';
import { View } from 'react-native';
import { theme } from '../lib/theme';

type SpacerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

export const Spacer = ({ size = 'md' }: SpacerProps) => (
  <View style={{ height: theme.spacing[size] }} />
);
