/**
 * One display phase for the tracking screen, from the kitchen order status and the rider trip status.
 * The order ticket owns kitchen phases; the trip owns everything from pickup onward (and RTO).
 */

export type TrackingStep = 'placed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered';

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

export const PICKUP_TRACKING_STEPS: { key: TrackingStep; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Picked up' },
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

function resolvePickupPhase(orderStatus?: string | null): TrackingPhase {
  const o = norm(orderStatus);
  if (o === 'delivered' || o === 'completed') {
    return phase('delivered', 'Picked up', 'You collected this order at the restaurant', 'delivered', {
      active: false, completed: true, showEta: false,
    });
  }
  if (CANCELLED.has(o)) {
    return phase('cancelled', 'Cancelled', 'This order was cancelled', 'preparing', {
      active: false, cancelled: true, showEta: false,
    });
  }
  if (o === 'pending_payment' || o === 'pending') {
    return phase('awaiting_payment', 'Awaiting payment', 'Complete payment to place your order', 'placed', { showEta: false });
  }
  if (o === 'scheduled') {
    return phase('scheduled', 'Scheduled', 'The kitchen will start closer to your slot', 'placed', {
      active: false, showEta: false,
    });
  }
  if (o === 'ready' || o === 'out_for_delivery') {
    return phase('ready', 'Ready for pickup', 'Collect your order at the restaurant counter', 'ready', { showEta: false });
  }
  if (o === 'preparing') {
    return phase('preparing', 'Preparing your food', 'The kitchen is making your order', 'preparing', { showEta: true });
  }
  if (o === 'accepted' || o === 'confirmed' || o === 'partially_fulfilled') {
    return phase('confirmed', 'Order confirmed', 'The restaurant has accepted your takeaway order', 'placed', { showEta: true });
  }
  return phase('placed', 'Order placed', 'Waiting for the restaurant to accept', 'placed', {
    showEta: true,
  });
}

export function resolveTrackingPhase(
  orderStatus?: string | null,
  tripStatus?: string | null,
  opts?: { pickup?: boolean },
): TrackingPhase {
  if (opts?.pickup) return resolvePickupPhase(orderStatus);

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
  return phase('placed', 'Order placed', 'Waiting for the restaurant to accept', 'placed', {
    showEta: true,
  });
}

export function stepIndex(
  step: TrackingStep,
  steps: { key: TrackingStep; label: string }[] = TRACKING_STEPS,
): number {
  const idx = steps.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : 0;
}
