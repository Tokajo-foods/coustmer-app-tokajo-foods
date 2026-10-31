import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderContactCard } from '@/components/call/OrderContactCard';
import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { ParcelProofSection } from '@/components/order/ParcelProofSection';
import { TrackingCompletedActions } from '@/components/order/tracking/TrackingCompletedActions';
import { TrackingDeliveryControls } from '@/components/order/tracking/TrackingDeliveryControls';
import { formatDistance } from '@/components/order/tracking/tracking-eta';
import { TrackingMapHeader } from '@/components/order/tracking/TrackingMapHeader';
import { TrackingOrderSummary } from '@/components/order/tracking/TrackingOrderSummary';
import { TrackingOtpCard } from '@/components/order/tracking/TrackingOtpCard';
import { TrackingPartnerCard } from '@/components/order/tracking/TrackingPartnerCard';
import { TrackingStatusSection } from '@/components/order/tracking/TrackingStatusSection';
import { SHEET, WHITE } from '@/components/order/tracking/tracking-theme';
import { useLiveOrderTracking } from '@/components/order/tracking/use-live-order-tracking';
import { useDropOtp } from '@/lib/delivery/hooks';
import { errorStatus } from '@/lib/delivery/http';
import { resolveTrackingPins } from '@/lib/delivery/tracking-pins';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';
import { useCartStore } from '@/store/cart-store';

function orderErrorMessage(error: unknown): string {
  const status = errorStatus(error);
  if (status === 403) return 'You cannot track this order';
  if (status === 404) return 'Order not found';
  return error instanceof Error ? error.message : 'Tracking unavailable';
}

export function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId, newOrder } = useLocalSearchParams<{ orderId: string; newOrder?: string }>();
  const id = String(orderId ?? '');
  const clearCart = useCartStore((s) => s.clearCart);
  const live = useLiveOrderTracking(id);
  const { order, o, t, phase, pickup } = live;
  const otpQuery = useDropOtp(id, !pickup && phase.active && Boolean(t?.deliveryId) && !phase.rto);

  useEffect(() => {
    if (newOrder !== 'true') return;
    const timer = setTimeout(async () => {
      try {
        const { cartApi } = await import('@/lib/cart/api');
        await cartApi.clearCart();
      } catch {
        // local clear still runs
      } finally {
        clearCart();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [newOrder, clearCart]);

  const goBack = () => {
    if (newOrder === 'true') {
      router.replace('/orders');
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/orders');
  };
  const openHelp = () => router.push({ pathname: '/orders/[orderId]/issues', params: { orderId: id } });

  if (!id) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <ErrorView message="Order not found" onRetry={goBack} />
      </View>
    );
  }

  if (!o && order.isLoading) return <LoadingView label="Loading tracking…" />;

  if (!o) {
    const blocked = [403, 404].includes(errorStatus(order.error) ?? 0) || live.trackingForbidden;
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <ErrorView
          message={live.trackingForbidden ? 'You cannot track this order' : orderErrorMessage(order.error)}
          onRetry={blocked ? goBack : live.refetchAll}
        />
      </View>
    );
  }

  const pins = resolveTrackingPins({
    restaurantLat: t?.restaurantLat,
    restaurantLng: t?.restaurantLng,
    customerLat: t?.customerLat,
    customerLng: t?.customerLng,
    addressLat: o.deliveryAddress?.lat,
    addressLng: o.deliveryAddress?.lng,
  });
  const itemCount = (o.items ?? []).reduce((n, i) => n + i.quantity, 0);
  const kicker = `${pickup ? 'Takeaway  ·  ' : ''}${o.restaurantName || 'Your order'}${o.orderNumber ? `  ·  #${String(o.orderNumber).replace(/^#/, '')}` : ''}`;
  const showMap = !pickup && live.riderVisible;
  const showControls = !pickup && Boolean(live.partner) && (phase.active || phase.completed);

  return (
    <View style={styles.container}>
      <TrackingMapHeader
        phase={phase}
        showMap={showMap}
        pins={pins}
        restName={o.restaurantName || 'Restaurant'}
        rider={live.riderFix}
        stale={live.riderStale}
        leg={live.mapLeg}
        socketLive={live.socketLive}
        distanceLabel={formatDistance(live.distanceMeters)}
        onBack={goBack}
        onHelp={openHelp}
      />

      <View style={[styles.sheet, !showMap && styles.sheetFlat]}>
        {showMap ? <View style={styles.handle} /> : null}
        <ScrollView
          {...PREMIUM_SCROLL}
          contentContainerStyle={{
            paddingTop: showMap ? 4 : 12,
            paddingBottom: insets.bottom + 28,
            paddingHorizontal: 18,
          }}
        >
          <TrackingStatusSection
            phase={phase}
            kicker={kicker}
            eta={live.eta}
            itemCount={itemCount}
            pickup={pickup}
            promisedReadyAt={o.promisedReadyAt}
            estimatedPrepTime={o.estimatedPrepTime}
            delayMinutes={o.delayMinutes}
          />

          {pickup ? null : (
            <TrackingPartnerCard orderId={id} phase={phase} partner={live.partner} onHelp={openHelp} />
          )}

          <OrderContactCard
            orderId={id}
            phase={phase}
            partner={pickup ? null : live.partner}
            restaurantName={o.restaurantName || 'Restaurant'}
            hideRider={pickup}
          />

          {!phase.active ? <TrackingCompletedActions orderId={id} orderStatus={live.orderStatus} /> : null}

          {!pickup && phase.active && otpQuery.data?.otp ? (
            <TrackingOtpCard otp={otpQuery.data} atDoor={phase.key === 'at_door'} />
          ) : null}

          {pickup ? null : (
            <ParcelProofSection pickupProofUrl={t?.pickupProofUrl} proofOfDelivery={t?.proofOfDelivery} />
          )}

          {showControls ? <TrackingDeliveryControls orderId={id} phase={phase} /> : null}

          <TrackingOrderSummary order={o} active={phase.active} pickup={pickup} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SHEET },
  safe: { flex: 1, backgroundColor: WHITE, justifyContent: 'center' },
  sheet: {
    flex: 1,
    marginTop: -22,
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetFlat: { marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, shadowOpacity: 0, elevation: 0 },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 10,
    marginBottom: 28,
  },
});
