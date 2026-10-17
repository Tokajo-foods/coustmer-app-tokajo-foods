import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import {
  Award,
  ChevronLeft,
  Heart,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ErrorView,
  LoadingView,
} from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import { useCustomerProfile } from '@/lib/customer/hooks';
import { formatInr } from '@/lib/format/money';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  silver: { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' },
  gold: { bg: '#FEF9C3', text: '#854D0E', border: '#EAB308' },
  platinum: { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' },
  diamond: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
};

function getTierStyle(tier: string) {
  const key = tier.toLowerCase();
  return TIER_COLORS[key] ?? TIER_COLORS.bronze;
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  accent?: string;
};

function StatCard({ icon, label, value, subtitle, accent = authTheme.brand }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: accent + '15' }]}>
        {icon}
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
    </View>
  );
}

export function CustomerAnalytics() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: profile, isLoading, isError, error, refetch } = useCustomerProfile();

  if (isLoading) return <LoadingView label="Loading your insights…" />;
  if (isError || !profile) {
    return (
      <ErrorView
        message={error instanceof Error ? error.message : 'Failed to load insights'}
        onRetry={refetch}
      />
    );
  }

  const tier = profile.tier ?? 'bronze';
  const tierStyle = getTierStyle(tier);
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 12 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/');
          }}
        >
          <ChevronLeft color="#111827" size={22} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>My Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Tier Badge */}
        <View style={styles.tierSection}>
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: tierStyle.bg, borderColor: tierStyle.border },
            ]}
          >
            <Award color={tierStyle.border} size={28} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.tierLabel, { color: tierStyle.text }]}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Member
              </Text>
              <Text style={styles.tierPoints}>
                {profile.loyaltyPoints.toLocaleString()} loyalty points
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.grid}>
          <StatCard
            icon={<ShoppingBag color={authTheme.brand} size={20} />}
            label="Total Orders"
            value={profile.totalOrders.toLocaleString()}
            accent={authTheme.brand}
          />
          <StatCard
            icon={<Wallet color="#059669" size={20} />}
            label="Total Spent"
            value={formatInr(profile.totalSpend)}
            accent="#059669"
          />
          <StatCard
            icon={<TrendingUp color="#7C3AED" size={20} />}
            label="Avg Order"
            value={profile.averageOrderValue > 0 ? formatInr(profile.averageOrderValue) : '—'}
            accent="#7C3AED"
          />
          <StatCard
            icon={<Star color="#D97706" size={20} />}
            label="Loyalty Points"
            value={profile.loyaltyPoints.toLocaleString()}
            accent="#D97706"
          />
        </View>

        {/* Favorites section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Favorites</Text>
        <View style={styles.grid}>
          <StatCard
            icon={<Heart color="#EF4444" size={20} />}
            label="Saved Restaurants"
            value={String(profile.favoriteRestaurants?.length ?? 0)}
            accent="#EF4444"
          />
          <StatCard
            icon={<Heart color="#EC4899" size={20} />}
            label="Saved Dishes"
            value={String(profile.favoriteDishes?.length ?? 0)}
            accent="#EC4899"
          />
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tierSection: {
    marginBottom: 24,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  tierLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  tierPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%' as unknown as number,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  cardSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
});