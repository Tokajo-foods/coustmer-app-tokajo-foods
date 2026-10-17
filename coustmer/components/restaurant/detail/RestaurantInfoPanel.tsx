import type { ReactNode } from 'react';
import { Pressable } from '@/components/common/Pressable';
import {
  Banknote,
  Bell,
  BellOff,
  CalendarClock,
  Clock,
  CreditCard,
  IndianRupee,
  Leaf,
  MapPin,
  Navigation,
  ShieldCheck,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Restaurant, RestaurantTimings } from '@/lib/restaurant/types';

import { infoColors, infoStyles as styles } from './restaurant-info-panel-styles';

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
};

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ScheduleList({
  rows,
}: {
  rows: { key: string; day: string; value: string; active?: boolean }[];
}) {
  return (
    <View style={styles.scheduleList}>
      {rows.map((row, i) => (
        <View
          key={row.key}
          style={[
            styles.scheduleRow,
            i === rows.length - 1 ? styles.scheduleRowLast : null,
          ]}
        >
          <Text style={styles.scheduleDay}>{row.day}</Text>
          <Text
            style={[
              styles.scheduleValue,
              row.active ? styles.scheduleValueActive : null,
            ]}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
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
}: RestaurantInfoPanelProps) {
  const { ORANGE, MUTED } = infoColors;

  const statusTitle = kitchenClosed
    ? nextOpenLabel
      ? `Closed · opens ${nextOpenLabel}`
      : 'Currently closed'
    : openNow
      ? 'Open now'
      : 'Outlet hours';
  const statusSub = kitchenClosed
    ? 'Not accepting orders right now'
    : openNow
      ? 'Accepting delivery orders'
      : 'See weekly hours below';

  const stats: { key: string; label: string; value: string }[] = [];
  const cost = r.costForTwo ?? r.priceForTwo;
  if (typeof cost === 'number') {
    stats.push({
      key: 'cost',
      label: 'Cost for two',
      value: `₹${cost}${r.priceRange ? ` · ${r.priceRange}` : ''}`,
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
    stats.push({ key: 'min', label: 'Min order', value: `₹${r.minOrderValue}` });
  }
  if (typeof r.freeDeliveryThreshold === 'number' && r.freeDeliveryThreshold > 0) {
    stats.push({
      key: 'free',
      label: 'Free delivery',
      value: `Above ₹${r.freeDeliveryThreshold}`,
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

  const scheduleRows: {
    key: string;
    day: string;
    value: string;
    active?: boolean;
  }[] = [];

  if (timings?.slots && Object.keys(timings.slots).length) {
    const days = [
      ...WEEKDAYS.filter((day) => timings.slots?.[day] != null),
      ...Object.keys(timings.slots).filter(
        (day) => !WEEKDAYS.includes(day.toLowerCase() as (typeof WEEKDAYS)[number])
      ),
    ];
    for (const day of days) {
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
      scheduleRows.push({
        key: day,
        day: day.charAt(0).toUpperCase() + day.slice(1),
        value: slotText || 'Closed',
        active: !closed,
      });
    }
  } else if (r.timings) {
    for (const [day, value] of Object.entries(r.timings)) {
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
      scheduleRows.push({
        key: day,
        day: day.charAt(0).toUpperCase() + day.slice(1),
        value: open ? slotText || 'Open' : 'Closed',
        active: open,
      });
    }
  }

  const notifyOutline = watchingOpen;

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.sectionKicker}>Outlet</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              kitchenClosed ? styles.statusDotClosed : styles.statusDotOpen,
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{statusTitle}</Text>
            <Text style={styles.statusSub}>{statusSub}</Text>
            <View style={styles.badgeRow}>
              {r.isPureVeg ? (
                <View style={styles.badge}>
                  <Leaf color={ORANGE} size={14} />
                  <Text style={styles.badgeText}>Pure veg</Text>
                </View>
              ) : null}
              {showHygieneScore ? (
                <View style={styles.badge}>
                  <ShieldCheck color={ORANGE} size={14} />
                  <Text style={styles.badgeText}>Hygiene {infoHygieneScore}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        {kitchenClosed && token ? (
          <Pressable
            style={[styles.notifyBtn, notifyOutline ? styles.notifyBtnOutline : null]}
            onPress={onToggleNotifyOpen}
            disabled={notifyPending}
          >
            {watchingOpen ? (
              <BellOff color={notifyOutline ? ORANGE : '#FFFFFF'} size={16} />
            ) : (
              <Bell color={notifyOutline ? ORANGE : '#FFFFFF'} size={16} />
            )}
            <Text
              style={[
                styles.notifyBtnText,
                notifyOutline ? styles.notifyBtnTextOutline : null,
              ]}
            >
              {watchingOpen
                ? 'Stop kitchen-open alert'
                : 'Notify when kitchen opens'}
            </Text>
          </Pressable>
        ) : null}
        {stats.length > 0 ? (
          <>
            <View style={styles.divider} />
            <View style={styles.statsGrid}>
              {stats.map((s) => (
                <StatTile key={s.key} label={s.label} value={s.value} />
              ))}
            </View>
          </>
        ) : null}
      </View>

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

      {scheduleRows.length > 0 ? (
        <View style={styles.card}>
          <SectionTitle title="Weekly hours (IST)" />
          <ScheduleList rows={scheduleRows} />
        </View>
      ) : null}

      {holidays.length > 0 ? (
        <View style={styles.card}>
          <SectionTitle title="Upcoming closed dates" />
          <ScheduleList
            rows={holidays.slice(0, 5).map((h) => ({
              key: h.date,
              day: h.date,
              value: h.reason || 'Closed',
            }))}
          />
        </View>
      ) : null}

      {specialHours.length > 0 ? (
        <View style={styles.card}>
          <SectionTitle title="Special hours" />
          <ScheduleList
            rows={specialHours.slice(0, 5).map((sh) => ({
              key: sh.date,
              day: sh.date,
              value: `${sh.openTime}–${sh.closeTime}${sh.reason ? ` · ${sh.reason}` : ''}`,
              active: true,
            }))}
          />
        </View>
      ) : null}
    </View>
  );
}
