import { AlertCircle, CheckCircle2, Clock3, X } from 'lucide-react-native';
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
          <View style={styles.titleCopy}>
            <Text style={styles.title}>Schedule delivery</Text>
            <Text style={styles.subtitle}>Pick a day and time the restaurant is open</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.close} accessibilityLabel="Close">
            <X size={18} color={C.textSec} />
          </TouchableOpacity>
        </View>

        {activeDay?.windows.length ? (
          <View style={styles.hoursPill}>
            <Clock3 size={14} color={C.orangeDark} />
            <Text style={styles.hoursText}>Open {formatWindows(activeDay.windows)}</Text>
          </View>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          <Text style={styles.sectionLabel}>Day</Text>
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
            stepMinutes={policy.stepMinutes}
            onChange={(next) => {
              setServerError(null);
              setMinutes(next);
            }}
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={[styles.status, check.ok ? styles.statusOk : styles.statusBad]}>
            {check.ok ? <CheckCircle2 size={16} color={C.ok} /> : <AlertCircle size={16} color={C.error} />}
            <Text style={[styles.statusText, check.ok ? styles.statusTextOk : styles.statusTextBad]}>
              {check.ok ? 'Within restaurant hours' : error}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.cta, (!check.ok || saving) && styles.ctaOff]}
            disabled={!check.ok || saving}
            onPress={() => void confirm()}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.ctaText}>{label ? `Schedule · ${label}` : 'Choose an open time'}</Text>
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
    backgroundColor: '#F6F7F9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '88%',
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
  hoursPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.orangeSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  hoursText: { fontFamily: fonts.uiSemi, fontSize: 12, color: C.orangeDark },
  sectionLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: C.text,
    marginBottom: 8,
  },
  days: { gap: 8, paddingBottom: 16 },
  day: {
    width: 76,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  dayOn: { backgroundColor: C.orange, borderColor: C.orange },
  dayOff: { backgroundColor: C.disabledBg },
  dayName: { fontFamily: fonts.ui, fontSize: 11, color: C.textSec },
  dayNameOn: { color: '#FFEDD5' },
  dayNum: { fontFamily: fonts.displayBold, fontSize: 18, color: C.text },
  dayNumOn: { color: C.white },
  dayOffText: { color: C.textMuted },
  body: { paddingBottom: 8 },
  footer: {
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
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
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaOff: { backgroundColor: C.textMuted },
  ctaText: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.white, textAlign: 'center' },
});
