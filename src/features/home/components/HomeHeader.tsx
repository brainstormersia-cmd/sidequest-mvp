import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { theme } from '../../../shared/lib/theme';
import { GiverHeaderModel } from '../useGiverHomeState';

export type HomeHeaderProps = {
  header: GiverHeaderModel;
  onPressProfile: () => void;
  onPressSwitchRole: () => void;
};

const Avatar = React.memo(({ initials }: { initials: string }) => {
  return (
    <View style={styles.avatar}>
      <Text variant="sm" weight="bold" style={styles.avatarText}>
        {initials}
      </Text>
    </View>
  );
});
Avatar.displayName = 'HomeHeaderAvatar';

export const HomeHeader: React.FC<HomeHeaderProps> = React.memo(
  ({ header, onPressProfile, onPressSwitchRole }) => {
    const greeting = `Buongiorno, ${header.userName}`;
    const oppositeRole = header.role === 'giver' ? 'Doer' : 'Giver';

    return (
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <Text variant="lg" weight="bold" style={styles.greeting}>
            {greeting}
          </Text>
          <Pressable
            {...a11yButtonProps(`Passa a ${oppositeRole}`)}
            onPress={onPressSwitchRole}
            hitSlop={HITSLOP_44}
            style={({ pressed }) => [styles.switchRole, pressed ? styles.switchRolePressed : null]}
          >
            {({ pressed }) => (
              <Text
                variant="xs"
                weight="medium"
                style={[styles.switchRoleLabel, pressed ? styles.switchRoleLabelPressed : null]}
              >
                {`Passa a ${oppositeRole}`}
              </Text>
            )}
          </Pressable>
        </View>
        <Pressable
          {...a11yButtonProps('Apri profilo')}
          onPress={onPressProfile}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.profileButton, pressed ? styles.profileButtonPressed : null]}
        >
          <Avatar initials={header.avatarInitials} />
        </Pressable>
      </View>
    );
  },
);
HomeHeader.displayName = 'HomeHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md,
  },
  textBlock: {
    flex: 1,
    gap: theme.space.xs,
  },
  greeting: {
    color: theme.colors.textPrimary,
  },
  switchRole: {
    alignSelf: 'flex-end',
  },
  switchRolePressed: {
    opacity: theme.opacity.pressed,
  },
  switchRoleLabel: {
    color: theme.colors.textSecondary,
  },
  switchRoleLabelPressed: {
    textDecorationLine: 'underline',
  },
  profileButton: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space.xxs,
  },
  profileButtonPressed: {
    opacity: theme.opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
  avatar: {
    height: theme.space['3xl'],
    width: theme.space['3xl'],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.onPrimary,
  },
});
