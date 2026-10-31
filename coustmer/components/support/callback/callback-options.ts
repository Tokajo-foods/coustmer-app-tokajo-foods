import type { CallbackRequestPayload } from '@/lib/support/types';

export type CallbackReason = NonNullable<CallbackRequestPayload['reason']>;
export type CallbackWindow = NonNullable<CallbackRequestPayload['window']>;

/** Must match customer-service RequestCallbackSchema. */
export const CALLBACK_REASONS: { id: CallbackReason; label: string; needsOrder: boolean }[] = [
  { id: 'order_issue', label: 'Order issue', needsOrder: true },
  { id: 'delivery_issue', label: 'Delivery issue', needsOrder: true },
  { id: 'payment_issue', label: 'Payment or refund', needsOrder: true },
  { id: 'restaurant_issue', label: 'Restaurant or food', needsOrder: true },
  { id: 'account_issue', label: 'My account', needsOrder: false },
  { id: 'other', label: 'Something else', needsOrder: false },
];

export const CALLBACK_WINDOWS: { id: CallbackWindow; label: string; endHour: number }[] = [
  { id: '10_12', label: '10 AM – 12 PM', endHour: 12 },
  { id: '12_14', label: '12 PM – 2 PM', endHour: 14 },
  { id: '14_18', label: '2 PM – 6 PM', endHour: 18 },
  { id: '18_21', label: '6 PM – 9 PM', endHour: 21 },
];

/** Support calls run on India time; a slot that has already ended today is served tomorrow. */
function istHour(now: Date): number {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return ((utcMinutes + 330) % (24 * 60)) / 60;
}

export function windowDayLabel(endHour: number, now = new Date()): 'Today' | 'Tomorrow' {
  return istHour(now) < endHour - 0.5 ? 'Today' : 'Tomorrow';
}

/** First slot still callable today, else the first slot tomorrow. */
export function defaultWindow(now = new Date()): CallbackWindow {
  return CALLBACK_WINDOWS.find((w) => windowDayLabel(w.endHour, now) === 'Today')?.id ?? '10_12';
}
