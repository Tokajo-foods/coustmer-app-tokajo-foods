import { useRouter, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import type { useSupportTickets } from '@/lib/support/support-hooks';
import { SUPPORT_CATEGORY_LABELS } from '@/lib/support/types';

import { hubStyles as s } from './support-hub-styles';

type Props = { query: ReturnType<typeof useSupportTickets> };

export function SupportTicketsSection({ query }: Props) {
  const router = useRouter();
  const tickets = query.data?.tickets ?? [];

  return (
    <View style={s.section}>
      <View style={s.sectionHeaderRow}>
        <Text style={s.sectionTitle}>MY SUPPORT TICKETS</Text>
        <Pressable onPress={() => router.push('/support/new' as Href)}>
          <Text style={s.newTicketLink}>NEW TICKET</Text>
        </Pressable>
      </View>
      {query.isLoading ? (
        <ActivityIndicator color={authTheme.brand} style={{ marginVertical: 12 }} />
      ) : query.isError ? (
        <View style={{ gap: 8, paddingVertical: 8 }}>
          <Text style={s.emptyTickets}>{getApiErrorMessage(query.error, 'Could not load tickets.')}</Text>
          <Pressable onPress={() => void query.refetch()}>
            <Text style={s.newTicketLink}>TRY AGAIN</Text>
          </Pressable>
        </View>
      ) : tickets.length === 0 ? (
        <Text style={s.emptyTickets}>No support tickets yet.</Text>
      ) : (
        tickets.slice(0, 8).map((t) => (
          <Pressable
            key={t.id}
            style={s.ticketRow}
            onPress={() => router.push({ pathname: '/support/[ticketId]', params: { ticketId: t.id } })}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.ticketNo}>{t.ticketNo || t.id.slice(-8)}</Text>
              <Text style={s.ticketSubject} numberOfLines={1}>{t.subject}</Text>
              <Text style={s.ticketMeta}>
                {SUPPORT_CATEGORY_LABELS[t.category] ?? t.category} · {t.status.replace(/_/g, ' ')}
              </Text>
            </View>
            <ChevronRight color="#9CA3AF" size={18} />
          </Pressable>
        ))
      )}
    </View>
  );
}
