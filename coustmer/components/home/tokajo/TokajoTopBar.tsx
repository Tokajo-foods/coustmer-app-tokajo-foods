import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bell, ChevronDown, MapPin } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { TOKAJO_LOGO } from '@/components/home/tokajo/assets';
import { fonts } from '@/constants/typography';
import { useUnreadNotificationCount } from '@/lib/notification/hooks';
import { useAuthStore } from '@/store/auth-store';

const ORANGE = '#F97316';

type Props = {
  deliveryTitle: string;
  deliverySubtitle?: string;
  isDetectingLocation?: boolean;
  onLocationPress?: () => void;
};

/** Centered logo, then delivery address and bell on the same row. */
export function TokajoTopBar({
  deliveryTitle,
  deliverySubtitle,
  isDetectingLocation,
  onLocationPress,
}: Props) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const unread = useUnreadNotificationCount({
    enabled: Boolean(token),
    refetchInterval: 12_000,
  });
  const unreadCount = unread.data ?? 0;

  const headline = isDetectingLocation
    ? 'Locating you'
    : deliveryTitle || 'Select location';

  const pinPulse = useSharedValue(1);
  const titleIn = useSharedValue(1);

  useEffect(() => {
    if (!isDetectingLocation) {
      pinPulse.value = withTiming(1, { duration: 180 });
      return;
    }
    pinPulse.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 420 }),
      ),
      -1,
      false,
    );
  }, [isDetectingLocation, pinPulse]);

  useEffect(() => {
    titleIn.value = 0.2;
    titleIn.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [headline, titleIn]);

  const pinStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pinPulse.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleIn.value,
    transform: [{ translateY: (1 - titleIn.value) * 6 }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.logoRow}>
        <Image source={TOKAJO_LOGO} style={styles.logo} contentFit="contain" />
      </View>

      <View style={styles.bottomRow}>
        <SmoothPressable
          style={styles.location}
          onPress={onLocationPress}
          pressScale={0.98}
          accessibilityLabel="Change delivery location"
        >
          <Animated.View style={pinStyle}>
            <MapPin color={ORANGE} size={18} strokeWidth={2.6} />
          </Animated.View>
          <View style={styles.locationText}>
            <Text style={styles.deliverTo}>Deliver to</Text>
            <View style={styles.deliverToRow}>
              <Animated.Text style={[styles.locationTitle, titleStyle]} numberOfLines={2}>
                {headline}
              </Animated.Text>
              <ChevronDown color="#1C1C1C" size={15} strokeWidth={2.8} />
            </View>
            {deliverySubtitle ? (
              <Text style={styles.locationSub} numberOfLines={1}>
                {deliverySubtitle}
              </Text>
            ) : null}
          </View>
        </SmoothPressable>

        <SmoothPressable
          style={styles.bell}
          onPress={() => router.push('/notifications')}
          pressScale={0.94}
          accessibilityLabel={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
        >
          <Bell color={ORANGE} size={20} strokeWidth={2.4} />
          {unreadCount > 0 ? <View style={styles.dot} /> : null}
        </SmoothPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  logoRow: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 184,
    height: 50,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  location: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  locationText: {
    flexShrink: 1,
  },
  deliverToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliverTo: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: ORANGE,
  },
  locationTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: '#0B0B0B',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  locationSub: {
    marginTop: 1,
    fontFamily: fonts.ui,
    fontSize: 11.5,
    color: '#6B6B6B',
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
