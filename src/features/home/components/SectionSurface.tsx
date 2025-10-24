import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../../../shared/lib/theme';

export type SectionSurfaceProps = ViewProps & {
  children: React.ReactNode;
};

export const SectionSurface: React.FC<SectionSurfaceProps> = ({ style, children, ...rest }) => {
  return (
    <View style={[styles.surface, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  surface: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.space.lg,
    gap: theme.space.md,
    ...theme.shadow.soft,
  },
});
