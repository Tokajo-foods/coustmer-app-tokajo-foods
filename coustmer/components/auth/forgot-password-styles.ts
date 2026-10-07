import { Platform, StyleSheet } from 'react-native';

import { loginFormStyles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';

const extra = StyleSheet.create({
  scrollContent: {
    paddingBottom: 18,
    flexGrow: 1,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: authTheme.text,
    letterSpacing: -0.35,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: authTheme.textMuted,
    fontWeight: '500',
    marginBottom: 16,
  },
  emailHighlight: {
    color: authTheme.text,
    fontWeight: '700',
  },
  progressWrap: {
    marginBottom: 18,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.tabBg,
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
  },
  progressNodeActive: {
    backgroundColor: authTheme.brand,
    borderColor: authTheme.brand,
  },
  progressNodeDone: {
    backgroundColor: authTheme.brandSoft,
    borderColor: authTheme.brand,
  },
  progressNum: {
    fontSize: 12,
    fontWeight: '800',
    color: authTheme.textDim,
  },
  progressNumOn: {
    color: '#FFFFFF',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 6,
    borderRadius: 1,
    backgroundColor: authTheme.inputBorder,
  },
  progressLineOn: {
    backgroundColor: authTheme.brand,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    width: 72,
    fontSize: 11,
    fontWeight: '600',
    color: authTheme.textDim,
    textAlign: 'center',
  },
  progressLabelFirst: {
    textAlign: 'left',
  },
  progressLabelLast: {
    textAlign: 'right',
  },
  progressLabelOn: {
    color: authTheme.brandDark,
    fontWeight: '700',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: authTheme.brandSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: authTheme.brandMuted,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: authTheme.textMuted,
    fontWeight: '500',
    paddingTop: 1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: authTheme.brandLight,
    backgroundColor: authTheme.brandSoft,
  },
  otpBoxActive: {
    borderColor: authTheme.brand,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: authTheme.brand,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
        }
      : {}),
  },
  otpBoxError: {
    borderColor: authTheme.error,
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '800',
    color: authTheme.text,
    letterSpacing: 0.5,
  },
  otpHiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    color: 'transparent',
  },
  otpFieldWrap: {
    marginBottom: 16,
    position: 'relative',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 2,
  },
  resendMuted: {
    fontSize: 13,
    color: authTheme.textMuted,
    fontWeight: '500',
  },
  resendLink: {
    color: authTheme.brand,
    fontWeight: '800',
  },
  submitBtnTextCalm: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  successWrap: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
    width: '100%',
  },
  successRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.22)',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: authTheme.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  successBody: {
    fontSize: 14,
    lineHeight: 21,
    color: authTheme.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  successBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: authTheme.brand,
    borderRadius: 30,
    height: 54,
    paddingHorizontal: 20,
    shadowColor: authTheme.brandDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
});

export const forgotPasswordStyles = {
  ...loginFormStyles,
  ...extra,
};
