import { LinearGradient } from 'expo-linear-gradient';
import { Infinity as InfinityIcon, Lock, Plus, ShieldCheck, Wallet, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import type { WalletOverview } from '@/lib/payment/wallet-types';

type Props = {
  overview: WalletOverview;
  onAddMoney: () => void;
};

const PERKS = [
  { icon: Zap, label: '1-tap checkout' },
  { icon: InfinityIcon, label: 'Never expires' },
  { icon: ShieldCheck, label: '100% secure' },
] as const;

export function WalletHeroCard({ overview, onAddMoney }: Props) {
  const canTopUp = overview.topUp.enabled;
  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={['#FB923C', authTheme.brand, authTheme.brandDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.ring} />

        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Wallet color={authTheme.brandDark} size={14} strokeWidth={2.6} />
          </View>
          <Text style={styles.brandText}>Tokajo Wallet</Text>
        </View>

        <Text style={styles.label}>Available balance</Text>
        <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
          {formatInr(overview.balance)}
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
            <Text style={styles.addText}>{canTopUp ? 'Add money' : 'Add money unavailable'}</Text>
          </SmoothPressable>
        )}
      </LinearGradient>

      <View style={styles.perks}>
        {PERKS.map(({ icon: Icon, label }, index) => (
          <View key={label} style={[styles.perk, index > 0 && styles.perkDivider]}>
            <Icon color={authTheme.brandDark} size={13} strokeWidth={2.4} />
            <Text style={styles.perkText} numberOfLines={1}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function humanize(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#7C2D12',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  card: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.08)',
    top: -70,
    right: -60,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.1 },
  label: { marginTop: 20, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  balance: { marginTop: 2, color: '#FFFFFF', fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  addBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnDisabled: { opacity: 0.6 },
  addText: { color: authTheme.brandDark, fontSize: 15, fontWeight: '800' },
  lockedBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(127,29,29,0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lockedText: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  perks: { flexDirection: 'row', paddingVertical: 11 },
  perk: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  perkDivider: { borderLeftWidth: 1, borderLeftColor: '#F1F1F4' },
  perkText: { color: '#3D4152', fontSize: 11.5, fontWeight: '700' },
});
