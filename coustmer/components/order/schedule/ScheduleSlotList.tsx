import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { formatIstTime12h, type ScheduleSlot } from '@/lib/cart/schedule';

import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  slots: ScheduleSlot[];
  selectedIso: string | null;
  onSelect: (slot: ScheduleSlot) => void;
};

const BANDS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

function bandOf(start: string): (typeof BANDS)[number] {
  const hour = Number(start.slice(0, 2));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

export function ScheduleSlotList({ slots, selectedIso, onSelect }: Props) {
  const open = slots.filter((slot) => slot.available && slot.startIso);
  if (open.length === 0) {
    return <Text style={styles.empty}>No times left on this day. Try another date.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {BANDS.map((band) => {
        const rows = open.filter((slot) => bandOf(slot.start) === band);
        if (rows.length === 0) return null;
        return (
          <View key={band} style={styles.band}>
            <Text style={styles.bandTitle}>{band}</Text>
            <View style={styles.grid}>
              {rows.map((slot) => {
                const on = slot.startIso === selectedIso;
                return (
                  <TouchableOpacity
                    key={slot.startIso}
                    style={[styles.slot, on && styles.slotOn]}
                    onPress={() => onSelect(slot)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.slotText, on && styles.slotTextOn]}>
                      {formatIstTime12h(slot.start)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  empty: { fontFamily: fonts.ui, fontSize: 13, color: C.textSec, lineHeight: 18 },
  band: { gap: 8 },
  bandTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: C.textSec,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    minWidth: 92,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
  },
  slotOn: { borderColor: C.orange, backgroundColor: C.orange },
  slotText: { fontFamily: fonts.uiSemi, fontSize: 14, color: C.text },
  slotTextOn: { color: C.white },
});
