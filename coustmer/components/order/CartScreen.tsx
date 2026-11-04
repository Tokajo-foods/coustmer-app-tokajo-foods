import { Pressable } from '@/components/common/Pressable';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bike,
  CreditCard,
  Minus,
  MoreVertical,
  Plus,
  ShoppingBag,
  Store,
  Tag,
  Wallet,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';
import { fonts } from '@/constants/typography';
import {
  useApplyCoupon,
  useCart,
  useCartBill,
  useCartSlots,
  useClearRemoteCart,
  useRemoveCoupon,
  useSetCartSchedule,
  useSaveCart,
  useUpdateCartDeliveryAddress,
  useUpdateCartDeliveryType,
  useUpdateCartTip,
} from '@/lib/cart/hooks';
import { syncCartItemQuantity } from '@/lib/order/add-to-cart';
import { DeliveryPreferences } from '@/components/order/DeliveryPreferences';
import { BillDetailsSection } from '@/components/order/BillDetailsSection';
import { CartAddressCard } from '@/components/order/CartAddressCard';
import { CartCheckoutBlockModal } from '@/components/order/CartCheckoutBlockModal';
import { AutoFreeDeliveryBanner } from '@/components/order/AutoFreeDeliveryBanner';
import { ScheduleOrderSection } from '@/components/order/ScheduleOrderSection';
import { CartSuggestionsFromStore } from '@/components/order/CartSuggestions';
import { CouponPickerSheet } from '@/components/order/CouponPickerSheet';
import { PaymentOptionsModal } from '@/components/order/PaymentOptionsModal';
import { syncCheckoutWallet } from '@/lib/cart/ensure-wallet-checkout';
import {
  resolveCartCheckoutBlock,
  type CartCheckoutBlock,
} from '@/lib/cart/cart-checkout-gate';
import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { isDeliveryFeeReady } from '@/lib/cart/delivery-fee-ready';
import { useCheckoutTotals } from '@/lib/cart/use-checkout-totals';
import { DishPrice } from '@/components/restaurant/DishPrice';
import { formatInr } from '@/lib/format/money';
import { catalogPayOf } from '@/lib/restaurant/item-price';
import { resolveMenuItemImage } from '@/lib/restaurant/menu-item-images';
import { useRestaurant } from '@/lib/restaurant/hooks';
import { usePaymentWallet } from '@/lib/payment/hooks';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';
import {
  paymentMethodHint,
  paymentMethodLabel,
  type PayChoice,
} from '@/lib/checkout/payment-display';
import { usePrepaidSchedule } from '@/lib/checkout/use-prepaid-schedule';

// ─── Design tokens ─────────────────────────────────────────────────────────
const BG = '#F4F5F7';
const WHITE = '#FFFFFF';
const ORANGE = '#F97316';
const ORANGE_DARK = '#EA580C';
const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER = '#E5E7EB';
const GREEN = '#16A34A';

function billErrorFields(error: unknown): { message: string | null; code: string | null } {
  if (!(error instanceof Error)) return { message: null, code: null };
  const e = error as Error & { code?: string };
  return { message: e.message || null, code: e.code ?? null };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
  busy,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  busy: boolean;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={onDecrement}
        disabled={busy}
        activeOpacity={0.7}
      >
        <Minus color={ORANGE} size={14} strokeWidth={2.6} />
      </TouchableOpacity>
      <Text style={styles.stepQty}>{busy ? '…' : quantity}</Text>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={onIncrement}
        disabled={busy}
        activeOpacity={0.7}
      >
        <Plus color={ORANGE} size={14} strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
}

