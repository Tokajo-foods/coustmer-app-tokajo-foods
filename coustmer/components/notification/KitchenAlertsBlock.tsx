import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { hubStyles as hub } from '@/components/notification/notifications-hub-styles';
import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';
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
    <View>
      <Text style={hub.sectionLabel}>Stock & kitchen alerts</Text>
      <View style={styles.card}>
        {alerts.map((alert, index) => (
          <View
            key={alert.id}
            style={[styles.row, index < alerts.length - 1 && styles.rowBorder]}
          >
            <View style={styles.copy}>
              <Text style={styles.name} numberOfLines={1}>
                {alert.itemName || alert.restaurantName || 'Kitchen alert'}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {alert.itemId
                  ? `Back in stock · ${alert.restaurantName || 'Restaurant'}`
                  : 'Notify when kitchen opens'}
              </Text>
            </View>
            <Pressable
              onPress={() => unsubscribeAlert.mutate(alert)}
              disabled={unsubscribeAlert.isPending}
              hitSlop={8}
            >
              <Text style={styles.stop}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  copy: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: '#1A1A1A',
    letterSpacing: -0.15,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: authTheme.textDim,
    marginTop: 3,
  },
  stop: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#6B7280',
  },
});
