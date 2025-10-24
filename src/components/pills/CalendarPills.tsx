import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui/Text';
import { theme } from '../../shared/lib/theme';
import { a11yButtonProps, HITSLOP_44 } from '../../shared/lib/a11y';

type DayItem = {
  key: string;
  label: string;
  date: Date;
};

type Props = {
  initialDate?: Date;
  days?: number;
  selectedDate?: Date;
  onChange?: (date: Date) => void;
};

const listPadding = theme.space.md;
const pillSpacing = theme.space.xs;
const pillMinWidth = theme.space.lg;

const normalizeDate = (value: Date) => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const CalendarPills = memo(({ initialDate = new Date(), days = 7, selectedDate, onChange }: Props) => {
  const defaultDate = useMemo(() => normalizeDate(initialDate), [initialDate]);
  const [internalDate, setInternalDate] = useState(defaultDate);

  const activeDate = selectedDate ? normalizeDate(selectedDate) : internalDate;
  const activeKey = activeDate.toDateString();

  const data = useMemo(() => {
    const start = normalizeDate(initialDate);
    return Array.from({ length: Math.max(0, days) }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        key: date.toDateString(),
        label: date.getDate().toString(),
        date,
      } satisfies DayItem;
    });
  }, [days, initialDate]);

  const handleSelect = useCallback(
    (item: DayItem) => {
      setInternalDate(item.date);
      onChange?.(item.date);
    },
    [onChange],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.key}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => {
        const isSelected = item.key === activeKey;
        return (
          <Pressable
            {...a11yButtonProps(`Giorno ${item.label}`)}
            hitSlop={HITSLOP_44}
            onPress={() => handleSelect(item)}
            style={({ pressed }) => [
              styles.pill,
              isSelected ? styles.pillSelected : null,
              pressed ? styles.pillPressed : null,
            ]}
          >
            <Text variant="xs" weight="medium" style={[styles.label, isSelected ? styles.labelSelected : null]}>
              {item.label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
});

CalendarPills.displayName = 'CalendarPills';

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: listPadding,
    gap: pillSpacing,
  },
  pill: {
    minWidth: pillMinWidth,
    paddingHorizontal: theme.space.sm,
    paddingVertical: pillSpacing,
    borderRadius: theme.radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: theme.colors.textPrimary,
    borderColor: theme.colors.textPrimary,
  },
  pillPressed: {
    opacity: theme.opacity.pressed,
  },
  label: {
    color: theme.colors.textPrimary,
  },
  labelSelected: {
    color: theme.colors.background,
  },
});

