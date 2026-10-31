import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';

import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  minutes: number;
  onChange: (minutes: number) => void;
};

type Field = 'hour' | 'minute';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function ScheduleTimeDropdowns({ minutes, onChange }: Props) {
  const [open, setOpen] = useState<Field | null>(null);
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const pm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const commit = (next: { hour12?: number; minute?: number; pm?: boolean }) => {
    const hour = next.hour12 ?? hour12;
    const isPm = next.pm ?? pm;
    onChange((hour % 12 + (isPm ? 12 : 0)) * 60 + (next.minute ?? minute));
  };

  const options = open === 'hour' ? HOURS : open === 'minute' ? MINUTES : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Cell
          value={String(hour12)}
          active={open === 'hour'}
          onPress={() => setOpen(open === 'hour' ? null : 'hour')}
        />
        <Text style={styles.colon}>:</Text>
        <Cell
          value={String(minute).padStart(2, '0')}
          active={open === 'minute'}
          onPress={() => setOpen(open === 'minute' ? null : 'minute')}
        />
        <View style={styles.period}>
          <TouchableOpacity
            style={[styles.periodHalf, !pm && styles.periodOn]}
            onPress={() => commit({ pm: false })}
          >
            <Text style={[styles.periodText, !pm && styles.periodTextOn]}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodHalf, pm && styles.periodOn]}
            onPress={() => commit({ pm: true })}
          >
            <Text style={[styles.periodText, pm && styles.periodTextOn]}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>

      {open ? (
        <ScrollView style={styles.menu} contentContainerStyle={styles.menuGrid} nestedScrollEnabled>
          {options.map((value) => {
            const on = open === 'hour' ? value === hour12 : value === minute;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.option, on && styles.optionOn]}
                onPress={() => {
                  if (open === 'hour') commit({ hour12: value });
                  else commit({ minute: value });
                  setOpen(open === 'hour' ? 'minute' : null);
                }}
              >
                <Text style={[styles.optionText, on && styles.optionTextOn]}>
                  {open === 'minute' ? String(value).padStart(2, '0') : String(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

function Cell({ value, active, onPress }: { value: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.cell, active && styles.cellOn]} onPress={onPress}>
      <Text style={[styles.value, active && styles.valueOn]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cell: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  value: { fontFamily: fonts.displayBold, fontSize: 22, color: C.text },
  valueOn: { color: C.orange },
  colon: { fontFamily: fonts.displayBold, fontSize: 22, color: C.textMuted },
  period: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  periodHalf: { width: 44, alignItems: 'center', justifyContent: 'center' },
  periodOn: { backgroundColor: C.orange },
  periodText: { fontFamily: fonts.uiSemi, fontSize: 13, color: C.textSec, letterSpacing: 0.3 },
  periodTextOn: { color: C.white },
  menu: { maxHeight: 168 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  option: {
    width: '15.5%',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionOn: { backgroundColor: C.orange },
  optionText: { fontFamily: fonts.uiMedium, fontSize: 14, color: C.text },
  optionTextOn: { color: C.white },
});
