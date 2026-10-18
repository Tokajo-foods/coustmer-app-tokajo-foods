import { Pressable } from '@/components/common/Pressable';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, Text, View, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  APP_BOTTOM_NAV_HEIGHT,
  appBottomNavOffset,
  isAppTabRoot,
} from '@/components/navigation/AppBottomNav';
import { useCartStore } from '@/store/cart-store';

/** Extra scroll space a screen needs so its last row clears the cart pill. */
export const CART_FLOATING_BAR_CLEARANCE = 60;

const GAP_ABOVE_NAV = 10;

type Props = {
  bottomOffset?: number;
};

export function CartFloatingBar({ bottomOffset = 0 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const navVisible = isAppTabRoot(pathname);
  const bottom = navVisible
    ? appBottomNavOffset(insets.bottom) + APP_BOTTOM_NAV_HEIGHT + GAP_ABOVE_NAV
    : Math.max(insets.bottom, 16) + bottomOffset;
  const items = useCartStore((s) => s.items);
  const restaurant = useCartStore((s) => s.restaurant);
  const totalItems = useCartStore((s) => s.totalItems());

  const initialHasItems = items.length > 0 && !!restaurant;

  const slideAnim = useRef(new Animated.Value(initialHasItems ? 0 : 300)).current; 
  const [isVisible, setIsVisible] = useState(initialHasItems);
  const isVisibleRef = useRef(initialHasItems);

  useEffect(() => {
    const hasItems = items.length > 0 && !!restaurant;
    
    if (hasItems && !isVisibleRef.current) {
      isVisibleRef.current = true;
      setIsVisible(true);
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();
      
    } else if (!hasItems && isVisibleRef.current) {
      isVisibleRef.current = false;
      
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [items.length, restaurant]);

  if (!isVisible && (!items.length || !restaurant)) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.bgContainer,
          { 
            position: 'absolute',
            bottom,
            alignSelf: 'center',
            transform: [{ translateY: slideAnim }]
          },
        ]}
      >
        <Pressable 
          style={styles.cardContent}
          onPress={() => router.push('/cart')}
        >
          <View style={styles.imageWrap}>
            {items[0]?.imageUrl ? (
              <Image source={{ uri: items[0].imageUrl }} style={styles.restImage} />
            ) : restaurant?.imageUrl ? (
              <Image source={{ uri: restaurant.imageUrl }} style={styles.restImage} />
            ) : (
              <View style={[styles.restImage, { backgroundColor: '#EEEEEE' }]} />
            )}
          </View>
          <View style={styles.textCol}>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Text style={styles.itemCountText}>{totalItems} item{totalItems > 1 ? 's' : ''}</Text>
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
  textCol: {
    justifyContent: 'center',
    paddingRight: 16,
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
