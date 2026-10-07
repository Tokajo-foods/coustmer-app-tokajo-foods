import { Platform, StyleSheet } from 'react-native';

import { loginFormStyles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';

const extra = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: authTheme.text,
    marginBottom: 10,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  hint: {
    color: authTheme.textDim,
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 2,
    lineHeight: 17,
    fontWeight: '500',
  },
  submitBtnTextCalm: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  terms: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: authTheme.textDim,
    paddingHorizontal: 8,
    marginTop: 14,
    fontWeight: '500',
  },
  termsLink: {
    color: authTheme.brand,
    fontWeight: '700',
  },
  bannerWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: authTheme.text,
    marginBottom: 7,
    marginLeft: 2,
  },
  emailHighlight: {
    color: authTheme.text,
    fontWeight: '700',
  },
  progressWrap: {
    marginBottom: 16,
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
  otpSendBtn: {
    alignSelf: 'flex-start',
    marginTop: -4,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: authTheme.brandSoft,
    borderWidth: 1,
    borderColor: authTheme.brandMuted,
  },
  otpSendBtnText: {
    color: authTheme.brandDark,
    fontSize: 13,
    fontWeight: '800',
  },
  otpInlineCard: {
    marginTop: -4,
    marginBottom: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: authTheme.bgSoft,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  otpInlineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: authTheme.textMuted,
    marginBottom: 10,
  },
  otpVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  otpVerifiedText: {
    fontSize: 13,
    fontWeight: '700',
    color: authTheme.success,
  },
});

export const registerFormStyles = {
  ...loginFormStyles,
  ...extra,
};