function CartItemCard({
  item,
  busy,
  onDecrement,
  onIncrement,
}: {
  item: {
    id: string;
    name: string;
    price: number;
    listPrice?: number;
    itemTotal?: number;
    quantity: number;
    imageUrl?: string;
    isVeg?: boolean;
    modifiers?: Array<{ optionName: string; groupName?: string; price?: number }>;
  };
  busy: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  const imageUri = resolveMenuItemImage(item.name, item.imageUrl);
  const modifierLabel = (item.modifiers ?? [])
    .map((m) => m.optionName)
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: imageUri }}
        style={styles.itemImage}
        contentFit="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {modifierLabel ? (
          <Text style={styles.itemModifiers} numberOfLines={2}>
            {modifierLabel}
          </Text>
        ) : null}
        {item.itemTotal != null ? (
          <View style={styles.itemUnitPrice}>
            <DishPrice {...catalogPayOf(item)} size="sm" />
            <Text style={styles.itemEach}> each</Text>
          </View>
        ) : (
          <Text style={styles.itemEach}>Updating price…</Text>
        )}
        <View style={styles.itemBottomRow}>
          <DishPrice
            {...catalogPayOf({
              price: item.itemTotal ?? item.price * item.quantity,
              listPrice:
                item.listPrice != null ? item.listPrice * item.quantity : undefined,
            })}
          />
          <QuantityStepper
            quantity={item.quantity}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            busy={busy}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function CartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ checkoutNow?: string }>();
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = Boolean(token);
  const { order: activeOrder } = usePrimaryActiveOrder();
  const restaurant = useCartStore((s) => s.restaurant);
  const outletQuery = useRestaurant(restaurant?.id ?? '');

  const [checkoutBlock, setCheckoutBlock] = useState<CartCheckoutBlock | null>(null);
  const [addressPickerBump, setAddressPickerBump] = useState(0);

  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const deliveryType = useCartStore((s) => s.deliveryType);
  const scheduledFor = useCartStore((s) => s.scheduledFor);
  usePrepaidSchedule();
  const clearLocal = useCartStore((s) => s.clearCart);
  const tip = useCartStore((s) => s.tip);
  const setTip = useCartStore((s) => s.setTip);
  const setDeliveryTypeLocal = useCartStore((s) => s.setDeliveryType);
  const location = useDeliveryLocationStore((s) => s.location);
  const wallet = usePaymentWallet(isLoggedIn);

  const remoteCart = useCart();
  const apiCart = remoteCart.data;
  const isFocused = useIsFocused();

  /** Pin for /cart/bill — header location first, then server cart address */
  const billPin = useMemo(() => {
    if (location?.lat != null && location?.lng != null) {
      return { lat: location.lat, lng: location.lng };
    }
    const addr = apiCart?.deliveryAddress;
    if (addr?.lat != null && addr?.lng != null) {
      return { lat: addr.lat, lng: addr.lng };
    }
    return null;
  }, [location?.lat, location?.lng, apiCart?.deliveryAddress]);

  const normalizedDeliveryType =
    deliveryType === 'takeaway' ? ('takeaway' as const) : ('delivery' as const);

  const serverHasPin =
    apiCart?.deliveryAddress?.lat != null && apiCart?.deliveryAddress?.lng != null;
  const feeInput = {
    deliveryType: normalizedDeliveryType,
    deliveryFee: apiCart?.deliveryFee,
    deliveryFeeBase: apiCart?.deliveryFeeBase,
    superFreeDelivery: apiCart?.superFreeDelivery,
    autoFreeDelivery: apiCart?.autoFreeDelivery,
    pinLat: billPin?.lat,
    pinLng: billPin?.lng,
    savedLat: apiCart?.deliveryAddress?.lat,
    savedLng: apiCart?.deliveryAddress?.lng,
  };
  const canPrice =
    items.length > 0 &&
    (normalizedDeliveryType === 'takeaway' || Boolean(billPin) || serverHasPin);
  const liveBill = useCartBill(
    billPin?.lat,
    billPin?.lng,
    canPrice,
    normalizedDeliveryType,
    canPrice && !billPin && serverHasPin
  );
  const showFreshBill =
    canPrice &&
    liveBill.data != null &&
    liveBill.dataUpdatedAt >= remoteCart.dataUpdatedAt;
  const feeReady = isDeliveryFeeReady({ ...feeInput, freshBill: showFreshBill });
  const slots = useCartSlots({ enabled: isLoggedIn && items.length > 0 });
  const setSchedule = useSetCartSchedule();
  const clearRemote = useClearRemoteCart();
  const updateAddress = useUpdateCartDeliveryAddress();
  const updateDeliveryType = useUpdateCartDeliveryType();
  const updateTip = useUpdateCartTip();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const saveCart = useSaveCart();

  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherBusy, setVoucherBusy] = useState(false);
  const [couponPickerOpen, setCouponPickerOpen] = useState(false);
  const [rangeMessage, setRangeMessage] = useState<string | null>(null);
  const onRangeMessage = useCallback((next: string | null) => {
    setRangeMessage((current) => (current === next ? current : next));
  }, []);

  const couponApplied = Boolean(couponCode);

  const {
    bill: billBreakdown,
    payable: displayTotal,
    totalBeforeWallet,
  } = useCheckoutTotals({
    liveBill: showFreshBill ? liveBill.data : undefined,
    serverCart: apiCart,
    deliveryType: normalizedDeliveryType,
    tip,
    paymentMethod,
  });
  const priceReady = feeReady || billBreakdown.billReady;

  const goOrderSummary = useCallback(() => {
    const billErr = billErrorFields(liveBill.error);
    const block = resolveCartCheckoutBlock({
      itemCount: items.length,
      deliveryType: normalizedDeliveryType,
      rangeMessage,
      billPin,
      outlet: outletQuery.data,
      priceReady,
      billErrorMessage: billErr.message,
      billErrorCode: billErr.code,
      activeOrder,
    });
    if (block) {
      setCheckoutBlock(block);
      return;
    }
    router.push('/cart/summary' as import('expo-router').Href);
  }, [
    activeOrder,
    billPin,
    items.length,
    liveBill.error,
    normalizedDeliveryType,
    outletQuery.data,
    priceReady,
    rangeMessage,
    router,
  ]);

  const displayDiscount = billBreakdown.discount;

  const addressLabel = location?.label || 'Home';
  const addressLine = location?.formattedAddress || 'Add a delivery address';
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const selectPaymentMethod = async (method: PayChoice) => {
    try {
      await syncCheckoutWallet(method);
    } catch (err) {
      Alert.alert(
        'Wallet',
        err instanceof Error ? err.message : 'Could not apply wallet'
      );
      return;
    }
    setPaymentMethod(method);
    setPaymentModalOpen(false);
  };

  useEffect(() => {
    if (couponCode) setVoucherCode(couponCode);
  }, [couponCode]);

  const sentAddressId = useRef<string | null>(null);
  useEffect(() => {
    if (!isFocused || !isLoggedIn || !location?.savedAddressId) return;
    if (remoteCart.isLoading) return;
    const wanted = location.savedAddressId;
    if (apiCart?.deliveryAddress?.addressId === wanted) return;
    if (sentAddressId.current === wanted) return;
    sentAddressId.current = wanted;

    void updateAddress
      .mutateAsync({ addressId: wanted })
      .catch((e) => {
        if (sentAddressId.current === wanted) sentAddressId.current = null;
        if (__DEV__) {
          console.warn(
            '[cart] PUT /cart/delivery-address failed',
            e instanceof Error ? e.message : e
          );
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFocused,
    isLoggedIn,
    location?.savedAddressId,
    apiCart?.deliveryAddress?.addressId,
    remoteCart.isLoading,
  ]);

  // After placing an order the cart is cleared while tracking is open —
  // that must not call router.back() and yank the user off delivery tracking.
  useEffect(() => {
    if (!isFocused || items.length > 0) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  }, [items.length, isFocused, router]);

  const onRefresh = () => {
    void remoteCart.refetch();
    void liveBill.refetch();
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  };

  const syncQty = async (itemId: string, quantity: number) => {
    setBusyId(itemId);
    try {
      const ok = await syncCartItemQuantity(itemId, quantity);
      if (!ok) {
        await remoteCart.refetch();
      }
    } finally {
      setBusyId(null);
    }
  };

  const requireLogin = (action: string) => {
    Alert.alert('Sign in required', `Please sign in to ${action}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign in', onPress: () => router.push('/login') },
    ]);
  };

  const handleTipChange = (nextTip: number) => {
    if (!isLoggedIn) {
      requireLogin('add a delivery tip');
      return;
    }

    const previousTip = tip;
    setTip(nextTip);

    void updateTip
      .mutateAsync({ tip: nextTip })
      .then((cart) => {
        if (typeof cart.tip === 'number') {
          setTip(cart.tip);
        }
      })
      .catch((e) => {
        setTip(previousTip);
        Alert.alert(
          'Could not save tip',
          e instanceof Error
            ? e.message
            : 'Tip was not added to the server bill. Please try again.'
        );
      });
  };

  const handleDeliveryTypeChange = (type: 'delivery' | 'takeaway') => {
    if (!isLoggedIn) {
      requireLogin('change delivery type');
      return;
    }

    if (deliveryType === type) return;

    const previous = deliveryType;
    const previousTip = tip;
    setDeliveryTypeLocal(type);
    if (type === 'takeaway') setTip(0);

    void updateDeliveryType
      .mutateAsync({ deliveryType: type, type })
      .then((cart) => {
        if (cart?.deliveryType) {
          setDeliveryTypeLocal(
            cart.deliveryType === 'takeaway' ||
              String(cart.deliveryType).toLowerCase().includes('pick')
              ? 'takeaway'
              : 'delivery'
          );
        }
      })
      .catch((e) => {
        setDeliveryTypeLocal(previous);
        setTip(previousTip);
        const message =
          e instanceof Error ? e.message : 'Please try again.';
        const lower = message.toLowerCase();
        if (
          lower.includes('auth') ||
          lower.includes('login') ||
          lower.includes('unauthorized') ||
          lower.includes('forbidden') ||
          lower.includes('token')
        ) {
          requireLogin('change delivery type');
          return;
        }
        Alert.alert('Could not update delivery type', message);
      });
  };

  const handleScheduleSlot = async (value: string | null) => {
    if (!isLoggedIn) {
      requireLogin('schedule your order');
      throw new Error('Sign in required');
    }
    const previous = useCartStore.getState().scheduledFor;
    useCartStore.getState().setScheduledFor(value);
    try {
      const cart = await setSchedule.mutateAsync(value);
      useCartStore.getState().setScheduledFor(cart.scheduledFor ?? value);
    } catch (e) {
      useCartStore.getState().setScheduledFor(previous);
      throw e;
    }
  };

  const handleScheduleNow = () => {
    void handleScheduleSlot(null).catch((e) => {
      if (e instanceof Error && e.message === 'Sign in required') return;
      Alert.alert(
        'Could not update schedule',
        e instanceof Error ? e.message : 'Please try again.'
      );
    });
  };
  const handleSchedulePick = (startIso: string) => handleScheduleSlot(startIso);

  const handleClear = () => {
    setMenuOpen(false);
    Alert.alert('Clear cart?', 'Remove all items from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearRemote.mutateAsync();
            clearLocal();
          } catch (e) {
            clearLocal();
            Alert.alert(
              'Cleared on device',
              e instanceof Error
                ? `Server clear failed: ${e.message}`
                : 'Server cart may still have items — pull to refresh later.'
            );
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    setMenuOpen(false);
    if (!isLoggedIn) {
      Alert.alert('Sign in required', 'Log in to save carts for later.');
      return;
    }
    try {
      await saveCart.mutateAsync({
        name: restaurant?.name
          ? `${restaurant.name} · ${new Date().toLocaleDateString()}`
          : undefined,
      });
      Alert.alert('Saved', 'Cart saved for later');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again');
    }
  };

  useEffect(() => {
    if (params.checkoutNow === '1') {
      goOrderSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.checkoutNow, goOrderSummary]);

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) {
      Alert.alert('Enter a voucher code');
      return;
    }
    if (!isLoggedIn) {
      requireLogin('apply a promo code');
      return;
    }
    setVoucherBusy(true);
    try {
      const cart = await applyCoupon.mutateAsync({ code });
      const saved =
        cart.coupon?.code?.trim() || code.toUpperCase();
      setVoucherCode(saved);
    } catch (e) {
      Alert.alert(
        'Could not apply promo',
        e instanceof Error ? e.message : 'This code could not be applied'
      );
    } finally {
      setVoucherBusy(false);
    }
  };

  const handleRemoveVoucher = async () => {
    if (!isLoggedIn) {
      requireLogin('remove a promo code');
      return;
    }
    setVoucherBusy(true);
    try {
      await removeCoupon.mutateAsync();
      setVoucherCode('');
    } catch (e) {
      Alert.alert(
        'Could not remove promo',
        e instanceof Error ? e.message : 'Try again'
      );
    } finally {
      setVoucherBusy(false);
    }
  };

  // ── Loading / Empty states ──────────────────────────────────────────────
  if (remoteCart.isLoading && !items.length) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={ORANGE} size="large" />
          <Text style={styles.loadingText}>Loading cart…</Text>
        </View>
      </View>
    );
  }

  if (!items.length || !restaurant) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.topBar}>
          <SmoothPressable onPress={goBack} style={styles.iconBtn} pressScale={0.9}>
            <ArrowLeft color={TEXT} size={22} strokeWidth={2.2} />
          </SmoothPressable>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.emptyWrap}>
          <ShoppingBag color={TEXT_MUTED} size={80} strokeWidth={1.2} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items from a restaurant to get started</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.replace('/home')}
            activeOpacity={0.85}
          >
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const footerPad = Math.max(insets.bottom, 12);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.root, { backgroundColor: BG }]}>
        {/* ── Top Bar ─────────────────────────────────────────────── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 4 }]}>
          <SmoothPressable onPress={goBack} style={styles.iconBtn} pressScale={0.9}>
            <View style={styles.backBtnCircle}>
              <ArrowLeft color={TEXT} size={20} strokeWidth={2} />
            </View>
          </SmoothPressable>

          <Text style={styles.headerTitle}>Cart</Text>

          <SmoothPressable
            onPress={() => setMenuOpen(true)}
            style={styles.iconBtn}
            pressScale={0.9}
          >
            <MoreVertical color={TEXT} size={20} strokeWidth={2} />
          </SmoothPressable>
        </View>

        {/* ── Scroll Content ─────────────────────────────────────── */}
        <ScrollView
          {...PREMIUM_SCROLL}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + footerPad },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={remoteCart.isRefetching}
              onRefresh={onRefresh}
              tintColor={ORANGE}
            />
          }
        >
          <CartAddressCard
            restaurantId={restaurant?.id}
            delivery={normalizedDeliveryType === 'delivery'}
            billError={liveBill.error instanceof Error ? liveBill.error.message : null}
            billErrorAt={liveBill.errorUpdatedAt}
            onRangeMessage={onRangeMessage}
            openPickerRequest={addressPickerBump}
          />

          {/* Items */}
          <View style={styles.section}>
            {restaurant ? (
              <View style={styles.restaurantHeader}>
                <View style={styles.restaurantIcon}>
                  <Store color={ORANGE} size={16} strokeWidth={2.3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.restaurantTitle}>Ordering from</Text>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                </View>
              </View>
            ) : null}

            {items.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View style={styles.itemDivider} /> : null}
                <CartItemCard
                  item={item}
                  busy={busyId === item.id}
                  onDecrement={() => syncQty(item.id, item.quantity - 1)}
                  onIncrement={() => syncQty(item.id, item.quantity + 1)}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addMoreBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (restaurant?.id) {
                  router.push(`/restaurants/${restaurant.id}`);
                } else {
                  router.push('/home');
                }
              }}
            >
              <Plus color={ORANGE} size={16} strokeWidth={2.5} />
              <Text style={styles.addMoreText}>Add more items</Text>
            </TouchableOpacity>
          </View>

          <CartSuggestionsFromStore />

          {/* Delivery type */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fulfillment</Text>
            <View style={styles.deliveryTypeRow}>
              <TouchableOpacity
                style={[
                  styles.deliveryTypeChip,
                  deliveryType === 'delivery' && styles.deliveryTypeChipOn,
                ]}
                onPress={() => handleDeliveryTypeChange('delivery')}
                activeOpacity={0.8}
              >
                <Bike
                  color={deliveryType === 'delivery' ? ORANGE : TEXT_SEC}
                  size={16}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.deliveryTypeText,
                    deliveryType === 'delivery' && styles.deliveryTypeTextOn,
                  ]}
                >
                  Delivery
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deliveryTypeChip,
                  deliveryType === 'takeaway' && styles.deliveryTypeChipOn,
                ]}
                onPress={() => handleDeliveryTypeChange('takeaway')}
                activeOpacity={0.8}
              >
                <Store
                  color={deliveryType === 'takeaway' ? ORANGE : TEXT_SEC}
                  size={16}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.deliveryTypeText,
                    deliveryType === 'takeaway' && styles.deliveryTypeTextOn,
                  ]}
                >
                  Takeaway
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScheduleOrderSection
            scheduleData={slots.data}
            isLoading={slots.isLoading}
            isError={slots.isError}
            scheduledFor={scheduledFor}
            busy={setSchedule.isPending}
            onRetry={() => void slots.refetch()}
            onSelectNow={handleScheduleNow}
            onSelectSlot={handleSchedulePick}
          />

          {normalizedDeliveryType === 'delivery' ? (
            <DeliveryPreferences tip={tip} setTip={handleTipChange} />
          ) : null}

          {normalizedDeliveryType === 'delivery' && items.length > 0 ? (
            <AutoFreeDeliveryBanner
              bill={billBreakdown}
              deliveryType={normalizedDeliveryType}
            />
          ) : null}

          {/* Promo */}
          <View style={styles.voucherCard}>
            <View style={styles.voucherIconWrap}>
              <Tag color={ORANGE} size={16} strokeWidth={2.2} />
            </View>
            <TextInput
              style={styles.voucherInput}
              placeholder="Promo code"
              placeholderTextColor={TEXT_MUTED}
              value={voucherCode}
              onChangeText={setVoucherCode}
              returnKeyType="done"
              onSubmitEditing={() => {
                void handleApplyVoucher();
              }}
              editable={!couponApplied && !voucherBusy}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.voucherBtn}
              onPress={() => {
                if (voucherBusy) return;
                if (couponApplied) void handleRemoveVoucher();
                else void handleApplyVoucher();
              }}
              activeOpacity={0.7}
              disabled={voucherBusy}
            >
              {voucherBusy ? (
                <ActivityIndicator color={ORANGE} size="small" />
              ) : (
                <Text style={styles.voucherAction}>
                  {couponApplied ? 'Remove' : 'Apply'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Browse coupons */}
          {!couponApplied && isLoggedIn && (
            <TouchableOpacity
              style={styles.browseCouponsBtn}
              onPress={() => setCouponPickerOpen(true)}
              activeOpacity={0.8}
            >
              <Tag color={ORANGE} size={14} strokeWidth={2.3} />
              <Text style={styles.browseCouponsText}>Browse all offers</Text>
            </TouchableOpacity>
          )}

          <Pressable
            style={styles.paymentCard}
            onPress={() => setPaymentModalOpen(true)}
          >
            <View style={styles.paymentIconWrap}>
              {paymentMethod === 'cod' ? (
                normalizedDeliveryType === 'takeaway' ? (
                  <Store color={ORANGE} size={18} strokeWidth={2.3} />
                ) : (
                  <Bike color={ORANGE} size={18} strokeWidth={2.3} />
                )
              ) : paymentMethod === 'wallet' ? (
                <Wallet color={ORANGE} size={18} strokeWidth={2.3} />
              ) : (
                <CreditCard color={ORANGE} size={18} strokeWidth={2.3} />
              )}
            </View>
            <View style={styles.paymentBody}>
              <Text style={styles.paymentEyebrow}>Pay using</Text>
              <Text style={styles.paymentTitle} numberOfLines={1}>
                {paymentMethodLabel(paymentMethod, normalizedDeliveryType === 'takeaway')}
              </Text>
              <Text style={styles.paymentHint} numberOfLines={1}>
                {paymentMethodHint(paymentMethod, normalizedDeliveryType === 'takeaway')}
              </Text>
            </View>
            <Text style={styles.paymentChangeText}>Change</Text>
          </Pressable>

          {/* Bill */}
          <BillDetailsSection
            bill={billBreakdown}
            itemCount={items.reduce((n, i) => n + i.quantity, 0)}
            couponCode={couponCode}
            fallbackTotal={displayTotal}
            hasDeliveryPin={Boolean(billPin) || normalizedDeliveryType === 'takeaway'}
            billLoading={canPrice && !priceReady && !liveBill.isError}
            billError={liveBill.isError}
            totalReady={priceReady}
          />
        </ScrollView>

        {/* ── Bottom Checkout Bar ─────────────────────────────────── */}
        <View style={[styles.checkoutBar, { paddingBottom: footerPad }]}>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={goOrderSummary}
            disabled={
              items.length === 0 ||
              voucherBusy ||
              Boolean(busyId) ||
              applyCoupon.isPending ||
              removeCoupon.isPending
            }
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.checkoutPrice} numberOfLines={1}>
                {priceReady ? formatInr(displayTotal) : 'Calculating…'}
              </Text>
              <Text style={styles.checkoutSub}>TOTAL</Text>
            </View>
            <View style={styles.checkoutLabelWrap}>
              <Text style={styles.checkoutLabel}>Order summary</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Overflow Menu Modal ─────────────────────────────────── */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setMenuOpen(false)}
          >
            <View style={[styles.menuSheet, { top: insets.top + 56 }]}>
              <Pressable style={styles.menuItem} onPress={handleSave}>
                <Text style={styles.menuItemText}>Save cart for later</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/cart/saved' as import('expo-router').Href);
                }}
              >
                <Text style={styles.menuItemText}>View saved carts</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={handleClear}>
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                  Clear cart
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <CartCheckoutBlockModal
          block={checkoutBlock}
          onClose={() => setCheckoutBlock(null)}
          onChangeAddress={() => {
            setCheckoutBlock(null);
            setAddressPickerBump((n) => n + 1);
          }}
        />

        <PaymentOptionsModal
          visible={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          selectedMethod={paymentMethod}
          onSelectMethod={(m) => void selectPaymentMethod(m)}
          itemCount={itemCount}
          total={totalBeforeWallet}
          amountReady={priceReady}
          walletShortfall={billBreakdown.walletShortfall}
          savings={billBreakdown.discount}
          restaurantName={restaurant?.name || ''}
          deliveryTime={restaurant?.deliveryTime}
          addressLabel={addressLabel}
          addressText={addressLine}
          wallet={wallet.data}
          allowCod={!scheduledFor}
          isTakeaway={normalizedDeliveryType === 'takeaway'}
        />

        {/* Coupon Picker Sheet */}
        <CouponPickerSheet
          visible={couponPickerOpen}
          onClose={() => setCouponPickerOpen(false)}
          restaurantId={restaurant?.id}
          lat={location?.lat}
          lng={location?.lng}
          subtotal={billBreakdown.itemsSubtotal}
          onApplied={(code) => {
            setVoucherCode(code);
            setCouponPickerOpen(false);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Loading ──
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: TEXT_SEC,
  },

  // ── Empty ──
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: TEXT,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: TEXT_SEC,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: ORANGE,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  browseBtnText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: WHITE,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: TEXT,
    letterSpacing: -0.3,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  cardTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: TEXT,
    marginBottom: 2,
  },

  // ── Section card (items) ──
  section: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  restaurantIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: TEXT_SEC,
  },
  restaurantName: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginHorizontal: 14,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: 12,
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
  },
  addMoreText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: ORANGE,
  },

  // ── Cart Item Card ──
  itemCard: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: TEXT,
  },
  itemModifiers: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: ORANGE,
    marginTop: 1,
  },
  itemUnitPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  itemEach: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_MUTED,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  itemPrice: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },

  // ── Stepper ──
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    height: 34,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 32,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    minWidth: 26,
    textAlign: 'center',
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: TEXT,
  },

  deliveryTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deliveryTypeChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FAFAFA',
  },
  deliveryTypeChipOn: {
    borderColor: ORANGE,
    backgroundColor: '#FFF7ED',
  },
  deliveryTypeText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT_SEC,
  },
  deliveryTypeTextOn: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scheduleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FAFAFA',
  },
  scheduleChipActive: {
    borderColor: ORANGE,
    backgroundColor: '#FFF7ED',
  },
  scheduleChipText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: TEXT_SEC,
  },
  scheduleChipTextActive: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
  scheduleHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },

  // ── Voucher Card ──
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  voucherIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherInput: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: TEXT,
    paddingVertical: 8,
  },
  voucherBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  voucherAction: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: ORANGE,
  },
  browseCouponsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  browseCouponsText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: ORANGE,
  },

  // ── Payment ──
  paymentCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  paymentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentBody: { flex: 1 },
  paymentEyebrow: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: TEXT,
  },
  paymentTitle: {
    marginTop: 2,
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT,
  },
  paymentHint: {
    marginTop: 1,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  paymentChangeText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: ORANGE,
  },

  // ── Bill Card ──
  billCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  billHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  billTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  billItemsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  billItemsPillText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: ORANGE_DARK,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
  },
  billValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT,
  },
  billFree: {
    color: GREEN,
    fontFamily: fonts.uiBold,
  },
  billSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  savingsBox: {
    marginTop: 2,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  savingsTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: '#166534',
  },
  savingsValue: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#166534',
  },
  billTotalLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  billTotalValue: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: TEXT,
  },
  billFooterHint: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 11,
    color: TEXT_MUTED,
  },

  // ── Checkout Bar ──
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    borderRadius: 16,
    minHeight: 56,
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
  },
  checkoutPrice: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: WHITE,
  },
  checkoutSub: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  checkoutLabelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    minHeight: 40,
    paddingHorizontal: 18,
  },
  checkoutLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: ORANGE_DARK,
  },

  // ── Overflow Menu ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  menuSheet: {
    position: 'absolute',
    right: 14,
    backgroundColor: WHITE,
    borderRadius: 14,
    minWidth: 200,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  menuItemText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: TEXT,
  },
});
