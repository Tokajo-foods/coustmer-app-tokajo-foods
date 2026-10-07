import { Platform, StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export const loginFormStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: authTheme.text,
    marginBottom: 6,
    marginLeft: 2,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: authTheme.brandSoft,
    borderWidth: 1,
    borderColor: authTheme.brandMuted,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
    minHeight: 64,
  },
  hintIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: authTheme.brandDark,
    marginBottom: 2,
  },
  hintBody: {
    fontSize: 12,
    lineHeight: 16,
    color: authTheme.textMuted,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 8,
    minHeight: 48,
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
    width: 32,
    height: 32,
    borderRadius: 10,
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
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  fieldWrap: {
    marginBottom: 10,
    minWidth: 0,
  },
  errorText: {
    color: authTheme.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    lineHeight: 15,
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
    gap: 12,
  },
  rememberInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rememberText: {
    fontSize: 13,
    color: authTheme.text,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 12,
    color: authTheme.brand,
    fontWeight: '700',
  },
  forgotSpacer: {
    width: 8,
  },
  submitBtn: {
    backgroundColor: authTheme.brand,
    borderRadius: 28,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: authTheme.brandDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
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
