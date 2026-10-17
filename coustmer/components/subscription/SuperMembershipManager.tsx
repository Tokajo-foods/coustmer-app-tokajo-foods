import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Crown } from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyView, ErrorView } from '@/components/common/StateViews';
import { RazorpayCheckoutModal } from '@/components/payment/RazorpayCheckoutModal';
import { SubscriptionPlanCard } from '@/components/subscription/SubscriptionPlanCard';
import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';
import {
  useCancelSubscription,
  useMySubscription,
  useSubscriptionPlans,
} from '@/lib/customer/hooks';
import { formatPlanDate } from '@/lib/customer/subscription-display';
import type { SubscriptionPlan } from '@/lib/customer/types';
import { useSuperCheckout } from '@/lib/payment/use-super-checkout';
import { useAuthStore } from '@/store/auth-store';

export function SuperMembershipManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => Boolean(s.token && s.user));

  const plans = useSubscriptionPlans();
  const mine = useMySubscription();
  const cancel = useCancelSubscription();
  const checkout = useSuperCheckout({
    name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined,
    email: user?.email,
    phone: user?.phone,
  });

  const myPlan = mine.data ?? null;
  const activePlanName = plans.data?.find((p) => p.id === myPlan?.planId)?.name ?? 'Super';

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      Alert.alert('Sign in required', 'Please sign in to buy a Super membership.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/login') },
      ]);
      return;
    }
    void checkout.begin(plan);
  };

  const handleCancel = () => {
    Alert.alert(
      'Turn off renewal?',
      `Your benefits stay active until ${formatPlanDate(myPlan?.expiresAt)}.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Turn off',
          style: 'destructive',
          onPress: () =>
            cancel.mutate(undefined, {
              onError: (e) =>
                Alert.alert('Could not update', e instanceof Error ? e.message : 'Please try again.'),
            }),
        },
      ]
    );
  };

  const refetch = () => {
    void plans.refetch();
    if (isLoggedIn) void mine.refetch();
  };

  const loading = plans.isLoading || (isLoggedIn && mine.isLoading);
  const loadError = plans.error ?? (isLoggedIn ? mine.error : null);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
        <Crown size={28} color="#FDE68A" strokeWidth={1.5} />
        <Text style={styles.headerTitle}>Super Membership</Text>
        <Text style={styles.headerSub}>
          {myPlan
            ? `${activePlanName} · ${myPlan.autoRenew ? 'renews' : 'ends'} ${formatPlanDate(myPlan.expiresAt)}`
            : 'Free delivery and extra savings on every order'}
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={authTheme.brand} />
        </View>
      ) : loadError ? (
        <ErrorView
          message={loadError instanceof Error ? loadError.message : 'Could not load plans'}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={plans.data ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={plans.isRefetching || mine.isRefetching}
              onRefresh={refetch}
              tintColor={authTheme.brand}
            />
          }
          renderItem={({ item }) => (
            <SubscriptionPlanCard
              plan={item}
              isActive={myPlan?.planId === item.id}
              locked={Boolean(myPlan) && myPlan?.planId !== item.id}
              busy={checkout.busyPlanId === item.id}
              disabled={Boolean(checkout.busyPlanId)}
              onSubscribe={handleSubscribe}
            />
          )}
          ListEmptyComponent={
            <EmptyView
              title="No plans right now"
              subtitle="Super membership plans will appear here soon."
            />
          }
          ListFooterComponent={
            myPlan?.autoRenew ? (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                disabled={cancel.isPending}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>
                  {cancel.isPending ? 'Updating…' : 'Turn off renewal'}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <RazorpayCheckoutModal
        visible={Boolean(checkout.session)}
        session={checkout.session}
        onClose={checkout.close}
        onResult={checkout.onResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, alignItems: 'center', gap: 6 },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: '#FFFFFF', letterSpacing: -0.4 },
  headerSub: { fontFamily: fonts.ui, fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  list: { padding: 16, paddingBottom: 40 },
  cancelBtn: {
    marginTop: 8,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontFamily: fonts.uiBold, fontSize: 13, color: '#DC2626' },
});
