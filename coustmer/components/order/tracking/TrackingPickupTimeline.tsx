import { Check, ChefHat, Package, ShoppingBag, Store } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { INK, MUTED, ORANGE, ORANGE_SOFT, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import { PICKUP_TRACKING_STEPS, type TrackingPhase, type TrackingStep } from '@/lib/order/tracking-phase';

type Props = {
  phase: TrackingPhase;
  activeIdx: number;
};

const ICONS: Record<TrackingStep, typeof Store> = {
  placed: Package,
  preparing: ChefHat,
  ready: ShoppingBag,
  on_the_way: ShoppingBag,
  delivered: Store,
};

export function TrackingPickupTimeline({ phase, activeIdx }: Props) {
  const steps = PICKUP_TRACKING_STEPS;
  const fillPct = activeIdx <= 0 ? 0 : (activeIdx / Math.max(1, steps.length - 1)) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.railWrap} pointerEvents="none">
        <View style={styles.rail} />
        <View style={[styles.railFill, { width: `${fillPct}%` }]} />
      </View>
      <View style={styles.row}>
        {steps.map((s, i) => {
          const done = i < activeIdx || (phase.completed && i === steps.length - 1);
          const current = i === activeIdx && phase.active && !phase.completed;
          const reached = done || current || (phase.completed && i <= activeIdx);
          const Icon = ICONS[s.key] ?? Package;
          const label =
            s.key === 'delivered' && phase.completed ? 'Picked up' : s.label;
          return (
            <View key={s.key} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  reached && styles.dotOn,
                  current && styles.dotNow,
                ]}
              >
                {done ? (
                  <Check color={WHITE} size={13} strokeWidth={3} />
                ) : (
                  <Icon
                    color={reached ? WHITE : MUTED}
                    size={14}
                    strokeWidth={2.3}
                  />
                )}
              </View>
              <Text
                style={[styles.label, reached && styles.labelOn, current && styles.labelNow]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: ORANGE_SOFT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    overflow: 'hidden',
  },
  railWrap: {
    position: 'absolute',
    left: 34,
    right: 34,
    top: 32,
    height: 3,
    justifyContent: 'center',
  },
  rail: {
    height: 3,
    borderRadius: 999,
    backgroundColor: '#F3D5BE',
  },
  railFill: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 999,
    backgroundColor: ORANGE,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { width: '25%', alignItems: 'center', gap: 8, zIndex: 1 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: '#F3D5BE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: ORANGE, borderColor: ORANGE },
  dotNow: {
    borderWidth: 3,
    borderColor: '#FFD8B8',
    backgroundColor: ORANGE,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    color: MUTED,
    textAlign: 'center',
  },
  labelOn: { color: INK, fontFamily: fonts.uiBold },
  labelNow: { color: ORANGE },
});
