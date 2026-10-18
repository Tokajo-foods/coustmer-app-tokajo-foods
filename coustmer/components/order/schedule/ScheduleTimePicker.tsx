import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { minutesToLabel } from '@/lib/cart/schedule-validation';

import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  /** Minutes after IST midnight. */
  minutes: number;
  stepMinutes: number;
  invalid: boolean;
  onChange: (minutes: number) => void;
};

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function Chip({
  label,
  active,
  invalid,
  onPress,
}: {
  label: string;
  active: boolean;
  invalid: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.chip, active && (invalid ? styles.chipBad : styles.chipOn)]}
    >
      <Text style={[styles.chipText, active && (invalid ? styles.chipTextBad : styles.chipTextOn)]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ScheduleTimePicker({ minutes, stepMinutes, invalid, onChange }: Props) {
  const h24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const pm = h24 >= 12;
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const minuteOptions = Array.from({ length: 60 / stepMinutes }, (_, i) => i * stepMinutes);

  const set = (next: { hour12?: number; minute?: number; pm?: boolean }) => {
    const h = next.hour12 ?? hour12;
    const isPm = next.pm ?? pm;
    const base = h % 12 + (isPm ? 12 : 0);
    onChange(base * 60 + (next.minute ?? minute));
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.bigTime, invalid && styles.bigTimeBad]}>{minutesToLabel(minutes)}</Text>

      <Text style={styles.label}>Hour</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {HOURS.map((h) => (
          <Chip
            key={h}
            label={String(h)}
            active={h === hour12}
            invalid={invalid}
            onPress={() => set({ hour12: h })}
          />
        ))}
      </ScrollView>

      <View style={styles.split}>
        <View style={styles.flex}>
          <Text style={styles.label}>Minute</Text>
          <View style={styles.row}>
            {minuteOptions.map((m) => (
              <Chip
                key={m}
                label={`:${String(m).padStart(2, '0')}`}
                active={m === minute}
                invalid={invalid}
                onPress={() => set({ minute: m })}
              />
            ))}
          </View>
        </View>
        <View>
          <Text style={styles.label}>{' '}</Text>
          <View style={styles.row}>
            <Chip label="AM" active={!pm} invalid={invalid} onPress={() => set({ pm: false })} />
            <Chip label="PM" active={pm} invalid={invalid} onPress={() => set({ pm: true })} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  bigTime: {
    fontFamily: fonts.uiSemi,
    fontSize: 28,
    color: C.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  bigTimeBad: { color: C.error },
  label: { fontFamily: fonts.uiMedium, fontSize: 11, color: C.textSec, letterSpacing: 0.3 },
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  split: { flexDirection: 'row', gap: 12, marginTop: 4 },
  flex: { flex: 1 },
  chip: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.white,
  },
  chipOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  chipBad: { borderColor: C.error, backgroundColor: C.errorSoft },
  chipText: { fontFamily: fonts.uiMedium, fontSize: 13, color: C.text },
  chipTextOn: { color: C.orangeDark },
  chipTextBad: { color: C.error },
});
