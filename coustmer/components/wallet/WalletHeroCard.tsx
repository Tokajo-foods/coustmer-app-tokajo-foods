import { Lock, Plus, Wallet } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';

type Props = {
  overview: WalletOverview;
  onAddMoney: () => void;
};

export function WalletHeroCard({ overview, onAddMoney }: Props) {
  const canTopUp = overview.topUp.enabled;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <Wallet color={authTheme.brand} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.label}>Tokajo Wallet balance</Text>
          <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
            {formatInr(overview.balance)}
          </Text>
        </View>
      </View>

      {overview.isLocked ? (
        <View style={styles.locked}>
          <Lock color={walletPalette.danger} size={14} strokeWidth={2.4} />
          <Text style={styles.lockedText} numberOfLines={2}>
            Wallet locked{overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support to unlock it.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.note}>Use it on any order. Your balance never expires.</Text>
          <SmoothPressable
            onPress={onAddMoney}
            disabled={!canTopUp}
            style={[styles.addBtn, !canTopUp && styles.addBtnDisabled]}
            accessibilityLabel="Add money to wallet"
          >
            <Plus color="#FFFFFF" size={17} strokeWidth={2.6} />
            <Text style={styles.addText}>{canTopUp ? 'Add money' : 'Add money unavailable'}</Text>
          </SmoothPressable>
        </>
      )}
    </View>
  );
}

function humanize(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    padding: 18,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  flex: { flex: 1 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: authTheme.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  balance: { marginTop: 2, color: walletPalette.ink, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  note: { marginTop: 14, color: walletPalette.muted, fontSize: 12.5, fontWeight: '500' },
  addBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 12,
    backgroundColor: authTheme.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnDisabled: { opacity: 0.5 },
  addText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  locked: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: walletPalette.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  lockedText: { flex: 1, color: walletPalette.danger, fontSize: 13, fontWeight: '600' },
});
