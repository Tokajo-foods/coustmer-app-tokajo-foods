import { Platform, StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export const loginFormStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 22,
    flexGrow: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: authTheme.text,
    marginBottom: 7,
    marginLeft: 2,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: authTheme.brandSoft,
    borderWidth: 1,
    borderColor: authTheme.brandMuted,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    minHeight: 76,
  },
  hintIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: authTheme.brandDark,
    marginBottom: 3,
  },
  hintBody: {
    fontSize: 13,
    lineHeight: 18,
    color: authTheme.textMuted,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 8,
    minHeight: 52,
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
    width: 34,
    height: 34,
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
    paddingVertical: Platform.OS === 'android' ? 9 : 11,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  fieldWrap: {
    marginBottom: 14,
    minWidth: 0,
  },
  errorText: {
    color: authTheme.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 2,
    gap: 12,
  },
  rememberInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rememberText: {
    fontSize: 12,
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
    borderRadius: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: authTheme.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 9,
    elevation: 4,
    marginBottom: 18,
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
