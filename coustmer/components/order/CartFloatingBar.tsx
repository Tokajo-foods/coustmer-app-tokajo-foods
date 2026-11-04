import { useQueryClient } from '@tanstack/react-query';
import { Pressable } from '@/components/common/Pressable';
import { usePathname, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import {
  APP_BOTTOM_NAV_HEIGHT,
  appBottomNavOffset,
  isAppTabRoot,
  orderFloatingBarHidden,
} from '@/components/navigation/AppBottomNav';
import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { openOrderTracking } from '@/lib/order/open-order-tracking';
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
  const { liveOrder, refetch: refetchActiveOrder } = usePrimaryActiveOrder();
  const barHidden = orderFloatingBarHidden(pathname);

  useFocusEffect(
    useCallback(() => {
      if (!barHidden) void refetchActiveOrder();
    }, [barHidden, refetchActiveOrder]),
  );

  const mode: 'cart' | 'track' | null = barHidden
    ? null
    : liveOrder
      ? 'track'
      : hasCart
        ? 'cart'
        : null;
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
    if (mode === 'track' && liveOrder) {
      void openOrderTracking(router, queryClient, liveOrder).then((ok) => {
        if (!ok) void refetchActiveOrder();
      });
      return;
    }
    router.push('/cart');
  };

  const title = mode === 'track' ? 'Track order' : 'View Cart';
  const subtitle =
    mode === 'track'
      ? liveOrder?.restaurantName ||
        (liveOrder?.orderNumber ? `#${liveOrder.orderNumber}` : 'On the way')
      : `${totalItems} item${totalItems > 1 ? 's' : ''}`;

  const imageUri =
    mode === 'track'
      ? (liveOrder?.raw?.restaurantImage as string | undefined) ||
        (liveOrder?.raw?.restaurantLogo as string | undefined)
      : items[0]?.imageUrl || restaurant?.imageUrl;

  const isTrack = mode === 'track';

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
      <Animated.View
        style={[
          isTrack ? styles.trackShell : styles.bgContainer,
          {
            position: 'absolute',
            bottom,
            alignSelf: 'center',
            maxWidth: isTrack ? 248 : undefined,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {isTrack ? (
          <>
            <BlurView
              intensity={Platform.OS === 'ios' ? 48 : 32}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <View pointerEvents="none" style={styles.trackTint} />
            <View pointerEvents="none" style={styles.trackRim} />
          </>
        ) : null}
        <Pressable
          style={[styles.cardContent, isTrack && styles.trackCardContent]}
          onPress={onPress}
        >
          <View style={[styles.imageWrap, isTrack && styles.trackImageWrap]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.restImage} />
            ) : (
              <View style={[styles.restImage, styles.imagePlaceholder]}>
                {isTrack ? (
                  <MapPin color="#EA580C" size={16} strokeWidth={2.2} />
                ) : null}
              </View>
            )}
          </View>
          <View style={[styles.textCol, isTrack && styles.trackTextCol]}>
            <Text style={[styles.viewCartText, isTrack && styles.trackTitle]}>{title}</Text>
            <Text
              style={[styles.itemCountText, isTrack && styles.trackSubtitle]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <ChevronRight color="#FFFFFF" size={isTrack ? 20 : 24} strokeWidth={2.5} />
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
  trackShell: {
    borderRadius: 26,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#9A3412',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
      default: {
        boxShadow: '0 6px 18px rgba(154,52,18,0.22)',
      },
    }),
  },
  trackTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 115, 22, 0.78)',
  },
  trackRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingRight: 16,
    minWidth: 160,
  },
  trackCardContent: {
    minWidth: 0,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
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
  trackImageWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
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
  trackTextCol: {
    flexShrink: 1,
    paddingRight: 6,
    maxWidth: 148,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  trackTitle: {
    fontSize: 15,
    letterSpacing: 0.15,
  },
  itemCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  trackSubtitle: {
    fontSize: 11,
    opacity: 0.88,
  },
  chevronWrap: {
    marginLeft: 'auto',
  },
});
