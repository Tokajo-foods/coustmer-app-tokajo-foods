import { CalendarClock, Clock3 } from 'lucide-react-native';
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
  /** Saves the slot on the cart; rejects with the server message. */
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
  const bookable = days.some((d) => d.slots.some((s) => s.available));
  const scheduledLabel = formatScheduledForDisplay(scheduledFor);
  const isLater = Boolean(scheduledFor);

  const openSheet = () => {
    if (unsupported || isLoading || isError || !bookable) return;
    setSheetOpen(true);
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Clock3 color={C.orange} size={16} strokeWidth={2.2} />
        <Text style={styles.title}>When should we place it?</Text>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, !isLater && styles.modeChipOn]}
          onPress={onSelectNow}
          disabled={busy || !isLater}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeText, !isLater && styles.modeTextOn]}>Order now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeChip,
            isLater && styles.modeChipOn,
            (unsupported || (!isLoading && !bookable)) && styles.modeChipOff,
          ]}
          onPress={openSheet}
          disabled={busy || unsupported}
          activeOpacity={0.85}
        >
          <CalendarClock size={14} color={isLater ? C.orangeDark : C.textSec} />
          <Text style={[styles.modeText, isLater && styles.modeTextOn]}>Schedule</Text>
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
          No times available in the next {policy.maxAdvanceDays} days. Choose Order now.
        </Text>
      ) : isLater && scheduledLabel ? (
        <View style={styles.selectedBox}>
          <View style={styles.flex}>
            <Text style={styles.selectedLabel}>Scheduled for</Text>
            <Text style={styles.selectedValue}>{scheduledLabel}</Text>
          </View>
          <TouchableOpacity onPress={openSheet} disabled={busy}>
            <Text style={styles.change}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.hint}>
          Prepared and dispatched right away. Or schedule up to {policy.maxAdvanceDays} days ahead
          within restaurant hours.
        </Text>
      )}

      {busy ? <Text style={styles.hint}>Saving…</Text> : null}

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
    padding: 16,
    marginBottom: 4,
    gap: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.uiSemi, fontSize: 16, color: C.text },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 10,
    backgroundColor: C.white,
  },
  modeChipOn: { borderColor: C.orange, backgroundColor: C.orangeSoft },
  modeChipOff: { opacity: 0.5 },
  modeText: { fontFamily: fonts.uiMedium, fontSize: 13, color: C.textSec },
  modeTextOn: { color: C.orangeDark },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hint: { fontFamily: fonts.ui, fontSize: 12, color: C.textSec, lineHeight: 18 },
  hintError: { fontFamily: fonts.ui, fontSize: 12, color: C.error, lineHeight: 18 },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: C.orangeSoft,
    borderWidth: 1,
    borderColor: C.orangeBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  flex: { flex: 1, gap: 2 },
  selectedLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: C.textSec,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectedValue: { fontFamily: fonts.uiSemi, fontSize: 14, color: C.orangeDark },
  change: { fontFamily: fonts.uiSemi, fontSize: 13, color: C.orange },
});
