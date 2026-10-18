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
  { icon: Zap, label: '1-tap pay' },
  { icon: InfinityIcon, label: 'No expiry' },
  { icon: ShieldCheck, label: 'Secure' },
] as const;

export function WalletHeroCard({ overview, onAddMoney }: Props) {
  const canTopUp = overview.topUp.enabled;
  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={['#262A35', '#171A22', '#0F1117']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <LinearGradient
          colors={['rgba(249,115,22,0.35)', 'rgba(249,115,22,0)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.glow}
        />

        <View style={styles.topRow}>
          <View style={styles.brand}>
            <LinearGradient colors={['#FB923C', authTheme.brandDark]} style={styles.logo}>
              <Wallet color="#FFFFFF" size={15} strokeWidth={2.5} />
            </LinearGradient>
            <View>
              <Text style={styles.brandText}>Tokajo Wallet</Text>
              <Text style={styles.brandSub}>Food money · INR</Text>
            </View>
          </View>
          {overview.isLocked ? (
            <View style={styles.lockPill}>
              <Lock color="#FCA5A5" size={11} strokeWidth={2.6} />
              <Text style={styles.lockPillText}>Locked</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.label}>Available balance</Text>
        <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
          {formatInr(overview.balance)}
        </Text>

        <View style={styles.divider} />

        {overview.isLocked ? (
          <Text style={styles.lockedText} numberOfLines={2}>
            {overview.lockReason ? `${humanize(overview.lockReason)}. ` : ''}Contact support to unlock your wallet.
          </Text>
        ) : (
          <View style={styles.bottomRow}>
            <View style={styles.perks}>
              {PERKS.map(({ icon: Icon, label }) => (
                <View key={label} style={styles.perk}>
                  <Icon color="#FDBA74" size={12} strokeWidth={2.4} />
                  <Text style={styles.perkText}>{label}</Text>
                </View>
              ))}
            </View>
            <SmoothPressable
              onPress={onAddMoney}
              disabled={!canTopUp}
              style={[styles.addBtn, !canTopUp && styles.addBtnDisabled]}
              accessibilityLabel="Add money to wallet"
            >
              <Plus color="#FFFFFF" size={16} strokeWidth={3} />
              <Text style={styles.addText}>Add money</Text>
            </SmoothPressable>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

function humanize(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 24,
    shadowColor: '#0F1117',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  card: { borderRadius: 24, padding: 20, overflow: 'hidden' },
  glow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, top: -120, right: -90 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '700', letterSpacing: 0.1 },
  brandSub: { marginTop: 1, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239,68,68,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  lockPillText: { color: '#FCA5A5', fontSize: 11, fontWeight: '700' },
  label: { marginTop: 24, color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: '600', letterSpacing: 0.2 },
  balance: { marginTop: 4, color: '#FFFFFF', fontSize: 36, fontWeight: '700', letterSpacing: -1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 18, marginBottom: 14 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  perks: { flex: 1, gap: 6 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  perkText: { color: 'rgba(255,255,255,0.72)', fontSize: 11.5, fontWeight: '600' },
  addBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: authTheme.brand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnDisabled: { opacity: 0.45 },
  addText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },
  lockedText: { color: '#FCA5A5', fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
