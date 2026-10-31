import { AlertCircle, CheckCircle2, X } from 'lucide-react-native';
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
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.title}>Schedule order</Text>
            <Text style={styles.subtitle}>
              {activeDay?.windows.length
                ? `Restaurant hours ${formatWindows(activeDay.windows)}`
                : 'Choose a time from the dropdowns'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.close} accessibilityLabel="Close">
            <X size={18} color={C.textSec} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
          {days.map((day) => {
            const open = firstAvailableMinutes(day) != null;
            const on = day.date === date;
            return (
              <TouchableOpacity
                key={day.date}
                style={[styles.day, on && styles.dayOn, !open && styles.dayOff]}
                disabled={!open}
                onPress={() => pickDate(day.date)}
                activeOpacity={0.85}
              >
                <Text style={[styles.dayText, on && styles.dayTextOn, !open && styles.dayTextOff]}>
                  {formatScheduleDayLabel(day.date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <ScheduleTimeDropdowns
            minutes={minutes}
            stepMinutes={policy.stepMinutes}
            valid={check.ok}
            onChange={(next) => {
              setServerError(null);
              setMinutes(next);
            }}
          />
          <View style={[styles.status, check.ok ? styles.statusOk : styles.statusBad]}>
            {check.ok ? (
              <CheckCircle2 size={16} color={C.ok} />
            ) : (
              <AlertCircle size={16} color={C.error} />
            )}
            <Text style={[styles.statusText, check.ok ? styles.statusTextOk : styles.statusTextBad]}>
              {check.ok ? 'This time is within restaurant hours' : error}
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.cta, (!check.ok || saving) && styles.ctaOff]}
          disabled={!check.ok || saving}
          onPress={() => void confirm()}
          activeOpacity={0.9}
        >
          {saving ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={styles.ctaText}>{label ? `Confirm · ${label}` : 'Pick a time inside restaurant hours'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  titleCopy: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.displayBold, fontSize: 20, color: C.text },
  subtitle: { fontFamily: fonts.ui, fontSize: 13, color: C.textSec },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.disabledBg,
  },
  days: { gap: 8, paddingBottom: 8 },
  day: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  dayOn: { backgroundColor: C.orange, borderColor: C.orange },
  dayOff: { backgroundColor: C.disabledBg },
  dayText: { fontFamily: fonts.uiSemi, fontSize: 13, color: C.text },
  dayTextOn: { color: C.white },
  dayTextOff: { color: C.textMuted },
  body: { gap: 12, paddingBottom: 8 },
  status: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  statusOk: { backgroundColor: C.okSoft, borderColor: C.okBorder },
  statusBad: { backgroundColor: C.errorSoft, borderColor: C.errorBorder },
  statusText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 18 },
  statusTextOk: { color: C.ok },
  statusTextBad: { color: C.error },
  cta: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaOff: { backgroundColor: C.textMuted },
  ctaText: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.white, textAlign: 'center' },
});
