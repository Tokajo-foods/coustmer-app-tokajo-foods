import { Image } from 'expo-image';
import { Check, Clock3 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { EtaLabel } from '@/components/order/tracking/tracking-eta';
import { INK, INK_SOFT, LINE, MUTED, ORANGE, ORANGE_SOFT, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import { pickupReadyCopy } from '@/lib/order/pickup-ready-copy';
import {
  PICKUP_TRACKING_STEPS,
  stepIndex,
  TRACKING_STEPS,
  type TrackingPhase,
  type TrackingStep,
} from '@/lib/order/tracking-phase';

const BIKE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png';
const SCOOTER_W = 44;
const SCOOTER_H = 34;

type Props = {
  phase: TrackingPhase;
  kicker: string;
  eta: EtaLabel | null;
  itemCount: number;
  pickup?: boolean;
  promisedReadyAt?: string | null;
  estimatedPrepTime?: number | null;
  delayMinutes?: number | null;
};

export function TrackingStatusSection({
  phase,
  kicker,
  eta,
  itemCount,
  pickup,
  promisedReadyAt,
  estimatedPrepTime,
  delayMinutes,
}: Props) {
  const steps = pickup ? PICKUP_TRACKING_STEPS : TRACKING_STEPS;
  const activeIdx = stepIndex(phase.step, steps);
  const progress = useSharedValue(0);
  const bob = useSharedValue(0);
  const railWidth = useSharedValue(0);
  const moving = !pickup && phase.active && !phase.rto && phase.step !== 'delivered';

  useEffect(() => {
    progress.value = withTiming(activeIdx / Math.max(1, steps.length - 1), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIdx, progress, steps.length]);

  useEffect(() => {
    if (!moving) {
      bob.value = withTiming(0, { duration: 220 });
      return;
    }
    bob.value = withRepeat(
      withSequence(
        withTiming(-3.5, { duration: 280, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 280, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [moving, bob]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const scooterStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, railWidth.value - SCOOTER_W);
    const lean = interpolate(bob.value, [-3.5, 0], [-4, 0]);
    return {
      transform: [
        { translateX: progress.value * travel },
        { translateY: bob.value },
        { rotate: `${lean}deg` },
        { scaleX: -1 },
      ],
    };
  });

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!pickup || !phase.active) return;
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [pickup, phase.active, promisedReadyAt]);

  const pickupTiming = pickup
    ? pickupReadyCopy({
        promisedReadyAt,
        estimatedPrepTime,
        delayMinutes,
        ready: phase.key === 'ready' || phase.completed,
        now,
      })
    : null;

  const onRailLayout = (e: LayoutChangeEvent) => {
    railWidth.value = e.nativeEvent.layout.width;
  };

  return (
    <View>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.statusTitle}>{phase.title}</Text>
      <Text style={styles.statusHint}>{phase.hint}</Text>

      {pickup && pickupTiming ? (
        <View style={styles.etaRow}>
          <View style={styles.etaBlock}>
            <Text style={styles.etaLabel}>{pickupTiming.label}</Text>
            <View style={styles.etaValueRow}>
              <Text style={styles.etaValue}>{pickupTiming.value}</Text>
              {pickupTiming.unit ? <Text style={styles.etaUnit}>{pickupTiming.unit}</Text> : null}
            </View>
            <Text style={styles.pickupSub} numberOfLines={2}>{pickupTiming.sub}</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaSide}>
            <Clock3 color={ORANGE} size={16} strokeWidth={2.3} />
            <Text style={styles.etaSideText}>
              {itemCount ? `${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Order'}
            </Text>
            <Text style={styles.etaSideSub}>Takeaway</Text>
          </View>
        </View>
      ) : null}

      {phase.active && phase.showEta && !pickup ? (
        <View style={styles.etaRow}>
          <View style={styles.etaBlock}>
            <Text style={styles.etaLabel}>ARRIVING IN</Text>
            <View style={styles.etaValueRow}>
              <Text style={styles.etaValue}>{eta?.value ?? '—'}</Text>
              {eta?.unit ? <Text style={styles.etaUnit}>{eta.unit}</Text> : null}
            </View>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaSide}>
            <Clock3 color={ORANGE} size={16} strokeWidth={2.3} />
            <Text style={styles.etaSideText}>
              {itemCount ? `${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Order'}
            </Text>
            <Text style={styles.etaSideSub}>On Tokajo Foods</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.timeline}>
        <View style={styles.timelineRail} onLayout={onRailLayout}>
          <View style={styles.timelineTrack}>
            <Animated.View style={[styles.timelineFill, fillStyle]} />
          </View>
          {!pickup ? (
            <Animated.View style={[styles.scooterWrap, scooterStyle]} pointerEvents="none">
              <Image source={{ uri: BIKE_IMAGE }} style={styles.scooterImage} contentFit="contain" />
              <View style={styles.scooterShadow} />
            </Animated.View>
          ) : null}
        </View>
        <View style={styles.timelineSteps}>
          {steps.map((s: { key: TrackingStep; label: string }, i) => {
            const done = i <= activeIdx;
            const current = i === activeIdx && phase.active;
            const last = phase.completed && i === TRACKING_STEPS.length - 1;
            return (
              <View key={s.key} style={styles.timelineStep}>
                <View
                  style={[
                    styles.timelineDot,
                    done && styles.timelineDotDone,
                    current && styles.timelineDotCurrent,
                    last && styles.timelineDotDone,
                  ]}
                >
                  {(done && !current) || last ? <Check color={WHITE} size={11} strokeWidth={3} /> : null}
                </View>
                <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>
                  {s.key === 'delivered' && phase.completed ? (pickup ? 'Picked up' : 'Completed') : s.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.uiMedium, fontSize: 12, color: MUTED, marginBottom: 6 },
  statusTitle: { fontFamily: fonts.displayBold, fontSize: 26, color: INK, letterSpacing: -0.5 },
  statusHint: { marginTop: 2, fontFamily: fonts.ui, fontSize: 14, color: MUTED },
  etaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE_SOFT,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  etaBlock: { flex: 1 },
  etaLabel: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 1.2, color: ORANGE, marginBottom: 2 },
  etaValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  etaValue: { fontFamily: fonts.displayBold, fontSize: 34, color: INK, letterSpacing: -1 },
  etaUnit: { fontFamily: fonts.uiSemi, fontSize: 14, color: INK_SOFT, marginBottom: 4 },
  pickupSub: { marginTop: 4, fontFamily: fonts.ui, fontSize: 11, color: MUTED, lineHeight: 15 },
  etaDivider: { width: 1, height: 42, backgroundColor: '#F3D5BE', marginHorizontal: 14 },
  etaSide: { width: 108, gap: 4 },
  etaSideText: { fontFamily: fonts.uiBold, fontSize: 13, color: INK },
  etaSideSub: { fontFamily: fonts.ui, fontSize: 11, color: MUTED },
  timeline: { marginTop: 12, marginBottom: 8 },
  timelineRail: { marginHorizontal: 10, height: 48, justifyContent: 'flex-end', paddingBottom: 10 },
  timelineTrack: { height: 4, borderRadius: 999, backgroundColor: LINE, overflow: 'hidden', marginHorizontal: 8 },
  timelineFill: { height: '100%', backgroundColor: ORANGE, borderRadius: 999 },
  scooterWrap: {
    position: 'absolute',
    left: 0,
    bottom: 6,
    width: SCOOTER_W,
    height: SCOOTER_H + 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  scooterImage: { width: SCOOTER_W, height: SCOOTER_H, zIndex: 2 },
  scooterShadow: {
    position: 'absolute',
    bottom: 0,
    width: 28,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(17,24,39,0.14)',
    zIndex: 1,
  },
  timelineSteps: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  timelineStep: { width: '25%', alignItems: 'center', gap: 6 },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: ORANGE },
  timelineDotCurrent: { borderWidth: 3, borderColor: '#FFD8B8', backgroundColor: ORANGE },
  timelineLabel: { fontFamily: fonts.uiMedium, fontSize: 10, color: MUTED, textAlign: 'center' },
  timelineLabelDone: { color: INK, fontFamily: fonts.uiBold },
});
