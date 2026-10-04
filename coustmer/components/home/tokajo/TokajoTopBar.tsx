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

/** Logo left and bell right, delivery address on the row below. */
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
      <View style={styles.brandRow}>
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
          <Bell color={ORANGE} size={20} strokeWidth={2.4} />
          {unreadCount > 0 ? <View style={styles.dot} /> : null}
        </SmoothPressable>
      </View>

      <SmoothPressable
        style={styles.location}
        onPress={onLocationPress}
        pressScale={0.98}
        accessibilityLabel="Change delivery location"
      >
        <MapPin color={ORANGE} size={20} strokeWidth={2.6} fill={ORANGE} />
        <View style={styles.locationText}>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <View style={styles.deliverToRow}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              {headline}
            </Text>
            <ChevronDown color="#1C1C1C" size={16} strokeWidth={2.6} />
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
    paddingBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 168,
    height: 46,
  },
  location: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
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
    fontSize: 16,
    color: '#171717',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  locationSub: {
    marginTop: 1,
    fontFamily: fonts.ui,
    fontSize: 11.5,
    color: '#6B6B6B',
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C45C22',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
