import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike, CheckCircle2, Star } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Pressable } from '@/components/common/Pressable';
import { TrackingPartnerQuickActions } from '@/components/order/tracking/TrackingPartnerQuickActions';
import { GREEN, INK, LINE, MUTED, ORANGE, RED, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import { deliveryApi } from '@/lib/delivery/api';
import { useCreateShareLink, useNudgePartner, useRevokeShareLink } from '@/lib/delivery/hooks';
import type { DeliveryPartner } from '@/lib/delivery/types';
import type { TrackingPhase } from '@/lib/order/tracking-phase';

type Props = {
  orderId: string;
  phase: TrackingPhase;
  partner: DeliveryPartner | null;
  onHelp: () => void;
};

function waitingCopy(phase: TrackingPhase): { title: string; sub: string } {
  if (phase.key === 'ready' || phase.key === 'preparing') {
    return { title: 'Finding a delivery partner', sub: 'We will show live location once a partner accepts' };
  }
  return { title: 'Partner will be assigned soon', sub: 'We assign a partner while your food is being prepared' };
}

export function TrackingPartnerCard({ orderId, phase, partner, onHelp }: Props) {
  const pulse = useSharedValue(0);
  const createShare = useCreateShareLink(orderId);
  const revokeShare = useRevokeShareLink(orderId);
  const nudgePartner = useNudgePartner(orderId);

  useEffect(() => {
    if (!phase.active || partner) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [phase.active, partner, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
    opacity: interpolate(pulse.value, [0, 1], [1, 0.72]),
  }));

  if (!phase.active) {
    const bad = phase.cancelled;
    return (
      <View style={[styles.doneBanner, bad && styles.doneBannerCancel]}>
        <CheckCircle2 color={bad ? RED : GREEN} size={22} strokeWidth={2.3} />
        <View style={{ flex: 1 }}>
          <Text style={styles.doneText}>
            {phase.rto ? 'Order returned to restaurant' : bad ? 'This order was cancelled' : 'Order completed'}
          </Text>
          <Text style={styles.doneSub}>
            {phase.rto
              ? 'Contact support if you need help with a refund'
              : bad
                ? 'You can place this order again anytime'
                : 'Hope you enjoyed your meal'}
          </Text>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const link = await createShare.mutateAsync();
      if (!link.shareToken || !link.url) {
        Alert.alert('Share unavailable', 'Tracking link is not ready yet.');
        return;
      }
      await deliveryApi.getPublicShare(link.shareToken);
      await Share.share({ message: `Track my order live: ${link.url}`, url: link.url });
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const handleNudge = async () => {
    try {
      await nudgePartner.mutateAsync();
      Alert.alert('Sent', 'We nudged your delivery partner.');
    } catch (e) {
      Alert.alert('Could not nudge', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeShare.mutateAsync();
      Alert.alert('Revoked', 'Public tracking link has been disabled.');
    } catch (e) {
      Alert.alert('Could not revoke', e instanceof Error ? e.message : 'Please try again');
    }
  };

  const waiting = waitingCopy(phase);
  const rating = partner && partner.rating > 0 ? partner.rating.toFixed(1) : null;
  const vehicle = partner ? [partner.vehicleType, partner.vehicleNumber].filter(Boolean).join(' · ') : '';

  return (
    <View style={styles.partnerCard}>
      <LinearGradient colors={['#FFF8F2', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.partnerGrad}>
        <View style={styles.partnerTop}>
          <Animated.View style={[styles.partnerAvatar, !partner && pulseStyle]}>
            {partner?.imageUrl ? (
              <Image source={{ uri: partner.imageUrl }} style={styles.partnerAvatarImage} contentFit="cover" />
            ) : (
              <Bike color={ORANGE} size={22} strokeWidth={2.3} />
            )}
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={styles.partnerEyebrow}>DELIVERY PARTNER</Text>
            <Text style={styles.partnerName} numberOfLines={1}>{partner ? partner.name : waiting.title}</Text>
            {partner && (rating || vehicle) ? (
              <View style={styles.partnerMetaRow}>
                {rating ? (
                  <View style={styles.partnerRatingPill}>
                    <Star color="#F59E0B" fill="#F59E0B" size={11} />
                    <Text style={styles.partnerRatingText}>{rating}</Text>
                  </View>
                ) : null}
                {vehicle ? <Text style={styles.partnerVehicle} numberOfLines={1}>{vehicle}</Text> : null}
              </View>
            ) : !partner ? (
              <Text style={styles.partnerSub}>{waiting.sub}</Text>
            ) : null}
          </View>
        </View>

        {partner ? (
          <>
            <TrackingPartnerQuickActions
              orderId={orderId}
              partnerName={partner.name || 'Delivery partner'}
              onHelp={onHelp}
            />
            <View style={styles.partnerActions}>
              <Pressable style={styles.softBtn} onPress={handleNudge}>
                <Text style={styles.softBtnText}>{nudgePartner.isPending ? 'Sending…' : 'Where are you?'}</Text>
              </Pressable>
              <Pressable style={styles.softBtn} onPress={handleShare}>
                <Text style={styles.softBtnText}>{createShare.isPending ? 'Creating…' : 'Share track'}</Text>
              </Pressable>
              <Pressable style={[styles.softBtn, styles.softBtnDanger]} onPress={handleRevoke}>
                <Text style={styles.softBtnDangerText}>{revokeShare.isPending ? 'Revoking…' : 'Revoke'}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  partnerCard: { marginTop: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#FFE4CC' },
  partnerGrad: { padding: 16 },
  partnerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE4CC',
    overflow: 'hidden',
  },
  partnerAvatarImage: { width: '100%', height: '100%' },
  partnerEyebrow: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 1.1, color: ORANGE, marginBottom: 2 },
  partnerName: { fontFamily: fonts.displayBold, fontSize: 16, color: INK },
  partnerSub: { marginTop: 2, fontFamily: fonts.ui, fontSize: 12, color: MUTED },
  partnerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  partnerRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  partnerRatingText: { fontFamily: fonts.uiBold, fontSize: 11, color: '#92400E' },
  partnerVehicle: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, color: MUTED, textTransform: 'capitalize' },
  partnerActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  softBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  softBtnText: { fontFamily: fonts.uiSemi, fontSize: 12, color: '#9A3412' },
  softBtnDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  softBtnDangerText: { fontFamily: fonts.uiSemi, fontSize: 12, color: '#B91C1C' },
  doneBanner: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
  },
  doneBannerCancel: { backgroundColor: '#FEF2F2' },
  doneText: { fontFamily: fonts.uiSemi, fontSize: 14, color: INK },
  doneSub: { marginTop: 2, fontFamily: fonts.ui, fontSize: 12, color: MUTED },
});
