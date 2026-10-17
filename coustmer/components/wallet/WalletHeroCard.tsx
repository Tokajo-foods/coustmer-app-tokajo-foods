import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Plus, ShieldCheck, Wallet } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import type { WalletOverview } from '@/lib/payment/wallet-types';

type Props = {
  overview: WalletOverview;
  onAddMoney: () => void;
};

export function WalletHeroCard({ overview, onAddMoney }: Props) {
  const canTopUp = overview.topUp.enabled;
  return (
    <LinearGradient
      colors={['#FF8A3D', authTheme.brand, authTheme.brandDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={[styles.orb, styles.orbLarge]} />
      <View style={[styles.orb, styles.orbSmall]} />

      <View style={styles.topRow}>
        <View style={styles.brandPill}>
          <Wallet color="#FFFFFF" size={14} strokeWidth={2.4} />
          <Text style={styles.brandText}>Tokajo Wallet</Text>
        </View>
        <View style={styles.safePill}>
          <ShieldCheck color="#FFFFFF" size={12} strokeWidth={2.4} />
          <Text style={styles.safeText}>Never expires</Text>
        </View>
      </View>

      <Text style={styles.label}>Available balance</Text>
      <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {formatInr(overview.balance)}
      </Text>
      <Text style={styles.caption}>
        Use it on any order. Stays in your wallet until you spend it.
      </Text>

      {overview.isLocked ? (
        <View style={styles.lockedBox}>
          <Lock color="#FFFFFF" size={14} strokeWidth={2.4} />
          <Text style={styles.lockedText} numberOfLines={2}>
            Wallet locked{overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support.
          </Text>
        </View>
      ) : (
        <SmoothPressable
          onPress={onAddMoney}
          disabled={!canTopUp}
          style={[styles.addBtn, !canTopUp && styles.addBtnDisabled]}
          accessibilityLabel="Add money to wallet"
        >
          <Plus color={authTheme.brandDark} size={18} strokeWidth={2.8} />
          <Text style={styles.addText}>
            {canTopUp ? 'Add money' : 'Add money unavailable'}
          </Text>
        </SmoothPressable>
      )}
    </LinearGradient>
  );
}

function humanize(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: authTheme.brandDark,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)' },
  orbLarge: { width: 220, height: 220, top: -90, right: -70 },
  orbSmall: { width: 120, height: 120, bottom: -50, left: -30, backgroundColor: 'rgba(255,255,255,0.07)' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  brandText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
  safePill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  safeText: { color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: '700' },
  label: { marginTop: 22, color: 'rgba(255,255,255,0.86)', fontSize: 13, fontWeight: '600' },
  balance: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  caption: { marginTop: 4, color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: '500', lineHeight: 17 },
  addBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnDisabled: { opacity: 0.6 },
  addText: { color: authTheme.brandDark, fontSize: 15, fontWeight: '800', letterSpacing: 0.1 },
  lockedBox: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(127,29,29,0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lockedText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
