import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBottomSheet } from '@/components/auth/AuthBottomSheet';
import { completeOnboarding } from '@/lib/onboarding';
import { useAuthSheetStore, type AuthSheetView } from '@/store/auth-sheet-store';

type Props = {
  openAuthOnMount?: AuthSheetView;
};

const HERO = require('../../assets/welcome/tokajo-get-started.jpg');

function resolveAuthParam(auth?: string | string[]): AuthSheetView | null {
  const value = Array.isArray(auth) ? auth[0] : auth;
  if (value === 'login') return 'login';
  if (value === 'sign-up' || value === 'register') return 'register';
  if (value === 'forgot-password') return 'forgot-password';
  if (value === 'verify-otp') return 'verify-otp';
  return null;
}

/**
 * First-launch welcome: full-bleed Tokajo art with a transparent hit target
 * over the painted "Get Started" pill so any tap on that button continues.
 */
export function WelcomeScreen({ openAuthOnMount }: Props) {
  const { auth, identifier, verificationId } = useLocalSearchParams<{
    auth?: string;
    identifier?: string;
    verificationId?: string;
  }>();
  const { height: screenH, width: screenW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const visible = useAuthSheetStore((s) => s.visible);
  const view = useAuthSheetStore((s) => s.view);
  const otpIdentifier = useAuthSheetStore((s) => s.otpIdentifier);
  const otpVerificationId = useAuthSheetStore((s) => s.otpVerificationId);
  const open = useAuthSheetStore((s) => s.open);
  const close = useAuthSheetStore((s) => s.close);
  const setView = useAuthSheetStore((s) => s.setView);

  useEffect(() => {
    if (openAuthOnMount) open(openAuthOnMount);
  }, [openAuthOnMount, open]);

  useEffect(() => {
    const resolved = resolveAuthParam(auth);
    if (!resolved) return;
    if (resolved === 'verify-otp' && identifier) {
      const vid = Array.isArray(verificationId) ? verificationId[0] : verificationId;
      open('verify-otp', {
        otpIdentifier: String(identifier),
        ...(vid ? { otpVerificationId: String(vid) } : {}),
      });
      return;
    }
    open(resolved);
  }, [auth, identifier, verificationId, open]);

  const handleGetStarted = () => {
    void completeOnboarding().finally(() => {
      open('login');
    });
  };

  // Align the invisible hit target with the painted Get Started pill
  // (bottom of the artwork). Slightly taller than the pill so edge taps work.
  const hitHeight = Math.max(72, Math.min(96, screenH * 0.1));
  const hitBottom = Math.max(insets.bottom + 18, screenH * 0.045);
  const hitSide = Math.max(18, screenW * 0.07);

  return (
    <View style={styles.root}>
      <Image
        source={HERO}
        style={StyleSheet.absoluteFillObject}
        contentFit="contain"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Get Started"
        onPress={handleGetStarted}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        style={[
          styles.getStartedHit,
          {
            height: hitHeight,
            bottom: hitBottom,
            left: hitSide,
            right: hitSide,
          },
        ]}
      />

      <AuthBottomSheet
        visible={visible}
        view={view}
        otpIdentifier={otpIdentifier}
        otpVerificationId={otpVerificationId}
        onClose={close}
        onViewChange={setView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F0E8',
  },
  getStartedHit: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 40,
  },
});
