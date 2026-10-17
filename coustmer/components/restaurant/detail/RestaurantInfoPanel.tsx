import type { ReactNode } from 'react';
import {
  Banknote,
  CalendarClock,
  CreditCard,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Restaurant, RestaurantTimings } from '@/lib/restaurant/types';

import { RestaurantInfoOutletCard } from './RestaurantInfoOutletCard';
import {
  formatScheduleDay,
  RestaurantInfoHoursList,
  RestaurantInfoWeeklyHours,
  type HoursRow,
} from './RestaurantInfoWeeklyHours';
import { infoColors, infoStyles as styles } from './restaurant-info-panel-styles';
import { formatInr } from '@/lib/format/money';

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type RestaurantInfoPanelProps = {
  restaurant: Restaurant;
  restaurantName: string;
  description: string;
  locationText: string;
  eta: string | null;
  distanceKm?: number;
  kitchenClosed: boolean;
  nextOpenLabel: string | null;
  openNow: boolean | undefined;
  showHygieneScore: boolean;
  infoHygieneScore?: number;
  infoFssaiFull?: string;
  showInfoFssaiOrHygiene: boolean;
  token: string | null;
  watchingOpen: boolean;
  notifyPending: boolean;
  onToggleNotifyOpen: () => void;
  timings?: RestaurantTimings;
  holidays: { date: string; reason?: string }[];
  specialHours: {
    date: string;
    openTime: string;
    closeTime: string;
    reason?: string;
  }[];
  /** Keeps white Info background flush to the bottom of the screen while scrolling. */
  fillMinHeight?: number;
};

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function buildWeeklyHours(
  timings: RestaurantTimings | undefined,
  legacy: Restaurant['timings'],
  todayKey: string
): HoursRow[] {
  const byKey = new Map<string, HoursRow>();

  if (timings?.slots && Object.keys(timings.slots).length) {
    for (const day of Object.keys(timings.slots)) {
      const value = timings.slots[day];
      const slotText = Array.isArray(value)
        ? value
            .map(
              (s) =>
                s.label || (s.open && s.close ? `${s.open}–${s.close}` : s.open)
            )
            .filter(Boolean)
            .join(', ')
        : String(value ?? '');
      const closed = !slotText || slotText.toLowerCase() === 'closed';
      const key = day.toLowerCase();
      byKey.set(key, {
        key,
        day: formatScheduleDay(key),
        value: slotText || 'Closed',
        closed,
        today: key === todayKey,
      });
    }
  } else if (legacy) {
    for (const [day, value] of Object.entries(legacy)) {
      const dayInfo =
        value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
      const open = dayInfo.isOpen === true;
      const slots = Array.isArray(dayInfo.slots)
        ? (dayInfo.slots as { open?: string; close?: string }[])
        : [];
      const slotText = slots
        .map((s) => (s.open && s.close ? `${s.open}–${s.close}` : null))
        .filter(Boolean)
        .join(', ');
      const key = day.toLowerCase();
      byKey.set(key, {
        key,
        day: formatScheduleDay(key),
        value: open ? slotText || 'Open' : 'Closed',
        closed: !open,
        today: key === todayKey,
      });
    }
  }

  const ordered: HoursRow[] = [];
  for (const day of WEEKDAYS) {
    const row = byKey.get(day);
    if (row) ordered.push(row);
  }
  for (const [key, row] of byKey) {
    if (!WEEKDAYS.includes(key as (typeof WEEKDAYS)[number])) ordered.push(row);
  }
  return ordered;
}

