/**
 * One display phase for the tracking screen, from the kitchen order status and the rider trip status.
 * The order ticket owns kitchen phases; the trip owns everything from pickup onward (and RTO).
 */

export type TrackingStep = 'placed' | 'preparing' | 'on_the_way' | 'delivered';

export type TrackingPhaseKey =
  | 'awaiting_payment'
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'scheduled'
  | 'on_the_way'
  | 'at_door'
  | 'returning'
  | 'returned'
  | 'delivered'
  | 'cancelled';

export type TrackingPhase = {
  key: TrackingPhaseKey;
  title: string;
  hint: string;
  step: TrackingStep;
  /** Order still in progress: sockets and polling stay on. */
  active: boolean;
  completed: boolean;
  cancelled: boolean;
  rto: boolean;
  /** An arrival ETA makes sense for the customer in this phase. */
  showEta: boolean;
};

export const TRACKING_STEPS: { key: TrackingStep; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'on_the_way', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

const CANCELLED = new Set(['cancelled', 'canceled', 'rejected', 'failed', 'payment_failed']);
const ON_THE_WAY = new Set(['picked_up', 'out_for_delivery', 'on_the_way']);

function norm(status?: string | null): string {
  return String(status ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function phase(
  key: TrackingPhaseKey,
  title: string,
  hint: string,
  step: TrackingStep,
  extra: Partial<Pick<TrackingPhase, 'active' | 'completed' | 'cancelled' | 'rto' | 'showEta'>> = {},
): TrackingPhase {
  return {
    key, title, hint, step,
    active: extra.active ?? true,
    completed: extra.completed ?? false,
    cancelled: extra.cancelled ?? false,
    rto: extra.rto ?? false,
    showEta: extra.showEta ?? true,
  };
}

function riderPickupHint(trip: string, fallback: string): string {
  if (trip === 'arrived_at_restaurant') return 'Your delivery partner is at the restaurant';
  if (trip === 'accepted') return 'Your delivery partner is on the way to the restaurant';
  return fallback;
}

export function resolveTrackingPhase(orderStatus?: string | null, tripStatus?: string | null): TrackingPhase {
  const o = norm(orderStatus);
  const t = norm(tripStatus);

  if (o === 'delivered' || o === 'completed' || t === 'delivered') {
    return phase('delivered', 'Completed', 'Your order was delivered successfully', 'delivered', {
      active: false, completed: true, showEta: false,
    });
  }
  if (t === 'returned') {
    return phase('returned', 'Order returned', 'We could not complete the delivery. The order went back to the restaurant.', 'on_the_way', {
      active: false, cancelled: true, rto: true, showEta: false,
    });
  }
  if (t === 'returning_to_restaurant') {
    return phase('returning', 'Returning to restaurant', 'We could not complete the delivery. Your partner is taking the order back.', 'on_the_way', {
      rto: true, showEta: false,
    });
  }
  if (CANCELLED.has(o)) {
    return phase('cancelled', 'Cancelled', 'This order was cancelled', 'preparing', {
      active: false, cancelled: true, showEta: false,
    });
  }
  if (t === 'arrived_at_customer') {
    return phase('at_door', 'Partner at your door', 'Share the delivery OTP below to complete your order', 'on_the_way', {
      showEta: false,
    });
  }
  if (ON_THE_WAY.has(t) || o === 'out_for_delivery') {
    return phase('on_the_way', 'Out for delivery', 'Your partner is on the way', 'on_the_way');
  }
  if (o === 'pending_payment' || o === 'pending') {
    return phase('awaiting_payment', 'Awaiting payment', 'Complete payment to place your order', 'placed', { showEta: false });
  }
  if (o === 'scheduled') {
    return phase('scheduled', 'Scheduled', 'We will start preparing closer to your slot', 'placed', { active: false, showEta: false });
  }
  if (o === 'ready') {
    return phase('ready', 'Ready for pickup', riderPickupHint(t, 'Assigning a delivery partner'), 'preparing');
  }
  if (o === 'preparing') {
    return phase('preparing', 'Preparing your food', riderPickupHint(t, 'Kitchen is crafting your order'), 'preparing');
  }
  if (o === 'accepted' || o === 'confirmed' || o === 'partially_fulfilled') {
    return phase('confirmed', 'Order confirmed', riderPickupHint(t, 'Restaurant has accepted your order'), 'placed');
  }
  return phase('placed', 'Order placed', 'Waiting for the restaurant to accept', 'placed');
}

export function stepIndex(step: TrackingStep): number {
  return TRACKING_STEPS.findIndex((s) => s.key === step);
}
