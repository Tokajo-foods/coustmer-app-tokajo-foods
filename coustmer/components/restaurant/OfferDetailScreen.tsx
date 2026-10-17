import { useLocalSearchParams } from 'expo-router';
import { Tag } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import { useRestaurantOffer } from '@/lib/restaurant/hooks';
import { formatInr } from '@/lib/format/money';

export function OfferDetailScreen() {
  const { restaurantId, offerId } = useLocalSearchParams<{
    restaurantId: string;
    offerId: string;
  }>();

  const { data: offer, isLoading, isError, error, refetch } = useRestaurantOffer(
    String(restaurantId ?? ''),
    String(offerId ?? '')
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScreenHeader title="Offer details" />

        {isLoading ? (
          <LoadingView label="Loading offer…" />
        ) : isError || !offer ? (
          <ErrorView
            message={error instanceof Error ? error.message : 'Offer not found'}
            onRetry={refetch}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Tag color={authTheme.brand} size={32} />
              <Text style={styles.title}>{offer.title}</Text>
            </View>

            {offer.description ? (
              <Text style={styles.description}>{offer.description}</Text>
            ) : null}

            {offer.code ? (
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Promo code</Text>
                <Text style={styles.codeValue}>{offer.code}</Text>
              </View>
            ) : null}

            <View style={styles.metaGrid}>
              {typeof offer.discountValue === 'number' ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Discount</Text>
                  <Text style={styles.metaValue}>
                    {offer.discountType === 'percentage'
                      ? `${offer.discountValue}%`
                      : `${formatInr(offer.discountValue)}`}
                  </Text>
                </View>
              ) : null}
              {typeof offer.minOrderAmount === 'number' ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Min order</Text>
                  <Text style={styles.metaValue}>{formatInr(offer.minOrderAmount)}</Text>
                </View>
              ) : null}
              {offer.validUntil ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Valid until</Text>
                  <Text style={styles.metaValue}>
                    {new Date(offer.validUntil).toLocaleDateString()}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authTheme.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scroll: {
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: authTheme.brandSoft,
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    gap: 12,
  },
  title: {
    color: authTheme.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: authTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  codeCard: {
    backgroundColor: authTheme.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: authTheme.brand,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    color: authTheme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeValue: {
    color: authTheme.brand,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 6,
  },
  metaGrid: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: authTheme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 16,
  },
  metaLabel: {
    color: authTheme.textMuted,
    fontSize: 14,
  },
  metaValue: {
    color: authTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
