import { useQueryClient } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { ArrowLeft, PhoneCall, RotateCcw } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import { useOrders } from '@/lib/order/hooks';
import { usePaymentHistory } from '@/lib/payment/hooks';
import { useSupportTicketsSocket } from '@/lib/socket/hooks';
import { supportKeys, useSupportTickets } from '@/lib/support/support-hooks';

import { CallbackSheet } from '../callback/CallbackSheet';
import { RecentOrderCard } from './RecentOrderCard';
import { SupportLinks } from './SupportLinks';
import { SupportTicketsSection } from './SupportTicketsSection';
import { hubStyles as s } from './support-hub-styles';

export function SupportHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: ordersData } = useOrders({ page: 1, limit: 1 });
  const recentOrder = ordersData?.orders?.[0];
  const history = usePaymentHistory({ limit: 50 });
  const ticketsQuery = useSupportTickets();
  useSupportTicketsSocket(() => {
    void queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [requestedFor, setRequestedFor] = useState<string | null>(null);

  const activeRefunds = useMemo(
    () =>
      (history.data?.payments ?? []).filter((p) => String(p.status ?? '').toLowerCase().includes('refund'))
        .length,
    [history.data?.payments],
  );

  const openRefunds = () => {
    if (recentOrder?.id) {
      router.push({ pathname: '/orders/[orderId]/refunds', params: { orderId: recentOrder.id } });
      return;
    }
    router.push('/payments' as Href);
  };

  return (
    <View style={s.container}>
      <View style={[s.headerSafe, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8} accessibilityLabel="Go back">
            <ArrowLeft color="#1C1C1C" size={24} />
          </Pressable>
          <Text style={s.headerTitle}>Help & Support</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.refundsCard}>
          <View style={s.refundsTextWrap}>
            <Text style={s.refundsTitle}>
              You have {activeRefunds} active refund{activeRefunds === 1 ? '' : 's'}
            </Text>
            <Pressable onPress={openRefunds}>
              <Text style={s.viewRefundsText}>VIEW MY REFUNDS {'>'}</Text>
            </Pressable>
          </View>
          <View style={s.refundIconWrap}>
            <RotateCcw color={authTheme.textMuted} size={24} />
          </View>
        </View>

        <SupportTicketsSection query={ticketsQuery} />
        {recentOrder ? <RecentOrderCard order={recentOrder} /> : null}
        <SupportLinks />

        <Pressable
          style={[s.callbackCard, requestedFor !== null && s.callbackCardSent]}
          onPress={() => setSheetOpen(true)}
          disabled={requestedFor !== null}
          accessibilityRole="button"
        >
          <PhoneCall size={20} color={requestedFor !== null ? '#16A34A' : authTheme.brand} strokeWidth={1.8} />
          <View style={s.callbackText}>
            <Text style={s.callbackTitle}>{requestedFor !== null ? 'Callback requested' : 'Request a callback'}</Text>
            <Text style={s.callbackSub}>
              {requestedFor
                ? `We'll call you ${requestedFor}.`
                : 'Pick a time and our support team will call you.'}
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      <CallbackSheet
        visible={sheetOpen}
        orderId={recentOrder?.id}
        onClose={() => setSheetOpen(false)}
        onRequested={(label) => {
          setSheetOpen(false);
          setRequestedFor(label);
        }}
      />
    </View>
  );
}
