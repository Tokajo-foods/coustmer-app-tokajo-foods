import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bell, ChevronDown, MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

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

/** White header: delivery location (left) · TOKAJO logo (center) · bell (right). */
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
    ? 'Detecting location…'
    : deliveryTitle || 'Select location';

  return (
    <View style={styles.root}>
      <View style={styles.logoRow}>
        <Image source={TOKAJO_LOGO} style={styles.logo} contentFit="contain" />

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
          <Bell color="#1C1C1C" size={20} strokeWidth={2.2} />
          {unreadCount > 0 ? <View style={styles.dot} /> : null}
        </SmoothPressable>
      </View>

      <SmoothPressable
        style={styles.location}
        onPress={onLocationPress}
        pressScale={0.98}
        accessibilityLabel="Change delivery location"
      >
        <MapPin color={ORANGE} size={18} strokeWidth={2.6} />
        <View style={styles.locationText}>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <View style={styles.deliverToRow}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              {headline}
            </Text>
            <ChevronDown color="#1C1C1C" size={15} strokeWidth={2.8} />
          </View>
          {deliverySubtitle ? (
            <Text style={styles.locationSub} numberOfLines={1}>
              {deliverySubtitle}
            </Text>
          ) : null}
        </View>
      </SmoothPressable>
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
    width: 156,
    height: 52,
  },
  location: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    alignSelf: 'flex-start',
    maxWidth: '80%',
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
    fontSize: 15,
    color: '#1C1C1C',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  locationSub: {
    fontFamily: fonts.ui,
    fontSize: 11.5,
    color: '#8A8A8A',
  },
  bell: {
    position: 'absolute',
    right: 0,
    top: 5,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F6F6F7',
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
