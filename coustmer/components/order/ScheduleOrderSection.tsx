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
            <Zap color={!isLater ? C.white : C.orange} size={14} strokeWidth={2.4} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.optionTitle} numberOfLines={1}>Order now</Text>
            <Text style={styles.optionHint} numberOfLines={1}>As soon as ready</Text>
          </View>
          {!isLater ? <Check color={C.orange} size={14} strokeWidth={2.6} /> : null}
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
            <CalendarClock color={isLater ? C.white : C.orange} size={14} strokeWidth={2.3} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.optionTitle} numberOfLines={1}>Schedule</Text>
            <Text style={styles.optionHint} numberOfLines={1}>
              {isLater && scheduledLabel ? scheduledLabel : 'Pick a time'}
            </Text>
          </View>
          {isLater ? <Check color={C.orange} size={14} strokeWidth={2.6} /> : null}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    gap: 8,
  },
  title: { fontFamily: fonts.uiSemi, fontSize: 15, color: C.text },
  row: { flexDirection: 'row', gap: 8 },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: C.white,
  },
  optionOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  optionOff: { opacity: 0.5 },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.orangeSoft,
  },
  iconOn: { backgroundColor: C.orange },
  copy: { flex: 1, gap: 1 },
  optionTitle: { fontFamily: fonts.uiSemi, fontSize: 13, color: C.text },
  optionHint: { fontFamily: fonts.ui, fontSize: 11, color: C.textSec },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { fontFamily: fonts.ui, fontSize: 12, color: C.textSec, lineHeight: 18 },
  hintError: { fontFamily: fonts.ui, fontSize: 12, color: C.error, lineHeight: 18 },
});
