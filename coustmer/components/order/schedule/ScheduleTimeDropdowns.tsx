import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';

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
      <View style={[styles.display, valid ? styles.displayOk : styles.displayBad]}>
        <Text style={[styles.digit, !valid && styles.digitBad]}>{hour12}</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={[styles.digit, !valid && styles.digitBad]}>{String(minute).padStart(2, '0')}</Text>
        <Text style={[styles.period, !valid && styles.digitBad]}>{pm ? 'PM' : 'AM'}</Text>
      </View>

      <View style={styles.row}>
        <FieldButton
          label="Hour"
          value={String(hour12)}
          active={open === 'hour'}
          onPress={() => setOpen(open === 'hour' ? null : 'hour')}
        />
        <FieldButton
          label="Minute"
          value={String(minute).padStart(2, '0')}
          active={open === 'minute'}
          onPress={() => setOpen(open === 'minute' ? null : 'minute')}
        />
        <FieldButton
          label="AM / PM"
          value={pm ? 'PM' : 'AM'}
          active={open === 'period'}
          onPress={() => setOpen(open === 'period' ? null : 'period')}
        />
      </View>

      {open ? (
        <View style={styles.menu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, option.on && styles.chipOn, open === 'period' && styles.chipWide]}
              onPress={() => {
                option.pick();
                setOpen(open === 'hour' ? 'minute' : open === 'minute' ? 'period' : null);
              }}
            >
              <Text style={[styles.chipText, option.on && styles.chipTextOn]}>{option.label}</Text>
              {option.on ? <Check color={C.white} size={14} strokeWidth={2.8} /> : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function FieldButton({
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
    <TouchableOpacity style={[styles.field, active && styles.fieldOn]} onPress={onPress} activeOpacity={0.88}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        <Text style={styles.fieldValue}>{value}</Text>
        <ChevronDown color={active ? C.orangeDark : C.textMuted} size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  display: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
  },
  displayOk: { backgroundColor: C.okSoft, borderColor: C.okBorder },
  displayBad: { backgroundColor: C.errorSoft, borderColor: C.errorBorder },
  digit: { fontFamily: fonts.displayBold, fontSize: 40, color: C.text, lineHeight: 44 },
  digitBad: { color: C.error },
  colon: { fontFamily: fonts.displayBold, fontSize: 36, color: C.textMuted, marginBottom: 2 },
  period: { fontFamily: fonts.uiSemi, fontSize: 16, color: C.textSec, marginLeft: 6, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  field: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  fieldLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldValueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldValue: { fontFamily: fonts.uiSemi, fontSize: 18, color: C.text },
  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.border,
  },
  chip: {
    minWidth: 64,
    flexGrow: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipWide: { minWidth: '46%' },
  chipOn: { backgroundColor: C.orange, borderColor: C.orange },
  chipText: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.text },
  chipTextOn: { color: C.white },
});
