import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Headset } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from '@/components/common/Pressable';
import { TrackingMap } from '@/components/order/TrackingMap';
import { GREEN, INK, ORANGE, RED, SHEET, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import type { RiderPoint, RouteLeg } from '@/lib/delivery/rider-fix';
import type { TrackingPhase } from '@/lib/order/tracking-phase';

type Props = {
  phase: TrackingPhase;
  showMap: boolean;
  pins: { restLat: number | null; restLng: number | null; custLat: number | null; custLng: number | null };
  restName: string;
  rider: RiderPoint | null;
  stale: boolean;
  leg: RouteLeg;
  socketLive: boolean;
  distanceLabel: string | null;
  onBack: () => void;
  onHelp: () => void;
};

export function TrackingMapHeader({
  phase, showMap, pins, restName, rider, stale, leg, socketLive, distanceLabel, onBack, onHelp,
}: Props) {
  const insets = useSafeAreaInsets();
  const headerBar = insets.top + 64;
  const screenH = Dimensions.get('window').height;
  const mapHeight = useSharedValue(headerBar);
  const [routeInfo, setRouteInfo] = useState<{ dist: string; time: string } | null>(null);

  useEffect(() => {
    const next = showMap ? Math.round(screenH * 0.48) : headerBar;
    mapHeight.value = withTiming(next, { duration: 380 });
  }, [headerBar, mapHeight, screenH, showMap]);

  const mapStyle = useAnimatedStyle(() => ({ height: mapHeight.value }));
  const chip = distanceLabel
    ? `${distanceLabel} away`
    : routeInfo && phase.showEta
      ? `${routeInfo.dist} away · ${routeInfo.time}`
      : null;

  return (
    <Animated.View style={[styles.mapWrap, mapStyle, !showMap && styles.mapWrapPlain]}>
      {showMap ? (
        <TrackingMap
          restLat={pins.restLat}
          restLng={pins.restLng}
          custLat={pins.custLat}
          custLng={pins.custLng}
          restName={restName}
          rider={rider}
          stale={stale}
          offline={!socketLive}
          leg={leg}
          onRoute={setRouteInfo}
        />
      ) : null}

      {showMap ? (
        <LinearGradient
          colors={['rgba(17,24,39,0.28)', 'transparent']}
          style={styles.mapScrim}
          pointerEvents="none"
        />
      ) : null}

      <View style={[styles.headerOverlay, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.circleBtn} onPress={onBack}>
          <ArrowLeft color={INK} size={20} strokeWidth={2.4} />
        </Pressable>

        {showMap ? (
          <View style={styles.livePill}>
            <View style={[styles.liveDot, !socketLive && styles.liveDotPaused]} />
            <Text style={styles.liveText}>{phase.rto ? 'Return in progress' : 'Live tracking'}</Text>
          </View>
        ) : phase.completed ? (
          <View style={styles.donePill}>
            <Check color={GREEN} size={12} strokeWidth={3} />
            <Text style={styles.donePillText}>Completed</Text>
          </View>
        ) : phase.cancelled ? (
          <View style={styles.cancelPill}>
            <Text style={styles.cancelPillText}>{phase.rto ? 'Returned' : 'Cancelled'}</Text>
          </View>
        ) : (
          <View style={styles.headerGhost} />
        )}

        <Pressable style={styles.circleBtn} onPress={onHelp}>
          <Headset color={INK} size={18} strokeWidth={2.3} />
        </Pressable>
      </View>

      {showMap && chip ? (
        <View style={styles.mapMeta}>
          <Text style={styles.mapMetaText}>{chip}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
};

const styles = StyleSheet.create({
  mapWrap: { width: '100%', backgroundColor: '#E5E7EB', overflow: 'hidden' },
  mapWrapPlain: { backgroundColor: SHEET },
  mapScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    shadowOpacity: 0.14,
    elevation: 5,
  },
  headerGhost: { width: 96 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    ...shadow,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN },
  liveDotPaused: { backgroundColor: '#F59E0B' },
  liveText: { fontFamily: fonts.uiBold, fontSize: 12, color: INK, letterSpacing: 0.1 },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  donePillText: { fontFamily: fonts.uiBold, fontSize: 12, color: GREEN },
  cancelPill: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  cancelPillText: { fontFamily: fonts.uiBold, fontSize: 12, color: RED },
  mapMeta: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    ...shadow,
  },
  mapMetaText: { fontFamily: fonts.uiBold, fontSize: 12, color: ORANGE },
});
