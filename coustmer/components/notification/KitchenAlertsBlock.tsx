import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UtensilsCrossed } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import { restaurantApi } from '@/lib/restaurant/api';
import { restaurantKeys } from '@/lib/restaurant/hooks';
import type { KitchenAlert } from '@/lib/restaurant/types';

export function KitchenAlertsBlock({ alerts }: { alerts: KitchenAlert[] }) {
  const queryClient = useQueryClient();
  const unsubscribeAlert = useMutation({
    mutationFn: async (alert: KitchenAlert) => {
      if (!alert.restaurantId) return;
      if (alert.itemId) {
        await restaurantApi.unsubscribeNotifyStock(alert.restaurantId, alert.itemId);
        return;
      }
      await restaurantApi.unsubscribeNotifyOpen(alert.restaurantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: ['customer', 'alerts'] });
    },
  });

  if (alerts.length === 0) return null;

  return (
    <View style={styles.alertsBlock}>
      <Text style={styles.alertsTitle}>Kitchen & stock alerts</Text>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alertRow}>
          <UtensilsCrossed color={authTheme.brand} size={16} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertName} numberOfLines={1}>
              {alert.itemName
                ? `${alert.itemName}`
                : alert.restaurantName || 'Kitchen open alert'}
            </Text>
            <Text style={styles.alertMeta} numberOfLines={1}>
              {alert.itemId
                ? `Back in stock · ${alert.restaurantName || 'Restaurant'}`
                : 'Notify when kitchen opens'}
              {alert.pushed === false ? ' · waiting to send' : ''}
            </Text>
          </View>
          <Pressable
            onPress={() => unsubscribeAlert.mutate(alert)}
            disabled={unsubscribeAlert.isPending}
            hitSlop={8}
          >
            <Text style={styles.alertStop}>Stop</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  alertsBlock: {
    marginBottom: 16,
    gap: 8,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  alertName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  alertMeta: {
    fontSize: 11,
    color: '#9A3412',
    marginTop: 2,
  },
  alertStop: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },
});
