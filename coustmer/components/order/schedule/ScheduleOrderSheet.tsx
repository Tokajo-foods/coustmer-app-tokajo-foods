import { AlertCircle, CalendarClock, X } from 'lucide-react-native';
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

import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleTimePicker } from './ScheduleTimePicker';
import { SCHEDULE_COLORS as C } from './schedule-theme';

type Props = {
  visible: boolean;
  days: ScheduleDay[];
  policy: SchedulePolicy;
  scheduledFor: string | null;
  onClose: () => void;
  /** Rejects with the server message when the slot is refused. */
  onConfirm: (iso: string) => Promise<void>;
};

function initialChoice(days: ScheduleDay[], scheduledFor: string | null) {
  const saved = scheduledFor ? isoToIstChoice(scheduledFor) : null;
  if (saved && days.some((d) => d.date === saved.date)) return saved;
  const day = days.find((d) => firstAvailableMinutes(d) != null);
  return { date: day?.date ?? days[0]?.date ?? '', minutes: firstAvailableMinutes(day) ?? 12 * 60 };
}

export function ScheduleOrderSheet({ visible, days, policy, scheduledFor, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState(() => initialChoice(days, scheduledFor));
  const [notice, setNotice] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!visible) return;
    setChoice(initialChoice(days, scheduledFor));
    setNotice(null);
    setServerError(null);
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const check = useMemo(
    () => validateScheduleChoice(choice, days, policy, now),
    [choice, days, policy, now],
  );
  const activeDay = days.find((d) => d.date === choice.date);
  const error = notice ?? serverError ?? (check.ok ? null : check.message);

  const pickDate = (date: string) => {
    setNotice(null);
    setServerError(null);
    const day = days.find((d) => d.date === date);
    const keep = validateScheduleChoice({ date, minutes: choice.minutes }, days, policy, now).ok;
    setChoice({ date, minutes: keep ? choice.minutes : firstAvailableMinutes(day) ?? choice.minutes });
  };

  const pickTime = (minutes: number) => {
    setNotice(null);
    setServerError(null);
    setChoice((c) => ({ ...c, minutes }));
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
          <CalendarClock size={18} color={C.orange} />
          <Text style={styles.title}>Schedule order</Text>
          <TouchableOpacity onPress={onClose} style={styles.close} accessibilityLabel="Close">
            <X size={18} color={C.textSec} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <ScheduleCalendar
            days={days}
            policy={policy}
            selectedDate={choice.date}
            onSelect={pickDate}
            onBlocked={(msg) => setNotice(msg)}
          />

          {activeDay?.windows.length ? (
            <Text style={styles.hours}>
              Available on {formatScheduleDayLabel(choice.date)}: {formatWindows(activeDay.windows)}
              {'\n'}Your order goes to the restaurant at the time you pick.
            </Text>
          ) : null}

          <ScheduleTimePicker
            minutes={choice.minutes}
            stepMinutes={policy.stepMinutes}
            invalid={!check.ok}
            onChange={pickTime}
          />

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={C.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
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
            <Text style={styles.ctaText}>
              {check.ok
                ? `Schedule for ${formatScheduledForDisplay(check.iso) ?? 'this time'}`
                : 'Pick a valid date & time'}
            </Text>
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { flex: 1, fontFamily: fonts.uiSemi, fontSize: 17, color: C.text },
  close: { padding: 6 },
  body: { gap: 14, paddingBottom: 12 },
  hours: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: C.orangeDark,
    backgroundColor: C.orangeSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: C.errorSoft,
    borderWidth: 1,
    borderColor: C.errorBorder,
    borderRadius: 12,
    padding: 12,
  },
  errorText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, color: C.error, lineHeight: 18 },
  cta: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaOff: { backgroundColor: C.textMuted },
  ctaText: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.white },
});
