import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';

import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  minutes: number;
  stepMinutes: number;
  onChange: (minutes: number) => void;
};

type Field = 'hour' | 'minute' | 'period';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function ScheduleTimeDropdowns({ minutes, stepMinutes, onChange }: Props) {
  const [open, setOpen] = useState<Field | null>(null);
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const pm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const step = Math.min(30, Math.max(1, stepMinutes || 15));
  const minuteOptions = Array.from({ length: Math.floor(60 / step) }, (_, i) => i * step);

  const commit = (next: { hour12?: number; minute?: number; pm?: boolean }) => {
    const hour = next.hour12 ?? hour12;
    const isPm = next.pm ?? pm;
    onChange((hour % 12 + (isPm ? 12 : 0)) * 60 + (next.minute ?? minute));
  };

  const options =
    open === 'hour'
      ? HOURS.map((hour) => ({
          key: String(hour),
          label: String(hour),
          on: hour === hour12,
          pick: () => commit({ hour12: hour }),
        }))
      : open === 'minute'
        ? minuteOptions.map((value) => ({
            key: String(value),
            label: String(value).padStart(2, '0'),
            on: value === minute,
            pick: () => commit({ minute: value }),
          }))
        : open === 'period'
          ? [
              { key: 'AM', label: 'AM', on: !pm, pick: () => commit({ pm: false }) },
              { key: 'PM', label: 'PM', on: pm, pick: () => commit({ pm: true }) },
            ]
          : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Part
          label="Hour"
          value={String(hour12)}
          active={open === 'hour'}
          onPress={() => setOpen(open === 'hour' ? null : 'hour')}
        />
        <Text style={styles.colon}>:</Text>
        <Part
          label="Min"
          value={String(minute).padStart(2, '0')}
          active={open === 'minute'}
          onPress={() => setOpen(open === 'minute' ? null : 'minute')}
        />
        <Part
          label=" "
          value={pm ? 'PM' : 'AM'}
          active={open === 'period'}
          compact
          onPress={() => setOpen(open === 'period' ? null : 'period')}
        />
      </View>

      {open ? (
        <View style={styles.menu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, option.on && styles.chipOn]}
              onPress={() => {
                option.pick();
                setOpen(open === 'hour' ? 'minute' : open === 'minute' ? 'period' : null);
              }}
            >
              <Text style={[styles.chipText, option.on && styles.chipTextOn]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.hint}>Tap hour, minute, or AM/PM to change it</Text>
      )}
    </View>
  );
}

function Part({
  label,
  value,
  active,
  compact,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.part, active && styles.partOn, compact && styles.partCompact]} onPress={onPress}>
      <Text style={[styles.value, active && styles.valueOn]}>{value}</Text>
      <View style={styles.partMeta}>
        {label.trim() ? <Text style={styles.partLabel}>{label}</Text> : null}
        <ChevronDown color={active ? C.orangeDark : C.textMuted} size={14} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  colon: { fontFamily: fonts.displayBold, fontSize: 32, color: C.textMuted, marginBottom: 14 },
  part: { alignItems: 'center', minWidth: 72, borderRadius: 14, paddingVertical: 6 },
  partCompact: { minWidth: 64, marginLeft: 8 },
  partOn: { backgroundColor: C.orangeSoft },
  value: { fontFamily: fonts.displayBold, fontSize: 36, color: C.text, lineHeight: 40 },
  valueOn: { color: C.orangeDark },
  partMeta: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  partLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  hint: { fontFamily: fonts.ui, fontSize: 12, color: C.textMuted, textAlign: 'center' },
  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    width: 68,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipOn: { backgroundColor: C.orange, borderColor: C.orange },
  chipText: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.text },
  chipTextOn: { color: C.white },
});
