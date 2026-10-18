/** Client-side checks that mirror cart-service `assertSchedulable` (IST). */
import {
  DEFAULT_SCHEDULE_POLICY,
  formatIstTime12h,
  formatScheduleDayLabel,
  type ScheduleDay,
  type SchedulePolicy,
  type ScheduleWindow,
} from '@/lib/cart/schedule';

export type ScheduleChoice = {
  /** YYYY-MM-DD (IST) */
  date: string;
  /** Minutes after IST midnight. */
  minutes: number;
};

export type ScheduleCheck =
  | { ok: true; iso: string }
  | { ok: false; code: string; message: string };

/** YYYY-MM-DD + minutes-of-day (IST) → UTC ISO. */
export function istChoiceToIso(choice: ScheduleChoice): string {
  const [y, mo, d] = choice.date.split('-').map(Number);
  const utcMs = Date.UTC(y!, mo! - 1, d!, 0, 0, 0) + (choice.minutes - 330) * 60_000;
  return new Date(utcMs).toISOString();
}

/** UTC ISO → IST date + minutes-of-day. */
export function isoToIstChoice(iso: string): ScheduleChoice | null {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return null;
  const ist = new Date(ms + 330 * 60_000);
  const date = ist.toISOString().slice(0, 10);
  return { date, minutes: ist.getUTCHours() * 60 + ist.getUTCMinutes() };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatWindows(windows: ScheduleWindow[]): string {
  return windows
    .map((w) => `${formatIstTime12h(w.start)} – ${formatIstTime12h(w.end)}`)
    .join(', ');
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return formatIstTime12h(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
}

/** Why a calendar date cannot be picked, or null when it can. */
export function dateBlockReason(
  date: string,
  days: ScheduleDay[],
  policy: SchedulePolicy = DEFAULT_SCHEDULE_POLICY,
  now: number = Date.now(),
): string | null {
  const day = days.find((d) => d.date === date);
  if (!day) {
    return days.length && date < days[0]!.date
      ? 'That date has already passed.'
      : `You can schedule up to ${policy.maxAdvanceDays} days in advance.`;
  }
  if (!day.isOpen || day.windows.length === 0) {
    return `The restaurant is closed on ${formatScheduleDayLabel(date)}.`;
  }
  if (!day.slots.some((s) => s.available)) {
    const limit = now + policy.maxAdvanceDays * 86_400_000;
    const beyondLimit = day.slots.length > 0
      && day.slots.every((s) => new Date(s.startIso).getTime() > limit);
    return beyondLimit
      ? `You can schedule up to ${policy.maxAdvanceDays} days in advance.`
      : `No delivery times left on ${formatScheduleDayLabel(date)}.`;
  }
  return null;
}

export function validateScheduleChoice(
  choice: ScheduleChoice,
  days: ScheduleDay[],
  policy: SchedulePolicy = DEFAULT_SCHEDULE_POLICY,
  now: number = Date.now(),
): ScheduleCheck {
  const blocked = dateBlockReason(choice.date, days, policy, now);
  if (blocked) return { ok: false, code: 'SCHEDULE_DATE_BLOCKED', message: blocked };

  if (choice.minutes % policy.stepMinutes !== 0) {
    return {
      ok: false,
      code: 'SCHEDULE_INVALID_TIME',
      message: `Pick a time in ${policy.stepMinutes}-minute steps.`,
    };
  }

  const iso = istChoiceToIso(choice);
  const at = new Date(iso).getTime();
  if (at < now + policy.minLeadMinutes * 60_000) {
    return {
      ok: false,
      code: 'SCHEDULE_TOO_SOON',
      message: `Choose a time at least ${policy.minLeadMinutes} minutes from now.`,
    };
  }
  if (at > now + policy.maxAdvanceDays * 86_400_000) {
    return {
      ok: false,
      code: 'SCHEDULE_TOO_FAR',
      message: `You can schedule up to ${policy.maxAdvanceDays} days in advance.`,
    };
  }

  const day = days.find((d) => d.date === choice.date)!;
  const inside = day.windows.some(
    (w) => choice.minutes >= toMinutes(w.start) && choice.minutes <= toMinutes(w.end),
  );
  if (!inside) {
    return {
      ok: false,
      code: 'SCHEDULE_OUTSIDE_HOURS',
      message: `The restaurant isn't delivering at ${minutesToLabel(choice.minutes)}. Delivery on ${formatScheduleDayLabel(choice.date)}: ${formatWindows(day.windows)}.`,
    };
  }
  return { ok: true, iso };
}

/** First bookable slot on a date (used when the customer switches days). */
export function firstAvailableMinutes(day: ScheduleDay | undefined): number | null {
  const slot = day?.slots.find((s) => s.available);
  return slot ? toMinutes(slot.start) : null;
}