export function RestaurantInfoPanel({
  restaurant: r,
  restaurantName,
  description,
  locationText,
  eta,
  distanceKm,
  kitchenClosed,
  nextOpenLabel,
  openNow,
  showHygieneScore,
  infoHygieneScore,
  infoFssaiFull,
  showInfoFssaiOrHygiene,
  token,
  watchingOpen,
  notifyPending,
  onToggleNotifyOpen,
  timings,
  holidays,
  specialHours,
  fillMinHeight,
}: RestaurantInfoPanelProps) {
  const { ORANGE, MUTED } = infoColors;

  const todayKey = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][new Date().getDay()];

  const stats: { key: string; label: string; value: string }[] = [];
  const cost = r.costForTwo ?? r.priceForTwo;
  if (typeof cost === 'number') {
    stats.push({
      key: 'cost',
      label: 'Cost for two',
      value: `${formatInr(cost)}${r.priceRange ? ` · ${r.priceRange}` : ''}`,
    });
  }
  if (eta) stats.push({ key: 'eta', label: 'Delivery time', value: eta });
  if (typeof distanceKm === 'number') {
    stats.push({
      key: 'dist',
      label: 'Distance',
      value: `${distanceKm.toFixed(1)} km`,
    });
  }
  if (typeof r.minOrderValue === 'number' && r.minOrderValue > 0) {
    stats.push({ key: 'min', label: 'Min order', value: `${formatInr(r.minOrderValue)}` });
  }
  if (typeof r.freeDeliveryThreshold === 'number' && r.freeDeliveryThreshold > 0) {
    stats.push({
      key: 'free',
      label: 'Free delivery',
      value: `Above ${formatInr(r.freeDeliveryThreshold)}`,
    });
  }

  const paymentOptions = [
    r.isOnlinePayment !== false
      ? {
          id: 'online',
          label: 'Online',
          icon: <CreditCard size={15} color={ORANGE} />,
        }
      : null,
    r.isCashOnDelivery !== false
      ? {
          id: 'cod',
          label: 'Cash on delivery',
          icon: <Banknote size={15} color={ORANGE} />,
        }
      : null,
    r.acceptScheduledOrders
      ? {
          id: 'sched',
          label: 'Scheduled',
          icon: <CalendarClock size={15} color={ORANGE} />,
        }
      : null,
  ].filter(Boolean) as { id: string; label: string; icon: ReactNode }[];

  const weeklyHours = buildWeeklyHours(timings, r.timings, todayKey);

  return (
    <View
      style={[
        styles.root,
        fillMinHeight != null && fillMinHeight > 0
          ? { minHeight: fillMinHeight, flexGrow: 1 }
          : null,
      ]}
    >
      <RestaurantInfoOutletCard
        kitchenClosed={kitchenClosed}
        openNow={openNow}
        nextOpenLabel={nextOpenLabel}
        isPureVeg={r.isPureVeg}
        showHygieneScore={showHygieneScore}
        infoHygieneScore={infoHygieneScore}
        stats={stats}
        token={token}
        watchingOpen={watchingOpen}
        notifyPending={notifyPending}
        onToggleNotifyOpen={onToggleNotifyOpen}
      />

      <View style={styles.card}>
        <SectionTitle title={`About ${restaurantName}`} />
        <Text style={styles.body}>{description}</Text>
        {(r.cuisines?.length ?? 0) > 0 ? (
          <View style={styles.chipWrap}>
            {r.cuisines!.slice(0, 10).map((c) => (
              <View key={c} style={styles.chip}>
                <Text style={styles.chipText}>{c}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <RestaurantInfoWeeklyHours rows={weeklyHours} />

      <View style={styles.card}>
        <View style={styles.sectionHead}>
          <MapPin color={ORANGE} size={17} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.body}>{locationText}</Text>
      </View>

      {paymentOptions.length > 0 ? (
        <View style={styles.card}>
          <SectionTitle title="Payments" />
          <View style={styles.payRow}>
            {paymentOptions.map((p) => (
              <View key={p.id} style={styles.payPill}>
                {p.icon}
                <Text style={styles.payPillText}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {showInfoFssaiOrHygiene ? (
        <View style={styles.card}>
          <SectionTitle title="Licenses & safety" />
          <View style={styles.complianceBlock}>
            {infoFssaiFull ? (
              <View style={styles.complianceRow}>
                <ShieldCheck color={ORANGE} size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.complianceLabel}>FSSAI license</Text>
                  <Text style={styles.fssaiMono}>{infoFssaiFull}</Text>
                </View>
              </View>
            ) : null}
            {showHygieneScore ? (
              <View style={styles.complianceRow}>
                <ShieldCheck color={ORANGE} size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.complianceLabel}>Hygiene rating</Text>
                  <Text style={styles.body}>
                    {infoHygieneScore} <Text style={{ color: MUTED }}>/ 5</Text>
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <RestaurantInfoHoursList
        title="Upcoming closed dates"
        rows={holidays.slice(0, 5).map((h) => ({
          key: h.date,
          day: h.date,
          value: h.reason || 'Closed',
        }))}
      />

      <RestaurantInfoHoursList
        title="Special hours"
        rows={specialHours.slice(0, 5).map((sh) => ({
          key: sh.date,
          day: sh.date,
          value: `${sh.openTime}–${sh.closeTime}${sh.reason ? ` · ${sh.reason}` : ''}`,
        }))}
      />
    </View>
  );
}
