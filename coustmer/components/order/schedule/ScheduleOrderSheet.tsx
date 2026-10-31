import { X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';
import {
  formatScheduleDayLabel,
  formatScheduledForDisplay,
  type ScheduleDay,
  type SchedulePolicy,
} from '@/lib/cart/schedule';
import {
  firstAvailableMinutes,
  formatWindows,
  isoToIstChoice,
  validateScheduleChoice,
} from '@/lib/cart/schedule-validation';

import { ScheduleTimeDropdowns } from './ScheduleTimeDropdowns';
import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  visible: boolean;
  days: ScheduleDay[];
  policy: SchedulePolicy;
  scheduledFor: string | null;
  onClose: () => void;
  onConfirm: (iso: string) => Promise<void>;
};

function firstOpenDay(days: ScheduleDay[]): ScheduleDay | undefined {
  return days.find((day) => firstAvailableMinutes(day) != null);
}

function dayTitle(ymd: string): string {
  const label = formatScheduleDayLabel(ymd);
  if (label === 'Today' || label === 'Tomorrow') return label;
  return label.split(',')[0] ?? label;
}

export function ScheduleOrderSheet({ visible, days, policy, scheduledFor, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState('');
  const [minutes, setMinutes] = useState(12 * 60);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!visible) return;
    const saved = scheduledFor ? isoToIstChoice(scheduledFor) : null;
    const savedDay = saved ? days.find((day) => day.date === saved.date) : undefined;
    const day = savedDay ?? firstOpenDay(days) ?? days[0];
    setDate(day?.date ?? '');
    setMinutes(saved && saved.date === day?.date ? saved.minutes : firstAvailableMinutes(day) ?? 12 * 60);
    setServerError(null);
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, [visible, days, scheduledFor]);

  const activeDay = days.find((day) => day.date === date);
  const check = useMemo(
    () => validateScheduleChoice({ date, minutes }, days, policy, now),
    [date, minutes, days, policy, now],
  );
  const error = serverError ?? (check.ok ? null : check.message);
  const label = check.ok ? formatScheduledForDisplay(check.iso) : null;

  const pickDate = (next: string) => {
    setServerError(null);
    const day = days.find((row) => row.date === next);
    setDate(next);
    const stillOk = validateScheduleChoice({ date: next, minutes }, days, policy, Date.now()).ok;
    if (!stillOk) {
      const fallback = firstAvailableMinutes(day);
      if (fallback != null) setMinutes(fallback);
    }
  };

  const confirm = async () => {
    if (!check.ok || saving) return;
    setSaving(true);
    setServerError(null);
    try {
      await onConfirm(check.iso);
      onClose();
    } catch (e) {
      setServerError(e instanceof Error && e.message ? e.message : 'Could not schedule. Try another time.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.handle} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>Schedule</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8} accessibilityLabel="Close">
            <X size={18} color={C.textSec} />
          </TouchableOpacity>
        </View>
        {activeDay?.windows.length ? (
          <Text style={styles.hours}>Open {formatWindows(activeDay.windows)}</Text>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {days.map((day) => {
              const open = firstAvailableMinutes(day) != null;
              const on = day.date === date;
              const name = dayTitle(day.date);
              return (
                <TouchableOpacity
                  key={day.date}
                  style={[styles.day, on && styles.dayOn, !open && styles.dayOff]}
                  disabled={!open}
                  onPress={() => pickDate(day.date)}
                  activeOpacity={0.85}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.dayName, on && styles.dayNameOn, !open && styles.dayOffText]}
                  >
                    {name}
                  </Text>
                  <Text style={[styles.dayNum, on && styles.dayNumOn, !open && styles.dayOffText]}>
                    {Number(day.date.slice(8))}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>Time</Text>
          <ScheduleTimeDropdowns
            minutes={minutes}
            onChange={(next) => {
              setServerError(null);
              setMinutes(next);
            }}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[styles.status, check.ok ? styles.statusOk : styles.statusBad]} numberOfLines={2}>
            {check.ok ? 'Within restaurant hours' : error}
          </Text>
          <TouchableOpacity
            style={[styles.cta, (!check.ok || saving) && styles.ctaOff]}
            disabled={!check.ok || saving}
            onPress={() => void confirm()}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.ctaText}>{label ? 'Confirm' : 'Choose an open time'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontFamily: fonts.displayBold, fontSize: 18, color: C.text },
  hours: { fontFamily: fonts.ui, fontSize: 13, color: C.textSec, marginBottom: 16 },
  sectionLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: C.textSec,
    marginBottom: 8,
  },
  days: { gap: 8, paddingBottom: 18 },
  day: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  dayOn: { backgroundColor: C.text, borderColor: C.text },
  dayOff: { backgroundColor: C.disabledBg },
  dayName: { fontFamily: fonts.ui, fontSize: 11, color: C.textSec },
  dayNameOn: { color: '#E2E8F0' },
  dayNum: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.text },
  dayNumOn: { color: C.white },
  dayOffText: { color: C.textMuted },
  body: { paddingBottom: 4 },
  footer: { gap: 10, paddingTop: 12 },
  status: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 18 },
  statusOk: { color: C.ok },
  statusBad: { color: C.error },
  cta: {
    backgroundColor: C.text,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaOff: { backgroundColor: C.textMuted },
  ctaText: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.white },
});
