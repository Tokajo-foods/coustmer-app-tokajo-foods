/** Cart schedule helpers (Asia/Kolkata). */

export type ScheduleSlot = {
  start: string;
  end: string;
  available: boolean;
  startIso: string;
};

/** IST delivery window, `end` may be `24:00`. */
export type ScheduleWindow = { start: string; end: string };

export type ScheduleDay = {
  date: string;
  isOpen: boolean;
  windows: ScheduleWindow[];
  slots: ScheduleSlot[];
};

export type SchedulePolicy = {
  minLeadMinutes: number;
  maxAdvanceDays: number;
  stepMinutes: number;
  kitchenLeadMinutes: number;
};

export const DEFAULT_SCHEDULE_POLICY: SchedulePolicy = {
  minLeadMinutes: 45,
  maxAdvanceDays: 3,
  stepMinutes: 15,
  kitchenLeadMinutes: 0,
};

export type ScheduleSlotsResponse = {
  timezone: string;
  scheduleSupported: boolean;
  policy: SchedulePolicy;
  /** Single-day shape */
  date?: string;
  slots?: ScheduleSlot[];
  /** Multi-day shape */
  days?: ScheduleDay[];
};

export function istTodayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function formatScheduleDayLabel(ymd: string): string {
  const [y, mo, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y!, mo! - 1, d!, 12, 0, 0));
  const today = istTodayYmd();
  const tomorrow = addIstDays(today, 1);
  if (ymd === today) return 'Today';
  if (ymd === tomorrow) return 'Tomorrow';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatScheduleSlotLabel(start: string, end: string): string {
  return `${formatIstTime12h(start)} – ${formatIstTime12h(end)}`;
}

export function formatScheduledForDisplay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const when = new Date(iso);
  if (!Number.isFinite(when.getTime())) return null;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(when);
}

export function formatIstTime12h(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(':');
  const h = Number(hRaw) % 24;
  const m = Number(mRaw);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function addIstDays(ymd: string, days: number): string {
  const [y, mo, d] = ymd.split('-').map(Number);
  const utc = new Date(Date.UTC(y!, mo! - 1, d! + days, 12, 0, 0));
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(utc);
}

export function normalizeScheduleSlotsResponse(raw: unknown): ScheduleSlotsResponse {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const timezone = String(record.timezone ?? 'Asia/Kolkata');
  const scheduleSupported = record.scheduleSupported !== false;

  const mapSlot = (s: unknown): ScheduleSlot => {
    const row = s && typeof s === 'object' ? (s as Record<string, unknown>) : {};
    const start = String(row.start ?? row.startTime ?? '');
    const end = String(row.end ?? row.endTime ?? '');
    const startIso = String(row.startIso ?? row.scheduledFor ?? '');
    return {
      start,
      end,
      startIso,
      available: row.available !== false,
    };
  };

  const mapWindows = (raw: unknown): ScheduleWindow[] =>
    Array.isArray(raw)
      ? raw
          .map((w) => {
            const row = w && typeof w === 'object' ? (w as Record<string, unknown>) : {};
            return { start: String(row.start ?? ''), end: String(row.end ?? '') };
          })
          .filter((w) => /^\d{2}:\d{2}$/.test(w.start) && /^\d{2}:\d{2}$/.test(w.end))
      : [];

  const policyRaw =
    record.policy && typeof record.policy === 'object'
      ? (record.policy as Record<string, unknown>)
      : {};
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : fallback;
  const policy: SchedulePolicy = {
    minLeadMinutes: num(policyRaw.minLeadMinutes, DEFAULT_SCHEDULE_POLICY.minLeadMinutes),
    maxAdvanceDays: num(policyRaw.maxAdvanceDays, DEFAULT_SCHEDULE_POLICY.maxAdvanceDays),
    stepMinutes: num(policyRaw.stepMinutes, DEFAULT_SCHEDULE_POLICY.stepMinutes),
    kitchenLeadMinutes: num(policyRaw.kitchenLeadMinutes, DEFAULT_SCHEDULE_POLICY.kitchenLeadMinutes),
  };

  const mapDay = (raw: unknown, fallbackDate: string): ScheduleDay => {
    const d = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const windows = mapWindows(d.windows);
    return {
      date: String(d.date ?? fallbackDate),
      isOpen: d.isOpen === true || windows.length > 0,
      windows,
      slots: Array.isArray(d.slots) ? d.slots.map(mapSlot) : [],
    };
  };

  if (Array.isArray(record.days)) {
    return {
      timezone,
      scheduleSupported,
      policy,
      days: record.days.map((day) => mapDay(day, '')),
    };
  }

  const single = mapDay(record, istTodayYmd());
  return {
    timezone,
    scheduleSupported,
    policy,
    date: single.date,
    slots: single.slots,
    days: [single],
  };
}
