import { Text, View } from 'react-native';

import { infoStyles as styles } from './restaurant-info-panel-styles';

export type HoursRow = {
  key: string;
  day: string;
  value: string;
  closed?: boolean;
  today?: boolean;
};

const DAY_SHORT: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function formatScheduleDay(key: string): string {
  const k = key.toLowerCase();
  return DAY_SHORT[k] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function RestaurantInfoWeeklyHours({ rows }: { rows: HoursRow[] }) {
  if (!rows.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Weekly hours</Text>
      <Text style={styles.hoursCaption}>All times in IST</Text>

      <View style={styles.hoursTable}>
        <View style={styles.hoursHeaderRow}>
          <Text style={styles.hoursHeaderDay}>Day</Text>
          <Text style={styles.hoursHeaderTime}>Hours</Text>
        </View>
        {rows.map((row, i) => (
          <View
            key={row.key}
            style={[
              styles.hoursRow,
              row.today ? styles.hoursRowToday : null,
              i === rows.length - 1 ? styles.hoursRowLast : null,
            ]}
          >
            <View style={styles.hoursDayCol}>
              <Text
                style={[styles.hoursDay, row.today ? styles.hoursDayToday : null]}
              >
                {row.day}
              </Text>
              {row.today ? (
                <View style={styles.todayTag}>
                  <Text style={styles.todayTagText}>Today</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.hoursTime,
                row.closed ? styles.hoursTimeClosed : styles.hoursTimeOpen,
              ]}
              numberOfLines={2}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Reuse table styling for holidays / special hours */
export function RestaurantInfoHoursList({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; day: string; value: string }[];
}) {
  if (!rows.length) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.hoursTable}>
        {rows.map((row, i) => (
          <View
            key={row.key}
            style={[styles.hoursRow, i === rows.length - 1 ? styles.hoursRowLast : null]}
          >
            <Text style={styles.hoursDay}>{row.day}</Text>
            <Text style={[styles.hoursTime, styles.hoursTimeOpen]} numberOfLines={2}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
