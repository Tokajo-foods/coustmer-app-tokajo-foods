import { CalendarClock, Check, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScheduleOrderSheet } from '@/components/order/schedule/ScheduleOrderSheet';
import { SCHEDULE_COLORS as C } from '@/components/order/schedule/schedule-theme';
import { fonts } from '@/constants/typography';
import {
  DEFAULT_SCHEDULE_POLICY,
  formatScheduledForDisplay,
  type ScheduleSlotsResponse,
} from '@/lib/cart/schedule';

type Props = {
  scheduleData: ScheduleSlotsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  scheduledFor: string | null;
  busy?: boolean;
  onRetry?: () => void;
  onSelectNow: () => void;
  onSelectSlot: (startIso: string) => Promise<void>;
};

export function ScheduleOrderSection({
  scheduleData,
  isLoading,
  isError,
  scheduledFor,
  busy = false,
  onRetry,
  onSelectNow,
  onSelectSlot,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const days = scheduleData?.days ?? [];
  const policy = scheduleData?.policy ?? DEFAULT_SCHEDULE_POLICY;
  const unsupported = scheduleData?.scheduleSupported === false;
  const bookable = days.some((day) => day.slots.some((slot) => slot.available));
  const scheduledLabel = formatScheduledForDisplay(scheduledFor);
  const isLater = Boolean(scheduledFor);

  const openSheet = () => {
    if (unsupported || isLoading || isError || !bookable) return;
    setSheetOpen(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>When do you want it?</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.option, !isLater && styles.optionOn]}
          onPress={onSelectNow}
          disabled={busy || !isLater}
          activeOpacity={0.88}
        >
          <View style={[styles.icon, !isLater && styles.iconOn]}>
            <Zap color={!isLater ? C.white : C.orange} size={16} strokeWidth={2.4} />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleLine}>
              <Text style={styles.optionTitle}>Order now</Text>
              {!isLater ? <Check color={C.orange} size={16} strokeWidth={2.6} /> : null}
            </View>
            <Text style={styles.optionHint}>As soon as it is ready</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            isLater && styles.optionOn,
            (unsupported || (!isLoading && !bookable)) && styles.optionOff,
          ]}
          onPress={openSheet}
          disabled={busy || unsupported}
          activeOpacity={0.88}
        >
          <View style={[styles.icon, isLater && styles.iconOn]}>
            <CalendarClock color={isLater ? C.white : C.orange} size={16} strokeWidth={2.3} />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleLine}>
              <Text style={styles.optionTitle}>Schedule</Text>
              {isLater ? <Check color={C.orange} size={16} strokeWidth={2.6} /> : null}
            </View>
            <Text style={styles.optionHint} numberOfLines={2}>
              {isLater && scheduledLabel ? scheduledLabel : 'Pick a time'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.inline}>
          <ActivityIndicator color={C.orange} size="small" />
          <Text style={styles.hint}>Checking restaurant hours…</Text>
        </View>
      ) : isError ? (
        <TouchableOpacity onPress={onRetry} disabled={!onRetry}>
          <Text style={styles.hintError}>
            Could not load available times.{onRetry ? ' Tap to retry.' : ''}
          </Text>
        </TouchableOpacity>
      ) : unsupported ? (
        <Text style={styles.hint}>This restaurant does not accept scheduled orders.</Text>
      ) : !bookable ? (
        <Text style={styles.hint}>
          No times in the next {policy.maxAdvanceDays} days. Order now is available.
        </Text>
      ) : (
        <Text style={styles.hint}>
          Schedule up to {policy.maxAdvanceDays} days ahead, inside restaurant hours.
        </Text>
      )}

      {sheetOpen ? (
        <ScheduleOrderSheet
          visible={sheetOpen}
          days={days}
          policy={policy}
          scheduledFor={scheduledFor}
          onClose={() => setSheetOpen(false)}
          onConfirm={onSelectSlot}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  title: { fontFamily: fonts.uiSemi, fontSize: 16, color: C.text },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: C.white,
    minHeight: 118,
  },
  optionOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  optionOff: { opacity: 0.5 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.orangeSoft,
  },
  iconOn: { backgroundColor: C.orange },
  copy: { gap: 2 },
  titleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionTitle: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.text },
  optionHint: { fontFamily: fonts.ui, fontSize: 12, color: C.textSec },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { fontFamily: fonts.ui, fontSize: 12, color: C.textSec, lineHeight: 18 },
  hintError: { fontFamily: fonts.ui, fontSize: 12, color: C.error, lineHeight: 18 },
});
