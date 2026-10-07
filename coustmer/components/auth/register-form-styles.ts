import { StyleSheet } from 'react-native';

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
});

export const registerFormStyles = {
  ...loginFormStyles,
  ...extra,
};
