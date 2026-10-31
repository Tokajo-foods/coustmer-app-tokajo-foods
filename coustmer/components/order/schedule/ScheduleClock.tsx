import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { minutesToLabel } from '@/lib/cart/schedule-validation';

import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  minutes: number;
  stepMinutes: number;
  valid: boolean;
  onChange: (minutes: number) => void;
};

const SIZE = 268;
const MARK = 40;

function place(index: number, count: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  const radius = SIZE / 2 - 28;
  return {
    left: SIZE / 2 + radius * Math.cos(angle) - MARK / 2,
    top: SIZE / 2 + radius * Math.sin(angle) - MARK / 2,
  };
}

export function ScheduleClock({ minutes, stepMinutes, valid, onChange }: Props) {
  const [face, setFace] = useState<'hour' | 'minute'>('hour');
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const pm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const step = Math.min(30, Math.max(1, stepMinutes || 15));
  const minuteMarks = Array.from({ length: Math.floor(60 / step) }, (_, i) => i * step);
  const handIndex = face === 'hour' ? hour12 % 12 : minuteMarks.indexOf(minute);
  const handCount = face === 'hour' ? 12 : minuteMarks.length;
  const handDeg = handIndex < 0 ? 0 : (handIndex / handCount) * 360;

  const commit = (next: { hour12?: number; minute?: number; pm?: boolean }) => {
    const h = next.hour12 ?? hour12;
    const isPm = next.pm ?? pm;
    const base = (h % 12) + (isPm ? 12 : 0);
    onChange(base * 60 + (next.minute ?? minute));
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.readout, !valid && styles.readoutBad]}>{minutesToLabel(minutes)}</Text>
      <View style={styles.face}>
        <View
          style={[
            styles.hand,
            { transform: [{ rotate: `${handDeg}deg` }] },
          ]}
        />
        <View style={[styles.hub, !valid && styles.hubBad]} />
        {face === 'hour'
          ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, index) => {
              const on = hour === hour12;
              return (
                <TouchableOpacity
                  key={hour}
                  style={[styles.mark, place(index, 12), on && styles.markOn]}
                  onPress={() => {
                    commit({ hour12: hour });
                    setFace('minute');
                  }}
                >
                  <Text style={[styles.markText, on && styles.markTextOn]}>{hour}</Text>
                </TouchableOpacity>
              );
            })
          : minuteMarks.map((value, index) => {
              const on = value === minute;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.mark, place(index, minuteMarks.length), on && styles.markOn]}
                  onPress={() => commit({ minute: value })}
                >
                  <Text style={[styles.markText, on && styles.markTextOn]}>
                    {String(value).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              );
            })}
      </View>
      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switch, face === 'hour' && styles.switchOn]}
          onPress={() => setFace('hour')}
        >
          <Text style={[styles.switchText, face === 'hour' && styles.switchTextOn]}>Hour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switch, face === 'minute' && styles.switchOn]}
          onPress={() => setFace('minute')}
        >
          <Text style={[styles.switchText, face === 'minute' && styles.switchTextOn]}>Minute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switch, !pm && styles.switchOn]}
          onPress={() => commit({ pm: false })}
        >
          <Text style={[styles.switchText, !pm && styles.switchTextOn]}>AM</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switch, pm && styles.switchOn]}
          onPress={() => commit({ pm: true })}
        >
          <Text style={[styles.switchText, pm && styles.switchTextOn]}>PM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  readout: { fontFamily: fonts.displayBold, fontSize: 32, color: C.ok },
  readoutBad: { color: C.error },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: C.border,
  },
  hand: {
    position: 'absolute',
    left: SIZE / 2 - 1.5,
    top: 36,
    width: 3,
    height: SIZE / 2 - 36,
    borderRadius: 2,
    backgroundColor: C.orange,
    transformOrigin: 'center bottom',
  },
  hub: {
    position: 'absolute',
    left: SIZE / 2 - 6,
    top: SIZE / 2 - 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.orange,
  },
  hubBad: { backgroundColor: C.error },
  mark: {
    position: 'absolute',
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: C.orange },
  markText: { fontFamily: fonts.uiSemi, fontSize: 14, color: C.text },
  markTextOn: { color: C.white },
  switchRow: { flexDirection: 'row', gap: 8 },
  switch: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  switchOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  switchText: { fontFamily: fonts.uiSemi, fontSize: 13, color: C.textSec },
  switchTextOn: { color: C.orangeDark },
});
