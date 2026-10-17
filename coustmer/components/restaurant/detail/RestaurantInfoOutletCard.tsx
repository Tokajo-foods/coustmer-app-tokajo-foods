import { Pressable } from '@/components/common/Pressable';
import { Bell, BellOff, Leaf, ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { infoColors, infoStyles as styles } from './restaurant-info-panel-styles';

export type OutletStat = { key: string; label: string; value: string };

type Props = {
  kitchenClosed: boolean;
  openNow: boolean | undefined;
  nextOpenLabel: string | null;
  isPureVeg?: boolean;
  showHygieneScore: boolean;
  infoHygieneScore?: number;
  stats: OutletStat[];
  token: string | null;
  watchingOpen: boolean;
  notifyPending: boolean;
  onToggleNotifyOpen: () => void;
};

export function RestaurantInfoOutletCard({
  kitchenClosed,
  openNow,
  nextOpenLabel,
  isPureVeg,
  showHygieneScore,
  infoHygieneScore,
  stats,
  token,
  watchingOpen,
  notifyPending,
  onToggleNotifyOpen,
}: Props) {
  const { ORANGE } = infoColors;
  const isOpen = openNow === true && !kitchenClosed;

  const headline = kitchenClosed
    ? nextOpenLabel
      ? `Closed until ${nextOpenLabel}`
      : 'Closed right now'
    : isOpen
      ? 'Open for delivery'
      : 'Check hours below';

  const subline = kitchenClosed
    ? 'This kitchen is not taking orders'
    : isOpen
      ? 'You can place an order now'
      : 'Timing may vary by day';

  return (
    <View style={styles.card}>
      <View style={styles.outletHead}>
        <Text style={styles.sectionTitle}>Outlet</Text>
        <View
          style={[
            styles.statusPill,
            kitchenClosed ? styles.statusPillMuted : styles.statusPillLive,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              kitchenClosed ? styles.statusPillTextMuted : null,
            ]}
          >
            {kitchenClosed ? 'Closed' : isOpen ? 'Open' : 'Hours'}
          </Text>
        </View>
      </View>

      <Text style={styles.outletHeadline}>{headline}</Text>
      <Text style={styles.outletSubline}>{subline}</Text>

      {isPureVeg || showHygieneScore ? (
        <View style={styles.badgeRow}>
          {isPureVeg ? (
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
      ) : null}

      {kitchenClosed && token ? (
        <Pressable
          style={[styles.notifyBtn, watchingOpen ? styles.notifyBtnOutline : null]}
          onPress={onToggleNotifyOpen}
          disabled={notifyPending}
        >
          {watchingOpen ? (
            <BellOff color={watchingOpen ? ORANGE : '#FFFFFF'} size={16} />
          ) : (
            <Bell color="#FFFFFF" size={16} />
          )}
          <Text
            style={[
              styles.notifyBtnText,
              watchingOpen ? styles.notifyBtnTextOutline : null,
            ]}
          >
            {watchingOpen ? 'Stop open alert' : 'Notify when kitchen opens'}
          </Text>
        </Pressable>
      ) : null}

      {stats.length > 0 ? (
        <View style={styles.statsPanel}>
          {stats.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.statRow,
                i === stats.length - 1 ? styles.statRowLast : null,
              ]}
            >
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
