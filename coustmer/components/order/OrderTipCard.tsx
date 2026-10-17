import { IndianRupee } from 'lucide-react-native';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import { useUpdateTip } from '@/lib/order/hooks';
import { useAppMoneyConfig } from '@/lib/pricing/money-config';

const ORANGE = '#FF6A00';
const ORANGE_SOFT = '#FFF4EC';
const INK = '#111827';
const MUTED = '#6B7280';
const WHITE = '#FFFFFF';

type Props = { orderId: string; tip: number };

/** Post-place tip chips; presets and the max come from the admin app money config. */
export function OrderTipCard({ orderId, tip }: Props) {
  const updateTip = useUpdateTip(orderId);
  const moneyConfig = useAppMoneyConfig();
  const presets = moneyConfig.data?.tipPresetsInr ?? [];

  const handleTip = (amount: number) => {
    updateTip.mutate(
      { tip: amount },
      {
        onSuccess: () => Alert.alert('Tip updated', `Delivery tip set to ${formatInr(amount)}`),
        onError: (e) =>
          Alert.alert('Could not update tip', e instanceof Error ? e.message : 'Please try again'),
      }
    );
  };

  return (
    <View style={styles.tipCard}>
      <View style={styles.tipHead}>
        <IndianRupee color={ORANGE} size={16} strokeWidth={2.4} />
        <Text style={styles.tipTitle}>Add delivery tip</Text>
      </View>
      <Text style={styles.tipSub}>
        Current tip {formatInr(tip)}. Change before the restaurant accepts.
      </Text>
      {moneyConfig.isError ? (
        <Pressable onPress={() => void moneyConfig.refetch()}>
          <Text style={styles.tipSub}>Could not load tip amounts · Tap to retry</Text>
        </Pressable>
      ) : null}
      <View style={styles.tipRow}>
        {presets.map((amount) => (
          <Pressable
            key={amount}
            style={[
              styles.tipChip,
              tip === amount && styles.tipChipOn,
              updateTip.isPending && styles.tipChipDisabled,
            ]}
            disabled={updateTip.isPending}
            onPress={() => handleTip(amount)}
          >
            <Text style={[styles.tipChipText, tip === amount && styles.tipChipTextOn]}>
              {amount === 0 ? 'No tip' : formatInr(amount)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tipCard: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: INK },
  tipSub: { marginTop: 6, fontFamily: fonts.ui, fontSize: 12, color: MUTED, lineHeight: 17 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tipChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6' },
  tipChipOn: { backgroundColor: ORANGE_SOFT, borderWidth: 1, borderColor: '#FFD8BF' },
  tipChipDisabled: { opacity: 0.6 },
  tipChipText: { fontFamily: fonts.uiMedium, fontSize: 13, color: MUTED },
  tipChipTextOn: { color: ORANGE, fontFamily: fonts.uiBold },
});
