import { useRouter } from 'expo-router';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';
import {
  ArrowLeft,
  Bike,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Store,
  Wallet,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { BillDetailsSection } from '@/components/order/BillDetailsSection';
import {
  OrderPlacementModal,
  type PlacementPhase,
} from '@/components/order/OrderPlacementModal';
import { PaymentOptionsModal } from '@/components/order/PaymentOptionsModal';
import { SlideToConfirm } from '@/components/order/SlideToConfirm';
import {
  RazorpayCheckoutModal,
  type RazorpayResult,
  type RazorpaySession,
} from '@/components/payment/RazorpayCheckoutModal';
import { fonts } from '@/constants/typography';
import {
  paymentMethodHint,
  paymentMethodLabel,
} from '@/lib/checkout/payment-display';
import {
  ensureWalletCoversCheckout,
} from '@/lib/cart/ensure-wallet-checkout';
import { useCheckoutTotals } from '@/lib/cart/use-checkout-totals';
import { formatInr, formatLineTotal } from '@/lib/format/money';
import { useCart, useCartBill } from '@/lib/cart/hooks';
import { formatScheduledForDisplay } from '@/lib/cart/schedule';
import { useCreateOrder } from '@/lib/order/hooks';
import { parseDeliveryAddress } from '@/lib/order/parse-address';
import {
  useInitiatePayment,
  usePaymentMethods,
  usePaymentWallet,
} from '@/lib/payment/hooks';
import { needsOnlinePayment } from '@/lib/payment/types';
import { useOrderPaymentResult } from '@/lib/payment/use-order-payment-result';
import { useUserProfile } from '@/lib/profile/hooks';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

const BG = '#F4F5F7';
const WHITE = '#FFFFFF';
const ORANGE = '#F97316';
const ORANGE_DARK = '#EA580C';
const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const TEXT_MUTED = '#94A3B8';
const BORDER = '#E5E7EB';
const GREEN = '#16A34A';

export function OrderSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const location = useDeliveryLocationStore((s) => s.location);
  const authUser = useAuthStore((s) => s.user);

  const restaurant = useCartStore((s) => s.restaurant);
  const items = useCartStore((s) => s.items);
  const tip = useCartStore((s) => s.tip);
  const couponCode = useCartStore((s) => s.couponCode);
  const deliveryType = useCartStore((s) => s.deliveryType);
  const scheduledFor = useCartStore((s) => s.scheduledFor);
  const specialInstructions = useCartStore((s) => s.specialInstructions);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);

  const profile = useUserProfile();
  const paymentMethods = usePaymentMethods();
  const wallet = usePaymentWallet();
  const remoteCart = useCart();
  const cartData = remoteCart.data;

  const billPin = useMemo(() => {
    if (location?.lat != null && location?.lng != null) {
      return { lat: location.lat, lng: location.lng };
    }
    const addr = cartData?.deliveryAddress;
    if (addr?.lat != null && addr?.lng != null) {
      return { lat: addr.lat, lng: addr.lng };
    }
    return null;
  }, [location?.lat, location?.lng, cartData?.deliveryAddress]);

  const normalizedDeliveryType =
    deliveryType === 'takeaway' ? ('takeaway' as const) : ('delivery' as const);

  const bill = useCartBill(
    billPin?.lat,
    billPin?.lng,
    items.length > 0,
    normalizedDeliveryType,
    items.length > 0
  );

  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();
  const { confirm: confirmPayment } = useOrderPaymentResult();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderPlacementPhase, setOrderPlacementPhase] =
    useState<PlacementPhase>('none');
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpaySession, setRazorpaySession] = useState<RazorpaySession | null>(null);
  const [currentOrder, setCurrentOrder] = useState<{
    id: string;
    total?: number;
    orderNumber?: string;
  } | null>(null);

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const {
    bill: billBreakdown,
    payable,
    totalBeforeWallet,
  } = useCheckoutTotals({
    liveBill: bill.data,
    serverCart: cartData,
    deliveryType: normalizedDeliveryType,
    paymentMethod,
  });

  const displayName =
    profile.data?.displayName ||
    [profile.data?.firstName, profile.data?.lastName].filter(Boolean).join(' ') ||
    authUser?.firstName ||
    'Guest';

  const phoneDigits = (profile.data?.phone || authUser?.phone || '').replace(/\D/g, '');
  const phone =
    phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits || '0000000000';

  const scheduledLabel = formatScheduledForDisplay(scheduledFor);
  const isTakeaway = normalizedDeliveryType === 'takeaway';

  const placeOrder = async () => {
    if (!restaurant?.id || items.length === 0) {
      Alert.alert('Cart empty', 'Add items before placing your order.');
      router.back();
      return;
    }

    if (!isTakeaway && !location) {
      Alert.alert('Address missing', 'Select a delivery address from the cart.');
      return;
    }

    setPaying(true);
    setOrderPlacementPhase('placing');

    try {
      const parsedAddress = isTakeaway
        ? {
            label: 'Takeaway',
            formattedAddress: restaurant.name,
            street: '',
            area: '',
            city: location?.city || 'City',
            state: location?.state || 'State',
            pincode: location?.pincode || '000000',
            lat: location?.lat,
            lng: location?.lng,
          }
        : parseDeliveryAddress({
            formattedAddress: location!.formattedAddress,
            label: location!.label,
            city: location!.city,
            lat: location!.lat,
            lng: location!.lng,
          });

      let mappedMethod = paymentMethod;
      let mappedMethodId: string | undefined;

      if (
        paymentMethod === 'paytm_upi' ||
        paymentMethod === 'gpay' ||
        paymentMethod === 'phonepe'
      ) {
        mappedMethod = 'upi';
      } else if (paymentMethods.data?.some((m) => m.id === paymentMethod)) {
        const saved = paymentMethods.data.find((m) => m.id === paymentMethod);
        if (saved) {
          mappedMethod = saved.type;
          mappedMethodId = saved.id;
        }
      }

      if (mappedMethod === 'wallet') {
        await ensureWalletCoversCheckout();
        void bill.refetch();
      }

      const order = await createOrder.mutateAsync({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: items.map((item) => ({
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions,
        })),
        deliveryAddress: {
          label: parsedAddress.label,
          formattedAddress: parsedAddress.formattedAddress,
          street: parsedAddress.street,
          area: parsedAddress.area,
          city: parsedAddress.city,
          state: parsedAddress.state,
          pincode: parsedAddress.pincode,
          contactName: displayName,
          contactPhone: phone,
          lat: parsedAddress.lat,
          lng: parsedAddress.lng,
        },
        addressId: location?.savedAddressId,
        paymentMethod: mappedMethod,
        deliveryType,
        fulfillmentType: deliveryType,
        specialInstructions: specialInstructions || undefined,
        tip: tip > 0 ? tip : 0,
        deliveryTip: tip > 0 ? tip : 0,
        scheduledFor: scheduledFor ?? undefined,
        isScheduled: Boolean(scheduledFor),
      });

      setCurrentOrder(order);
      const amount = order.total ?? payable;

      if (!needsOnlinePayment(mappedMethod)) {
        setOrderPlacementPhase('placed');
        await new Promise((r) => setTimeout(r, 1200));
        router.replace({
          pathname: '/orders/[orderId]/tracking',
          params: { orderId: order.id, newOrder: 'true' },
        });
        setOrderPlacementPhase('none');
        return;
      }

      try {
        const payment = await initiatePayment.mutateAsync({
          orderId: order.id,
          amount,
          currency: 'INR',
          method: mappedMethod as 'upi' | 'card' | 'wallet' | 'cod',
          methodId: mappedMethodId,
          description: `Order ${order.orderNumber || order.id}`,
        });

        if (payment.status === 'success' || payment.status === 'paid') {
          setOrderPlacementPhase('placed');
          await new Promise((r) => setTimeout(r, 800));
          router.replace({
            pathname: '/orders/[orderId]/tracking',
            params: { orderId: order.id, newOrder: 'true' },
          });
          setOrderPlacementPhase('none');
          return;
        }

        const key = payment.razorpayKey;
        const rzpOrderId = payment.gatewayOrderId || payment.razorpayOrderId;

        if (key && rzpOrderId) {
          setRazorpaySession({
            keyId: key,
            orderId: rzpOrderId,
            amount,
            currency: 'INR',
            paymentId: payment.id,
            customerName: displayName,
            contact: phone,
            description: `Order ${order.orderNumber || order.id}`,
          });
          setRazorpayOpen(true);
          setOrderPlacementPhase('none');
          return;
        }

        Alert.alert(
          'Online payment unavailable',
          'Your order is saved and waiting for payment. You can pay for it from Orders once payment is back.'
        );
        setOrderPlacementPhase('none');
      } catch (payErr) {
        Alert.alert(
          'Online payment unavailable',
          payErr instanceof Error
            ? payErr.message
            : 'Online payment is temporarily unavailable. Please choose Pay on Delivery.'
        );
        setOrderPlacementPhase('none');
      }
    } catch (err) {
      Alert.alert(
        'Could not place order',
        err instanceof Error ? err.message : 'Please try again.'
      );
      setOrderPlacementPhase('none');
    } finally {
      setPaying(false);
    }
  };

  const handleRazorpayResult = async (success: boolean, data: RazorpayResult) => {
    setRazorpayOpen(false);
    const paymentId = razorpaySession?.paymentId ?? '';
    if (!success) {
      // Nothing was charged (user dismissed, or the gateway rejected). Order is saved.
      Alert.alert(
        data.reason === 'dismissed' ? 'Payment cancelled' : 'Payment failed',
        'Your order is saved. You can try paying again from your orders.'
      );
      setOrderPlacementPhase('none');
      return;
    }

    if (!currentOrder) {
      setOrderPlacementPhase('none');
      return;
    }
    // Server places the order, or refunds automatically if it can't — no manual refund form.
    setOrderPlacementPhase('placing');
    await confirmPayment(currentOrder.id, paymentId, data);
    setOrderPlacementPhase('none');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <SmoothPressable onPress={() => router.back()} style={styles.iconBtn} pressScale={0.9}>
          <ArrowLeft color={TEXT} size={22} strokeWidth={2.2} />
        </SmoothPressable>
        <Text style={styles.headerTitle}>Order summary</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        {...PREMIUM_SCROLL}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.section}>
          <View style={styles.restaurantRow}>
            <View style={styles.restaurantIcon}>
              <Store color={ORANGE} size={16} strokeWidth={2.3} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurant?.name || cartData?.restaurantName || 'Restaurant'}
              </Text>
              <Text style={styles.restaurantMeta}>
                {itemCount} item{itemCount === 1 ? '' : 's'} ·{' '}
                {isTakeaway ? 'Takeaway' : 'Delivery'}
              </Text>
            </View>
          </View>

          <View style={styles.itemsBlock}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.vegDot} />
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  {formatLineTotal(item.itemTotal)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!isTakeaway ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin color={ORANGE} size={16} strokeWidth={2.2} />
              <Text style={styles.sectionTitle}>Deliver to</Text>
            </View>
            <Text style={styles.addressLabel}>{location?.label || 'Home'}</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {location?.formattedAddress || 'Add address from cart'}
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Store color={ORANGE} size={16} strokeWidth={2.2} />
              <Text style={styles.sectionTitle}>Pickup from restaurant</Text>
            </View>
            <Text style={styles.addressText}>{restaurant?.name}</Text>
          </View>
        )}

        {scheduledLabel ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock3 color={ORANGE} size={16} strokeWidth={2.2} />
              <Text style={styles.sectionTitle}>Scheduled delivery</Text>
            </View>
            <Text style={styles.scheduleValue}>{scheduledLabel}</Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.editLink}>Change schedule on cart</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Pressable style={styles.section} onPress={() => setPaymentModalOpen(true)}>
          <View style={styles.paymentRow}>
            <View style={styles.paymentIconWrap}>
              {paymentMethod === 'cod' ? (
                <Bike color={ORANGE} size={18} strokeWidth={2.3} />
              ) : paymentMethod === 'wallet' ? (
                <Wallet color={ORANGE} size={18} strokeWidth={2.3} />
              ) : (
                <CreditCard color={ORANGE} size={18} strokeWidth={2.3} />
              )}
            </View>
            <View style={styles.paymentBody}>
              <Text style={styles.paymentEyebrow}>PAY USING</Text>
              <Text style={styles.paymentTitle} numberOfLines={1}>
                {paymentMethodLabel(paymentMethod, paymentMethods.data)}
              </Text>
              <Text style={styles.paymentHint} numberOfLines={1}>
                {paymentMethodHint(paymentMethod)}
              </Text>
            </View>
            <View style={styles.paymentChange}>
              <Text style={styles.paymentChangeText}>Change</Text>
              <ChevronRight color={ORANGE} size={16} strokeWidth={2.4} />
            </View>
          </View>
        </Pressable>

        <View style={styles.billWrap}>
          {bill.isLoading && !bill.data ? (
            <View style={styles.section}>
              <ActivityIndicator color={ORANGE} />
            </View>
          ) : (
            <BillDetailsSection
              bill={billBreakdown}
              itemCount={itemCount}
              couponCode={couponCode ?? billBreakdown.couponCode}
              fallbackTotal={payable}
              hasDeliveryPin={Boolean(billPin) || isTakeaway}
              billLoading={bill.isLoading && !billBreakdown.billReady}
              billError={bill.isError}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerTotalRow}>
          <View>
            <Text style={styles.footerTotalLabel}>To pay</Text>
            <Text style={styles.footerTotalValue}>{formatInr(payable)}</Text>
          </View>
          <Text style={styles.footerMethod} numberOfLines={1}>
            {paymentMethodLabel(paymentMethod, paymentMethods.data)}
          </Text>
        </View>
        <SlideToConfirm
          label={`Slide to place order · ${formatInr(payable)}`}
          onConfirm={placeOrder}
          loading={paying}
          disabled={items.length === 0}
          color={ORANGE}
        />
      </View>

      <PaymentOptionsModal
        visible={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedMethod={paymentMethod}
        onSelectMethod={async (m) => {
          if (m === 'wallet') {
            try {
              await ensureWalletCoversCheckout();
              void bill.refetch();
            } catch (err) {
              Alert.alert(
                'Wallet',
                err instanceof Error ? err.message : 'Could not apply wallet',
              );
              return;
            }
          }
          setPaymentMethod(m);
          setPaymentModalOpen(false);
        }}
        onPay={async (m) => {
          if (m === 'wallet') {
            try {
              await ensureWalletCoversCheckout();
              void bill.refetch();
            } catch (err) {
              Alert.alert(
                'Wallet',
                err instanceof Error ? err.message : 'Could not apply wallet',
              );
              return;
            }
          }
          setPaymentMethod(m);
          setPaymentModalOpen(false);
        }}
        itemCount={itemCount}
        total={totalBeforeWallet}
          walletShortfall={billBreakdown.walletShortfall}
        savings={billBreakdown.discount}
        restaurantName={restaurant?.name || ''}
        addressLabel={location?.label || 'Delivery'}
        addressText={location?.formattedAddress || ''}
        savedMethods={paymentMethods.data}
        wallet={wallet.data}
      />

      <OrderPlacementModal
        phase={orderPlacementPhase}
        addressLabel={location?.label || 'Delivery'}
        addressText={location?.formattedAddress || ''}
        savings={billBreakdown.discount}
      />

      <RazorpayCheckoutModal
        visible={razorpayOpen}
        session={razorpaySession}
        onClose={() => {
          setRazorpayOpen(false);
          setOrderPlacementPhase('none');
        }}
        onResult={handleRazorpayResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.uiSemi,
    fontSize: 17,
    color: TEXT,
  },
  scroll: { paddingTop: 12 },
  section: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  restaurantIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: {
    fontFamily: fonts.uiSemi,
    fontSize: 15,
    color: TEXT,
  },
  restaurantMeta: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  itemsBlock: { gap: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT,
  },
  itemQty: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: TEXT_SEC,
    minWidth: 28,
    textAlign: 'right',
  },
  itemPrice: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT,
    minWidth: 48,
    textAlign: 'right',
  },
  addressLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  addressText: {
    marginTop: 4,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
    lineHeight: 19,
  },
  scheduleValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: ORANGE_DARK,
  },
  editLink: {
    marginTop: 6,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: ORANGE,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentBody: { flex: 1, gap: 2 },
  paymentEyebrow: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 0.6,
  },
  paymentTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  paymentHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  paymentChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  paymentChangeText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: ORANGE,
  },
  billWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  footerTotalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerTotalLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: TEXT_SEC,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footerTotalValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 22,
    color: TEXT,
  },
  footerMethod: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
});
