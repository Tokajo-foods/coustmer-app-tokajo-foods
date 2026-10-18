import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { istTodayYmd, type ScheduleDay, type SchedulePolicy } from '@/lib/cart/schedule';
import { dateBlockReason } from '@/lib/cart/schedule-validation';

import { SCHEDULE_COLORS as C } from './schedule-theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Props = {
  days: ScheduleDay[];
  policy: SchedulePolicy;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onBlocked: (message: string) => void;
};

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function monthCells(year: number, month: number): (string | null)[] {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: firstDow }, () => null);
  for (let d = 1; d <= count; d++) cells.push(ymd(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ScheduleCalendar({ days, policy, selectedDate, onSelect, onBlocked }: Props) {
  const today = istTodayYmd();
  const lastDate = days[days.length - 1]?.date ?? today;
  const months = useMemo(() => {
    const keys = new Set([today.slice(0, 7), lastDate.slice(0, 7)]);
    return [...keys].sort();
  }, [today, lastDate]);
  const [monthKey, setMonthKey] = useState((selectedDate ?? today).slice(0, 7));
  const monthIndex = Math.max(0, months.indexOf(monthKey));
  const [year, month] = (months[monthIndex] ?? today.slice(0, 7)).split('-').map(Number);
  const cells = useMemo(() => monthCells(year!, month! - 1), [year, month]);

  const go = (delta: number) => {
    const next = months[monthIndex + delta];
    if (next) setMonthKey(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => go(-1)}
          disabled={monthIndex === 0}
          style={[styles.navBtn, monthIndex === 0 && styles.navOff]}
          accessibilityLabel="Previous month"
        >
          <ChevronLeft size={18} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTHS[month! - 1]} {year}
        </Text>
        <TouchableOpacity
          onPress={() => go(1)}
          disabled={monthIndex >= months.length - 1}
          style={[styles.navBtn, monthIndex >= months.length - 1 && styles.navOff]}
          accessibilityLabel="Next month"
        >
          <ChevronRight size={18} color={C.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((w, i) => (
          <Text key={`${w}-${i}`} style={styles.weekday}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={`empty-${i}`} style={styles.cell} />;
          const blocked = dateBlockReason(date, days, policy);
          const selected = date === selectedDate;
          const isToday = date === today;
          return (
            <TouchableOpacity
              key={date}
              style={styles.cell}
              activeOpacity={0.8}
              onPress={() => (blocked ? onBlocked(blocked) : onSelect(date))}
              accessibilityLabel={`${date}${blocked ? ', unavailable' : ''}`}
            >
              <View
                style={[
                  styles.dayCircle,
                  selected && styles.daySelected,
                  !selected && !blocked && styles.dayOpen,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    blocked && styles.dayTextOff,
                    selected && styles.dayTextSelected,
                  ]}
                >
                  {Number(date.slice(8))}
                </Text>
              </View>
              {isToday ? <View style={[styles.todayDot, selected && styles.todayDotOn]} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.caption}>
        Schedule up to {policy.maxAdvanceDays} days ahead · greyed dates are unavailable
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  navOff: { opacity: 0.35 },
  monthLabel: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.text },
  row: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: C.textMuted,
    paddingVertical: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3, height: 46 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOpen: { backgroundColor: C.orangeSoft, borderWidth: 1, borderColor: C.orangeBorder },
  daySelected: { backgroundColor: C.orange },
  dayText: { fontFamily: fonts.uiMedium, fontSize: 13, color: C.text },
  dayTextOff: { color: C.textMuted, textDecorationLine: 'line-through' },
  dayTextSelected: { color: C.white, fontFamily: fonts.uiSemi },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.orange, marginTop: 2 },
  todayDotOn: { backgroundColor: C.orangeDark },
  caption: { fontFamily: fonts.ui, fontSize: 11, color: C.textSec, textAlign: 'center' },
});
