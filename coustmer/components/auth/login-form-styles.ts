import { Platform, StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export const loginFormStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: authTheme.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: authTheme.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 8,
    minHeight: 56,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: authTheme.brand,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: authTheme.brand,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }
      : {}),
  },
  inputError: {
    borderColor: authTheme.error,
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  iconCircleFocused: {
    backgroundColor: '#FFFFFF',
  },
  rightSlot: {
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: authTheme.text,
    paddingVertical: Platform.OS === 'android' ? 10 : 12,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  fieldWrap: {
    marginBottom: 16,
    minWidth: 0,
  },
  errorText: {
    color: authTheme.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  rememberInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rememberText: {
    fontSize: 14,
    color: authTheme.text,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 13,
    color: authTheme.brand,
    fontWeight: '700',
  },
  forgotSpacer: {
    width: 8,
  },
  submitBtn: {
    backgroundColor: authTheme.brand,
    borderRadius: 30,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: authTheme.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomLinks: {
    alignItems: 'center',
  },
  signupText: {
    color: authTheme.textMuted,
    fontSize: 14,
  },
  signupLink: {
    color: authTheme.brand,
    fontWeight: '800',
  },
});
