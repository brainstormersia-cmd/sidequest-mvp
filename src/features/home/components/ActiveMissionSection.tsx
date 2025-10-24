import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../shared/ui/Text';
import { a11yButtonProps, HITSLOP_44 } from '../../../shared/lib/a11y';
import { theme } from '../../../shared/lib/theme';
import { ActiveMissionCard } from '../../../components/cards/ActiveMissionCard';
import { useReduceMotion } from '../../../components/cards/ActiveMissionCard/ActiveMissionCard.anim';
import { ActiveMissionModel } from '../useGiverHomeState';

export type ActiveMissionSectionProps = {
  mission: ActiveMissionModel;
  onPressMission: () => void;
  onPressChat: () => void;
  onPressViewAll: () => void;
};

type CalendarEntry = {
  id: string;
  label: string;
  dateLabel: string;
  mission: ActiveMissionModel;
};

const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

export const ActiveMissionSection: React.FC<ActiveMissionSectionProps> = React.memo(
  ({ mission, onPressMission, onPressChat, onPressViewAll }) => {
    const reduceMotion = useReduceMotion();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const transitionDriver = useRef(new Animated.Value(1)).current;

    const calendarDays: CalendarEntry[] = useMemo(() => {
      const baseDate = new Date();

      return Array.from({ length: 5 }).map((_, index) => {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + index);
        const dayName = dayNames[date.getDay()];
        const label = index === 0 ? 'Oggi' : index === 1 ? 'Domani' : dayName;
        const dateLabel = `${date.getDate()} ${monthNames[date.getMonth()]}`;

        const etaMinutes = Math.max(20, mission.etaMinutes - index * 18);
        const etaHours = Math.floor(etaMinutes / 60);
        const etaRemainder = etaMinutes % 60;
        const etaLabel = etaHours > 0 ? `${etaHours}h` : `${etaMinutes}m`;
        const etaSubLabel = etaHours > 0 ? `${etaRemainder.toString().padStart(2, '0')} min` : undefined;
        const progress = Math.min(1, Math.max(0, mission.progress - index * 0.08));
        const progressLabel = `${Math.round(progress * 100)}% completato`;
        const statusLabel = index === 0 ? mission.statusLabel : index === 1 ? 'Programmata' : 'In attesa';

        return {
          id: `calendar-${index}`,
          label,
          dateLabel,
          mission: {
            ...mission,
            progress,
            progressLabel,
            statusLabel,
            etaLabel,
            etaSubLabel,
          },
        };
      });
    }, [mission]);

    const handleSelectDay = useCallback(
      (index: number) => {
        if (index === selectedIndex) {
          return;
        }

        if (reduceMotion) {
          transitionDriver.setValue(1);
          setSelectedIndex(index);
          return;
        }

        Animated.timing(transitionDriver, {
          toValue: 0,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setSelectedIndex(index);
          Animated.timing(transitionDriver, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
      },
      [reduceMotion, selectedIndex, transitionDriver],
    );

    const selectedDay = calendarDays[selectedIndex] ?? calendarDays[0];

    const transitionStyle = useMemo(
      () => ({
        opacity: transitionDriver,
        transform: [
          {
            translateY: transitionDriver.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }),
      [transitionDriver],
    );

    return (
      <View style={styles.container}>
        <View style={styles.calendarRow}>
          {calendarDays.map((day, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Pressable
                key={day.id}
                {...a11yButtonProps(`Vedi missioni per ${day.label} ${day.dateLabel}`)}
                hitSlop={HITSLOP_44}
                onPress={() => handleSelectDay(index)}
                style={({ pressed }) => [
                  styles.calendarPill,
                  isSelected ? styles.calendarPillSelected : null,
                  !isSelected && pressed ? styles.calendarPillPressed : null,
                ]}
              >
                <Text
                  variant="xs"
                  weight="medium"
                  style={[styles.calendarLabel, isSelected ? styles.calendarLabelSelected : null]}
                >
                  {day.label}
                </Text>
                <Text
                  variant="xs"
                  style={[styles.calendarDate, isSelected ? styles.calendarDateSelected : null]}
                >
                  {day.dateLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View style={[styles.cardWrapper, transitionStyle]}>
          <ActiveMissionCard
            etaLabel={selectedDay.mission.etaLabel}
            etaSubLabel={selectedDay.mission.etaSubLabel}
            etaTone={selectedDay.mission.etaTone}
            statusLabel={selectedDay.mission.statusLabel}
            statusTone={selectedDay.mission.statusTone}
            title={selectedDay.mission.doerName}
            subtitle={selectedDay.mission.doerSummary}
            progress={selectedDay.mission.progress}
            progressLabel={selectedDay.mission.progressLabel}
            avatarInitials={selectedDay.mission.doerAvatarInitials}
            onPress={onPressMission}
            onPressChat={onPressChat}
          />
        </Animated.View>

        <Pressable
          {...a11yButtonProps('Visualizza tutte le missioni attive')}
          onPress={onPressViewAll}
          hitSlop={HITSLOP_44}
          style={({ pressed }) => [styles.viewAllLink, pressed ? styles.viewAllLinkPressed : null]}
        >
          <Text variant="sm" weight="medium" style={styles.viewAllLinkLabel}>
            Visualizza tutte →
          </Text>
        </Pressable>
      </View>
    );
  },
);
ActiveMissionSection.displayName = 'ActiveMissionSection';

const styles = StyleSheet.create({
  container: {
    gap: theme.space.lg,
  },
  calendarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.xs,
    justifyContent: 'center',
  },
  calendarPill: {
    minWidth: 76,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  calendarPillSelected: {
    backgroundColor: '#050507',
    borderColor: '#050507',
  },
  calendarPillPressed: {
    opacity: theme.opacity.pressed,
  },
  calendarLabel: {
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  calendarLabelSelected: {
    color: '#FFFFFF',
  },
  calendarDate: {
    color: 'rgba(255,255,255,0.55)',
  },
  calendarDateSelected: {
    color: '#FFFFFF',
  },
  cardWrapper: {
    width: '100%',
  },
  viewAllLink: {
    alignSelf: 'center',
  },
  viewAllLinkPressed: {
    opacity: theme.opacity.pressed,
  },
  viewAllLinkLabel: {
    color: 'rgba(255,255,255,0.85)',
  },
});
