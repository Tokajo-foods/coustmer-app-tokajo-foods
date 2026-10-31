import { useRouter } from 'expo-router';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { BillDetailsSection } from '@/components/order/BillDetailsSection';
import {
  OrderPlacementModal,
  type PlacementPhase,
} from '@/components/order/OrderPlacementModal';
import { OrderSummaryDetails } from '@/components/order/OrderSummaryDetails';
import { PaymentOptionsModal } from '@/components/order/PaymentOptionsModal';
import { SlideToConfirm } from '@/components/order/SlideToConfirm';
import { ORANGE, TEXT, styles } from '@/components/order/order-summary-styles';
import { RazorpayCheckoutModal } from '@/components/payment/RazorpayCheckoutModal';
import { paymentMethodLabel, type PayChoice } from '@/lib/checkout/payment-display';
import { usePrepaidSchedule } from '@/lib/checkout/use-prepaid-schedule';
import { syncCheckoutWallet } from '@/lib/cart/ensure-wallet-checkout';
import { isDeliveryFeeReady } from '@/lib/cart/delivery-fee-ready';
import { useCheckoutTotals } from '@/lib/cart/use-checkout-totals';
import { formatInr } from '@/lib/format/money';
import { useCart, useCartBill } from '@/lib/cart/hooks';
import { formatScheduledForDisplay } from '@/lib/cart/schedule';
import { useCreateOrder } from '@/lib/order/hooks';
import { alertOngoingOrderBlocks } from '@/lib/order/ongoing-order-alert';
import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { buildCheckoutOrder, resolveCheckoutMethod } from '@/lib/order/build-checkout-order';
import { usePaymentWallet } from '@/lib/payment/hooks';
import { needsOnlinePayment, type PaymentMethodType } from '@/lib/payment/types';
import { preflightCheckoutMethod } from '@/lib/payment/checkout-preflight';
import { useCheckoutPayment } from '@/lib/payment/use-checkout-payment';
import { useUserProfile } from '@/lib/profile/hooks';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

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
  usePrepaidSchedule();
  const specialInstructions = useCartStore((s) => s.specialInstructions);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);

  const profile = useUserProfile();
  const wallet = usePaymentWallet();
  const remoteCart = useCart();
  const cartData = remoteCart.data;

  const billPin = useMemo(() => {
    if (location?.lat != null && location?.lng != null) return { lat: location.lat, lng: location.lng };
    const addr = cartData?.deliveryAddress;
    return addr?.lat != null && addr?.lng != null ? { lat: addr.lat, lng: addr.lng } : null;
  }, [location?.lat, location?.lng, cartData?.deliveryAddress]);

  const normalizedDeliveryType = deliveryType === 'takeaway' ? ('takeaway' as const) : ('delivery' as const);

  const hasItems = items.length > 0;
  const bill = useCartBill(billPin?.lat, billPin?.lng, hasItems, normalizedDeliveryType, hasItems);
  const createOrder = useCreateOrder();
  const { order: activeOrder } = usePrimaryActiveOrder();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderPlacementPhase, setOrderPlacementPhase] = useState<PlacementPhase>('none');

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  const { bill: billBreakdown, payable, totalBeforeWallet } = useCheckoutTotals({
    liveBill: bill.data,
    serverCart: cartData,
    deliveryType: normalizedDeliveryType,
    tip,
    paymentMethod,
  });
  const feeReady = isDeliveryFeeReady({
    deliveryType: normalizedDeliveryType,
    deliveryFee: cartData?.deliveryFee,
    deliveryFeeBase: cartData?.deliveryFeeBase,
    superFreeDelivery: cartData?.superFreeDelivery,
    autoFreeDelivery: cartData?.autoFreeDelivery,
    pinLat: billPin?.lat,
    pinLng: billPin?.lng,
    savedLat: cartData?.deliveryAddress?.lat,
    savedLng: cartData?.deliveryAddress?.lng,
    freshBill:
      bill.data != null &&
      !bill.isPlaceholderData &&
      bill.dataUpdatedAt >= remoteCart.dataUpdatedAt,
  });

  const displayName =
    profile.data?.displayName ||
    [profile.data?.firstName, profile.data?.lastName].filter(Boolean).join(' ') ||
    authUser?.firstName ||
    'Guest';

  const phoneDigits = (profile.data?.phone || authUser?.phone || '').replace(/\D/g, '');
  const phone =
    phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits || '0000000000';

  const checkout = useCheckoutPayment({
    customerName: displayName === 'Guest' ? undefined : displayName,
    contact: phoneDigits.length >= 10 ? phone : undefined,
    setPhase: setOrderPlacementPhase,
  });

  const scheduledLabel = formatScheduledForDisplay(scheduledFor);
  const isTakeaway = normalizedDeliveryType === 'takeaway';

  const placeOrder = async () => {
    // Online order already created (server cart is cleared): pay that order instead of placing a duplicate.
    if (checkout.unpaid) {
      await checkout.pay(checkout.unpaid);
      return;
    }
    if (!feeReady) return;
    if (!restaurant?.id || items.length === 0) {
      Alert.alert('Cart empty', 'Add items before placing your order.');
      router.back();
      return;
    }

    if (!isTakeaway && !location) {
      Alert.alert('Address missing', 'Select a delivery address from the cart.');
      return;
    }

    if (activeOrder) {
      alertOngoingOrderBlocks(activeOrder, router);
      return;
    }

    setPaying(true);

    try {
      const { method: mappedMethod } = resolveCheckoutMethod(paymentMethod);
      const online = needsOnlinePayment(mappedMethod);
      const blocked = await preflightCheckoutMethod(mappedMethod, {
        amount: payable, restaurantId: restaurant.id, isTakeaway, lat: billPin?.lat, lng: billPin?.lng,
        scheduled: Boolean(scheduledFor),
      });
      if (mappedMethod === 'wallet') void bill.refetch();
      if (blocked) {
        setOrderPlacementPhase('none');
        Alert.alert('Choose another way to pay', blocked, [
          { text: 'Change', onPress: () => setPaymentModalOpen(true) },
        ]);
        return;
      }

      if (!online) setOrderPlacementPhase('placing');

      const order = await createOrder.mutateAsync(
        buildCheckoutOrder({
          restaurant,
          items,
          location,
          isTakeaway,
          deliveryType,
          paymentMethod: mappedMethod,
          contactName: displayName,
          contactPhone: phone,
          specialInstructions,
          tip,
          scheduledFor,
        })
      );

      const amount = order.total ?? payable;

      if (!online) {
        setOrderPlacementPhase('placed');
        await new Promise((r) => setTimeout(r, 1200));
        router.replace({ pathname: '/orders/[orderId]/tracking', params: { orderId: order.id, newOrder: 'true' } });
        setOrderPlacementPhase('none');
        return;
      }

      await checkout.pay({
        id: order.id, orderNumber: order.orderNumber, amount,
        method: mappedMethod as PaymentMethodType,
      });
    } catch (err) {
      setOrderPlacementPhase('none');
      const code = (err as { code?: string }).code;
      if (code === 'ACTIVE_ORDER_EXISTS' && activeOrder) {
        alertOngoingOrderBlocks(activeOrder, router);
        return;
      }
      Alert.alert('Could not place order', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const chooseMethod = async (method: PayChoice) => {
    try {
      await syncCheckoutWallet(method);
    } catch (err) {
      Alert.alert('Wallet', err instanceof Error ? err.message : 'Could not apply wallet');
      return;
    }
    setPaymentMethod(method);
    setPaymentModalOpen(false);
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
        <OrderSummaryDetails
          restaurantName={restaurant?.name || cartData?.restaurantName || 'Restaurant'}
          itemCount={itemCount}
          isTakeaway={isTakeaway}
          items={items}
          addressLabel={location?.label}
          addressText={location?.formattedAddress}
          scheduledLabel={scheduledLabel}
          onChangeSchedule={() => router.back()}
          paymentMethod={paymentMethod}
          onChangePayment={() => setPaymentModalOpen(true)}
        />

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
              billLoading={!feeReady && bill.isLoading}
              billError={bill.isError}
              totalReady={feeReady}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerTotalRow}>
          <View>
            <Text style={styles.footerTotalLabel}>To pay</Text>
            <Text style={styles.footerTotalValue}>
              {feeReady ? formatInr(payable) : 'Calculating…'}
            </Text>
          </View>
          <Text style={styles.footerMethod} numberOfLines={1}>
            {paymentMethodLabel(paymentMethod, isTakeaway)}
          </Text>
        </View>
        <SlideToConfirm
          label={
            checkout.unpaid
              ? `Slide to pay · ${formatInr(checkout.unpaid.amount)}`
              : feeReady
                ? `Slide to place order · ${formatInr(payable)}`
                : 'Calculating delivery fee…'
          }
          onConfirm={placeOrder}
          loading={paying || checkout.initiating}
          disabled={!checkout.unpaid && (items.length === 0 || !feeReady)}
          color={ORANGE}
        />
      </View>

      <PaymentOptionsModal
        visible={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedMethod={paymentMethod}
        onSelectMethod={(m) => void chooseMethod(m)}
        itemCount={itemCount}
        total={totalBeforeWallet}
        amountReady={feeReady}
        walletShortfall={billBreakdown.walletShortfall}
        savings={billBreakdown.discount}
        restaurantName={restaurant?.name || ''}
        addressLabel={location?.label || 'Delivery'}
        addressText={location?.formattedAddress || ''}
        wallet={wallet.data}
        allowCod={!scheduledFor}
        isTakeaway={isTakeaway}
      />

      <OrderPlacementModal
        phase={orderPlacementPhase}
        addressLabel={location?.label || 'Delivery'}
        addressText={location?.formattedAddress || ''}
        savings={billBreakdown.discount}
      />

      <RazorpayCheckoutModal
        visible={checkout.open}
        session={checkout.session}
        onClose={checkout.close}
        onResult={(ok, data) => void checkout.onResult(ok, data)}
      />
    </View>
  );
}

