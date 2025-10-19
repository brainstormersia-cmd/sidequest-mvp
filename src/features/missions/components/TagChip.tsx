import React from 'react';
import { Chip } from '../../../shared/ui/Chip';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export const TagChip = ({ label, active, onPress }: Props) => (
  <Chip label={label} active={active} onPress={onPress} />
);
