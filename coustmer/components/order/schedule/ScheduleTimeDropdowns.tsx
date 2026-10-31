import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { minutesToLabel } from '@/lib/cart/schedule-validation';

import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  minutes: number;
  stepMinutes: number;
  valid: boolean;
  onChange: (minutes: number) => void;
};

type Field = 'hour' | 'minute' | 'period';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function ScheduleTimeDropdowns({ minutes, stepMinutes, valid, onChange }: Props) {
  const [open, setOpen] = useState<Field | null>('hour');
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const pm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const step = Math.min(30, Math.max(1, stepMinutes || 15));
  const minuteOptions = Array.from({ length: Math.floor(60 / step) }, (_, i) => i * step);

  const commit = (next: { hour12?: number; minute?: number; pm?: boolean }) => {
    const hour = next.hour12 ?? hour12;
    const isPm = next.pm ?? pm;
    const base = (hour % 12) + (isPm ? 12 : 0);
    onChange(base * 60 + (next.minute ?? minute));
  };

  const options =
    open === 'hour'
      ? HOURS.map((hour) => ({ key: String(hour), label: String(hour), on: hour === hour12, pick: () => commit({ hour12: hour }) }))
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
      <Text style={[styles.readout, !valid && styles.readoutBad]}>{minutesToLabel(minutes)}</Text>
      <View style={styles.row}>
        <DropdownField
          label="Hour"
          value={String(hour12)}
          active={open === 'hour'}
          onPress={() => setOpen(open === 'hour' ? null : 'hour')}
        />
        <DropdownField
          label="Minute"
          value={String(minute).padStart(2, '0')}
          active={open === 'minute'}
          onPress={() => setOpen(open === 'minute' ? null : 'minute')}
        />
        <DropdownField
          label="AM / PM"
          value={pm ? 'PM' : 'AM'}
          active={open === 'period'}
          onPress={() => setOpen(open === 'period' ? null : 'period')}
        />
      </View>
      {open ? (
        <ScrollView style={styles.menu} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.option, option.on && styles.optionOn]}
              onPress={() => {
                option.pick();
                setOpen(open === 'hour' ? 'minute' : open === 'minute' ? 'period' : null);
              }}
            >
              <Text style={[styles.optionText, option.on && styles.optionTextOn]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function DropdownField({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.field, active && styles.fieldOn]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        <Text style={styles.fieldValue}>{value}</Text>
        <ChevronDown color={active ? C.orangeDark : C.textSec} size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  readout: { fontFamily: fonts.displayBold, fontSize: 28, color: C.ok, textAlign: 'center' },
  readoutBad: { color: C.error },
  row: { flexDirection: 'row', gap: 8 },
  field: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  fieldOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  fieldLabel: { fontFamily: fonts.ui, fontSize: 11, color: C.textSec },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  fieldValue: { fontFamily: fonts.uiSemi, fontSize: 16, color: C.text },
  menu: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.white,
  },
  option: { paddingHorizontal: 14, paddingVertical: 12 },
  optionOn: { backgroundColor: C.orangeSoft },
  optionText: { fontFamily: fonts.uiMedium, fontSize: 15, color: C.text },
  optionTextOn: { color: C.orangeDark, fontFamily: fonts.uiSemi },
});
