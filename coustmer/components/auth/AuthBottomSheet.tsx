import { Pressable } from '@/components/common/Pressable';
import { ChevronLeft } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal,  StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ForgotPasswordFormContent } from '@/components/auth/ForgotPasswordFormContent';
import { LoginFormContent } from '@/components/auth/LoginFormContent';
import { RegisterFormContent } from '@/components/auth/RegisterFormContent';
import { VerifyOtpFormContent } from '@/components/auth/VerifyOtpFormContent';
import { authTheme } from '@/constants/auth-theme';
import { type AuthSheetView } from '@/store/auth-sheet-store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const AUTH_SHEET_HEIGHT = SCREEN_HEIGHT * 0.74;

const OPEN_SPRING = { damping: 26, stiffness: 185, mass: 0.92 };
const CLOSE_DURATION = 340;

type Props = {
  visible: boolean;
  view: AuthSheetView;
  otpIdentifier?: string;
  onClose: () => void;
  onViewChange: (view: AuthSheetView, options?: { otpIdentifier?: string }) => void;
};

export function AuthBottomSheet({ visible, view, otpIdentifier, onClose, onViewChange }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const prevViewRef = useRef<AuthSheetView | null>(null);
  const hasOpenedRef = useRef(false);

  const translateY = useSharedValue(AUTH_SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const sheetOpacity = useSharedValue(0);

  const finishClose = useCallback(() => {
    setMounted(false);
    prevViewRef.current = null;
    hasOpenedRef.current = false;
    onClose();
  }, [onClose]);

  const animateClose = useCallback(
    (afterClose?: () => void) => {
      backdropOpacity.value = withTiming(0, {
        duration: CLOSE_DURATION - 40,
        easing: Easing.out(Easing.cubic),
      });
      sheetOpacity.value = withTiming(0, {
        duration: CLOSE_DURATION - 80,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withTiming(
        AUTH_SHEET_HEIGHT,
        { duration: CLOSE_DURATION, easing: Easing.bezier(0.4, 0, 0.2, 1) },
        (finished) => {
          if (finished) {
            runOnJS(finishClose)();
            if (afterClose) runOnJS(afterClose)();
          }
        },
      );
    },
    [backdropOpacity, finishClose, sheetOpacity, translateY],
  );

  const animateOpen = useCallback(() => {
    translateY.value = AUTH_SHEET_HEIGHT;
    backdropOpacity.value = 0;
    sheetOpacity.value = 0;
    backdropOpacity.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    sheetOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withSpring(0, OPEN_SPRING);
  }, [backdropOpacity, sheetOpacity, translateY]);

  useEffect(() => {
    if (!visible) return;
    setMounted(true);
    prevViewRef.current = view;
    hasOpenedRef.current = true;
    animateOpen();
    // Only re-open when `visible` flips on — not on every view change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, animateOpen]);

  // Slide up again when switching login ↔ signup (and other auth views)
  useEffect(() => {
    if (!visible || !mounted || !hasOpenedRef.current) return;
    if (prevViewRef.current === null) {
      prevViewRef.current = view;
      return;
    }
    if (prevViewRef.current === view) return;
    prevViewRef.current = view;

    translateY.value = AUTH_SHEET_HEIGHT * 0.42;
    sheetOpacity.value = 0.5;
    sheetOpacity.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withSpring(0, OPEN_SPRING);
  }, [view, visible, mounted, sheetOpacity, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: sheetOpacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const changeViewWithSlide = (next: AuthSheetView, options?: { otpIdentifier?: string }) => {
    onViewChange(next, options);
  };

  const handleBack = () => {
    if (view === 'login') {
      animateClose();
      return;
    }
    changeViewWithSlide('login');
  };

  const headerRight = () => {
    if (view === 'login') {
      return (
        <Pressable onPress={() => changeViewWithSlide('forgot-password')} hitSlop={10}>
          <Text style={styles.headerAction}>Forgot password?</Text>
        </Pressable>
      );
    }
    if (view === 'register' || view === 'forgot-password') {
      return (
        <Pressable onPress={() => changeViewWithSlide('login')} hitSlop={10}>
          <Text style={styles.headerAction}>Sign in</Text>
        </Pressable>
      );
    }
    return <View style={styles.headerSpacer} />;
  };

  const renderContent = () => {
    switch (view) {
      case 'register':
        return (
          <RegisterFormContent
            onSignIn={() => changeViewWithSlide('login')}
            onRegisterSuccess={onClose}
          />
        );
      case 'forgot-password':
        return <ForgotPasswordFormContent onBackToLogin={() => changeViewWithSlide('login')} />;
      case 'verify-otp':
        return (
          <VerifyOtpFormContent
            identifier={otpIdentifier}
            onBackToLogin={() => changeViewWithSlide('login')}
            onVerifySuccess={onClose}
          />
        );
      default:
        return (
          <LoginFormContent
            onForgotPassword={() => changeViewWithSlide('forgot-password')}
            onSignUp={() => changeViewWithSlide('register')}
            onOtpSent={(identifier) =>
              changeViewWithSlide('verify-otp', { otpIdentifier: identifier })
            }
            onLoginSuccess={onClose}
          />
        );
    }
  };

  if (!mounted && !visible) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBack}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => animateClose()}
            accessibilityRole="button"
          />
        </Animated.View>

        <View style={[styles.topChrome, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
            <ChevronLeft color="#FFF" size={28} strokeWidth={2} />
          </Pressable>
          {headerRight()}
        </View>

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { height: AUTH_SHEET_HEIGHT, paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.formWrap}>{renderContent()}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerAction: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  sheet: {
    backgroundColor: authTheme.bg,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: authTheme.brandMuted,
    shadowColor: authTheme.brandDark,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: authTheme.brandMuted,
    marginBottom: 16,
  },
  formWrap: {
    flex: 1,
    paddingTop: 4,
  },
});
