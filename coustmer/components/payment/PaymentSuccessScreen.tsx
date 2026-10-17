import { Pressable } from '@/components/common/Pressable';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, Home, Receipt, Repeat } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet,
  Text,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { authTheme } from '@/constants/auth-theme';
import { usePayment } from '@/lib/payment/hooks';
import { isPaymentSuccess } from '@/lib/payment/types';
import { formatInr } from '@/lib/format/money';

export function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    paymentId?: string;
    orderId?: string;
    amount?: string;
    orderNumber?: string;
  }>();

  const payment = usePayment(params.paymentId ?? '');

  const scale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    // Success animation
    scale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 90 })
    );
    checkOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 300 })
    );
  }, []);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheck = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkOpacity.value }],
  }));

  const paymentData = payment.data;
  const amount = paymentData?.amount ?? parseFloat(params.amount ?? '0');
  const orderNumber = params.orderNumber ?? paymentData?.orderId;
  const success = paymentData ? isPaymentSuccess(paymentData.status) : true;

  const handleViewOrder = () => {
    if (params.orderId) {
      router.replace({
        pathname: '/orders/[orderId]',
        params: { orderId: params.orderId },
      });
    } else {
      router.replace('/orders');
    }
  };

  const handleReorder = () => {
    if (params.orderId) {
      // Navigate to reorder flow
      router.replace('/home');
    } else {
      router.replace('/home');
    }
  };

  const handleGoHome = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedContainer]}>
          <View style={[styles.successIcon, !success && styles.failureIcon]}>
            <Animated.View style={animatedCheck}>
              <Check 
                color="#FFFFFF" 
                size={success ? 60 : 40} 
                strokeWidth={success ? 4 : 3} 
              />
            </Animated.View>
          </View>
        </Animated.View>

        <Text style={styles.title}>
          {success ? 'Payment Successful!' : 'Payment Failed'}
        </Text>

        <Text style={styles.subtitle}>
          {success 
            ? 'Your payment has been processed successfully'
            : 'There was an issue processing your payment'
          }
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{formatInr(amount)}</Text>
          </View>
          
          {orderNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number</Text>
              <Text style={styles.detailValue}>{orderNumber}</Text>
            </View>
          )}
          
          {paymentData?.method && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {paymentData.method.toUpperCase()}
              </Text>
            </View>
          )}
          
          {paymentData?.createdAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Time</Text>
              <Text style={styles.detailValue}>
                {new Date(paymentData.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {success && (
          <Text style={styles.successNote}>
            You will receive an order confirmation shortly
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {success ? (
          <>
            <Pressable style={styles.primaryBtn} onPress={handleViewOrder}>
              <Receipt color="#FFFFFF" size={18} />
              <Text style={styles.primaryBtnText}>View Order</Text>
            </Pressable>
            
            <View style={styles.secondaryActions}>
              <Pressable style={styles.secondaryBtn} onPress={handleReorder}>
                <Repeat color={authTheme.brand} size={16} />
                <Text style={styles.secondaryBtnText}>Reorder</Text>
              </Pressable>
              
              <Pressable style={styles.secondaryBtn} onPress={handleGoHome}>
                <Home color={authTheme.brand} size={16} />
                <Text style={styles.secondaryBtnText}>Home</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </Pressable>
            
            <Pressable style={styles.secondaryBtn} onPress={handleGoHome}>
              <Home color={authTheme.brand} size={16} />
              <Text style={styles.secondaryBtnText}>Go Home</Text>
            </Pressable>
          </>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  iconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  failureIcon: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: authTheme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: authTheme.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: authTheme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: authTheme.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: authTheme.text,
    fontWeight: '700',
  },
  successNote: {
    fontSize: 13,
    color: authTheme.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: authTheme.brand,
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: authTheme.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  secondaryBtnText: {
    color: authTheme.brand,
    fontSize: 14,
    fontWeight: '600',
  },
});