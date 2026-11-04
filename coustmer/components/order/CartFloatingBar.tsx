import { useQueryClient } from '@tanstack/react-query';
import { Pressable } from '@/components/common/Pressable';
import { usePathname, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APP_BOTTOM_NAV_HEIGHT,
  appBottomNavOffset,
  isAppTabRoot,
  isHomePath,
} from '@/components/navigation/AppBottomNav';
import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { openOrderTracking } from '@/lib/order/open-order-tracking';
import { orderDetailHref } from '@/lib/order/order-tracking-path';
import {
  orderAwaitingOnlinePayment,
  orderIsLiveTrackable,
  orderIsTrackable,
} from '@/lib/order/trackable-order';
import { resolveOrderRouteId } from '@/lib/order/order-route-id';
import { useCartStore } from '@/store/cart-store';

/** Extra scroll space a screen needs so its last row clears the cart pill. */
export const CART_FLOATING_BAR_CLEARANCE = 60;

const GAP_ABOVE_NAV = 10;

type Props = {
  bottomOffset?: number;
};

export function CartFloatingBar({ bottomOffset = 0 }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const navVisible = isAppTabRoot(pathname);
  const bottom = navVisible
    ? appBottomNavOffset(insets.bottom) + APP_BOTTOM_NAV_HEIGHT + GAP_ABOVE_NAV
    : Math.max(insets.bottom, 16) + bottomOffset;
  const items = useCartStore((s) => s.items);
  const restaurant = useCartStore((s) => s.restaurant);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasCart = totalItems > 0;
  const { order: activeOrder, refetch: refetchActiveOrder } = usePrimaryActiveOrder();
  const onHome = isHomePath(pathname);
  const trackOrder = orderIsTrackable(activeOrder) ? activeOrder : null;
  const liveTrack = trackOrder && orderIsLiveTrackable(trackOrder) ? trackOrder : null;
  const paymentDue = trackOrder && orderAwaitingOnlinePayment(trackOrder) ? trackOrder : null;

  useFocusEffect(
    useCallback(() => {
      if (onHome) void refetchActiveOrder();
    }, [onHome, refetchActiveOrder]),
  );

  const mode: 'cart' | 'track' | null =
    trackOrder && onHome ? 'track' : hasCart ? 'cart' : null;
  const visible = mode !== null;

  const slideAnim = useRef(new Animated.Value(visible ? 0 : 300)).current;
  const wasVisible = useRef(visible);

  useEffect(() => {
    const showing = wasVisible.current;
    wasVisible.current = visible;
    if (!visible) {
      slideAnim.stopAnimation();
      return;
    }
    if (showing) return;
    slideAnim.setValue(300);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [visible, slideAnim]);

  if (!visible) return null;

  const onPress = () => {
    if (mode === 'track' && liveTrack) {
      void openOrderTracking(router, queryClient, liveTrack).then((ok) => {
        if (!ok) void refetchActiveOrder();
      });
      return;
    }
    if (mode === 'track' && paymentDue) {
      const oid = resolveOrderRouteId(paymentDue);
      if (oid) router.push(orderDetailHref(oid));
      return;
    }
    router.push('/cart');
  };

  const title =
    mode === 'track'
      ? paymentDue && !liveTrack
        ? 'Complete payment'
        : 'Track order'
      : 'View Cart';
  const subtitle =
    mode === 'track'
      ? trackOrder?.restaurantName ||
        (paymentDue && !liveTrack ? 'Finish checkout' : 'On the way')
      : `${totalItems} item${totalItems > 1 ? 's' : ''}`;

  const imageUri =
    mode === 'track'
      ? (trackOrder?.raw?.restaurantImage as string | undefined) ||
        (trackOrder?.raw?.restaurantLogo as string | undefined)
      : items[0]?.imageUrl || restaurant?.imageUrl;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.bgContainer,
          {
            position: 'absolute',
            bottom,
            alignSelf: 'center',
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable style={styles.cardContent} onPress={onPress}>
          <View style={styles.imageWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.restImage} />
            ) : (
              <View style={[styles.restImage, styles.imagePlaceholder]}>
                {mode === 'track' ? (
                  <MapPin color="#E87431" size={18} strokeWidth={2.2} />
                ) : null}
              </View>
            )}
          </View>
          <View style={styles.textCol}>
            <Text style={styles.viewCartText}>{title}</Text>
            <Text style={styles.itemCountText} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <ChevronRight color="#FFFFFF" size={24} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    backgroundColor: '#E87431',
    borderRadius: 30,
    shadowColor: '#E87431',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingRight: 16,
    minWidth: 160,
  },
  imageWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCol: {
    justifyContent: 'center',
    paddingRight: 16,
    maxWidth: 200,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  itemCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  chevronWrap: {
    marginLeft: 'auto',
  },
});
