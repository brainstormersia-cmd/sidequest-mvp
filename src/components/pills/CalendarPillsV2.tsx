import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type DayItem = {
  key: string;
  dayLabel: string;
  dayNumber: number;
  date: Date;
};

type Props = {
  initialDate?: Date;
  days?: number;
  selectedDate?: Date;
  onChange?: (date: Date) => void;
  rightAccessory?: React.ReactNode;
};

const baseUnit = theme.space.xs;
const spacing = theme.space.md;
const gap = baseUnit;
const pillWidth = baseUnit * 6;
const verticalPadding = baseUnit * 0.75;
const weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

const normalizeDate = (value: Date) => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const CalendarPillsV2 = memo(
  ({
    initialDate = new Date(),
    days = 14,
    selectedDate,
    onChange,
    rightAccessory,
  }: Props) => {
    const defaultDate = useMemo(() => normalizeDate(initialDate), [initialDate]);
    const [internalDate, setInternalDate] = useState(defaultDate);

    const activeDate = selectedDate ? normalizeDate(selectedDate) : internalDate;
    const activeKey = activeDate.getTime();

    const data = useMemo(() => {
      const start = normalizeDate(initialDate);
      return Array.from({ length: Math.max(0, days) }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const normalized = normalizeDate(date);
        return {
          key: normalized.toDateString(),
          dayLabel: weekdayLabels[normalized.getDay()],
          dayNumber: normalized.getDate(),
          date: normalized,
        } satisfies DayItem;
      });
    }, [days, initialDate]);

    const monthLabel = useMemo(() => {
      const baseDate = data[0]?.date ?? activeDate;
      const label = baseDate.toLocaleString(undefined, { month: 'long' });
      if (!label) {
        return '';
      }
      return label.charAt(0).toUpperCase() + label.slice(1);
    }, [activeDate, data]);

    const handleSelect = useCallback(
      (item: DayItem) => {
        setInternalDate(item.date);
        onChange?.(item.date);
      },
      [onChange],
    );

    return (
      <View style={styles.wrapper}>
        <View style={styles.headerRow}>
          <Text variant="xs" weight="medium" style={styles.monthLabel}>
            {monthLabel}
          </Text>
          <View style={styles.headerSpacer} />
          {rightAccessory}
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const itemKey = normalizeDate(item.date).getTime();
            const isSelected = itemKey === activeKey;
            return (
              <Pressable
                {...a11yButtonProps(`Seleziona ${item.dayLabel} ${item.dayNumber}`)}
                hitSlop={HITSLOP_44}
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.pill,
                  isSelected ? styles.pillSelected : null,
                  pressed ? styles.pillPressed : null,
                ]}
              >
                <Text
                  variant="xs"
                  weight="medium"
                  style={[styles.weekday, isSelected ? styles.pillSelectedText : null]}
                >
                  {item.dayLabel}
                </Text>
                <Text
                  variant="sm"
                  weight="bold"
                  style={[styles.dayNumber, isSelected ? styles.pillSelectedText : null]}
                >
                  {item.dayNumber}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    );
  },
);

CalendarPillsV2.displayName = 'CalendarPillsV2';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: gap,
  },
  headerSpacer: {
    flex: 1,
  },
  monthLabel: {
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  listContent: {
    gap,
  },
  pill: {
    width: pillWidth,
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: verticalPadding,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.xxs,
  },
  pillSelected: {
    backgroundColor: theme.colors.textPrimary,
    borderColor: theme.colors.textPrimary,
  },
  pillPressed: {
    opacity: theme.opacity.pressed,
  },
  weekday: {
    color: theme.colors.textSecondary,
  },
  dayNumber: {
    color: theme.colors.textPrimary,
  },
  pillSelectedText: {
    color: theme.colors.background,
  },
});
