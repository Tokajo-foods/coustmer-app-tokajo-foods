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
  Sparkles,
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

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIconWrap}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
      : 'Check weekly timings below';

  const stats: { key: string; icon: ReactNode; label: string; value: string }[] =
    [];
  const cost = r.costForTwo ?? r.priceForTwo;
  if (typeof cost === 'number') {
    stats.push({
      key: 'cost',
      icon: <IndianRupee color={infoColors.ORANGE} size={18} />,
      label: 'Cost for two',
      value: `₹${cost}${r.priceRange ? ` · ${r.priceRange}` : ''}`,
    });
  }
  if (eta) {
    stats.push({
      key: 'eta',
      icon: <Clock color={infoColors.ORANGE} size={18} />,
      label: 'Delivery',
      value: eta,
    });
  }
  if (typeof distanceKm === 'number') {
    stats.push({
      key: 'dist',
      icon: <Navigation color={infoColors.ORANGE} size={18} />,
      label: 'Distance',
      value: `${distanceKm.toFixed(1)} km`,
    });
  }
  if (typeof r.minOrderValue === 'number' && r.minOrderValue > 0) {
    stats.push({
      key: 'min',
      icon: <Sparkles color={infoColors.ORANGE} size={18} />,
      label: 'Min order',
      value: `₹${r.minOrderValue}`,
    });
  }
  if (typeof r.freeDeliveryThreshold === 'number' && r.freeDeliveryThreshold > 0) {
    stats.push({
      key: 'free',
      icon: <IndianRupee color={infoColors.ORANGE} size={18} />,
      label: 'Free delivery',
      value: `Above ₹${r.freeDeliveryThreshold}`,
    });
  }

  const paymentOptions = [
    r.isOnlinePayment !== false
      ? { id: 'online', label: 'Online', icon: <CreditCard size={16} color={infoColors.INK} /> }
      : null,
    r.isCashOnDelivery !== false
      ? { id: 'cod', label: 'Cash on delivery', icon: <Banknote size={16} color={infoColors.INK} /> }
      : null,
    r.acceptScheduledOrders
      ? {
          id: 'sched',
          label: 'Schedule',
          icon: <CalendarClock size={16} color={infoColors.INK} />,
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    label: string;
    icon: ReactNode;
  }[];

  const scheduleRows: { key: string; day: string; value: string; closed?: boolean }[] =
    [];

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
        closed,
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
        closed: !open,
      });
    }
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.statusCard,
          kitchenClosed ? styles.statusCardClosed : styles.statusCardOpen,
        ]}
      >
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              kitchenClosed ? styles.statusDotClosed : styles.statusDotOpen,
            ]}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.statusTitle}>{statusTitle}</Text>
            <Text style={styles.statusSub}>{statusSub}</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          {r.isPureVeg ? (
            <View style={styles.badge}>
              <Leaf color="#16A34A" size={14} />
              <Text style={styles.badgeText}>Pure veg</Text>
            </View>
          ) : null}
          {showHygieneScore ? (
            <View style={styles.badge}>
              <ShieldCheck color="#15803D" size={14} />
              <Text style={styles.badgeText}>Hygiene {infoHygieneScore}</Text>
            </View>
          ) : null}
        </View>
        {kitchenClosed && token ? (
          <Pressable
            style={styles.notifyBtn}
            onPress={onToggleNotifyOpen}
            disabled={notifyPending}
          >
            {watchingOpen ? (
              <BellOff color="#9A3412" size={16} />
            ) : (
              <Bell color="#9A3412" size={16} />
            )}
            <Text style={styles.notifyBtnText}>
              {watchingOpen
                ? 'Stop kitchen-open alert'
                : 'Notify me when this kitchen opens'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {stats.length > 0 ? (
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <StatTile key={s.key} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About {restaurantName}</Text>
        <Text style={styles.cardBody}>{description}</Text>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MapPin color={infoColors.ORANGE} size={18} />
          <Text style={styles.cardTitle}>Location</Text>
        </View>
        <Text style={styles.cardBody}>{locationText}</Text>
      </View>

      {paymentOptions.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payments</Text>
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
          <Text style={styles.cardTitle}>Licenses & safety</Text>
          <View style={styles.complianceCard}>
            <ShieldCheck color="#15803D" size={22} />
            <View style={{ flex: 1 }}>
              {infoFssaiFull ? (
                <>
                  <Text style={styles.complianceTitle}>FSSAI license</Text>
                  <Text style={styles.fssaiMono}>{infoFssaiFull}</Text>
                </>
              ) : null}
              {showHygieneScore ? (
                <Text
                  style={[
                    styles.complianceBody,
                    infoFssaiFull ? { marginTop: 8 } : null,
                  ]}
                >
                  Hygiene score {infoHygieneScore} / 5
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {scheduleRows.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly hours (IST)</Text>
          <View style={styles.scheduleTable}>
            {scheduleRows.map((row, i) => (
              <View
                key={row.key}
                style={[styles.scheduleRow, i % 2 === 1 ? styles.scheduleRowAlt : null]}
              >
                <Text style={styles.scheduleDay}>{row.day}</Text>
                <Text
                  style={[
                    styles.scheduleValue,
                    !row.closed ? styles.scheduleValueOpen : null,
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {holidays.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming closed dates</Text>
          <View style={styles.scheduleTable}>
            {holidays.slice(0, 5).map((h, i) => (
              <View
                key={h.date}
                style={[styles.scheduleRow, i % 2 === 1 ? styles.scheduleRowAlt : null]}
              >
                <Text style={styles.scheduleDay}>{h.date}</Text>
                <Text style={styles.scheduleValue}>{h.reason || 'Closed'}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {specialHours.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special hours</Text>
          <View style={styles.scheduleTable}>
            {specialHours.slice(0, 5).map((sh, i) => (
              <View
                key={sh.date}
                style={[styles.scheduleRow, i % 2 === 1 ? styles.scheduleRowAlt : null]}
              >
                <Text style={styles.scheduleDay}>{sh.date}</Text>
                <Text style={[styles.scheduleValue, styles.scheduleValueOpen]}>
                  {sh.openTime}–{sh.closeTime}
                  {sh.reason ? ` · ${sh.reason}` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
