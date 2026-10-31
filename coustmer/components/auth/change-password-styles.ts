import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export const changePasswordStyles = StyleSheet.create({
  stepLabel: {
    color: authTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  loaderWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
    minHeight: 120,
  },
  loadingHint: {
    color: authTheme.textMuted,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  doneCard: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  doneTitle: {
    color: authTheme.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  doneBody: {
    color: authTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  contactBtn: {
    marginTop: 16,
    alignSelf: 'stretch',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: authTheme.brand,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactBtnText: {
    color: authTheme.brand,
    fontSize: 15,
    fontWeight: '700',
  },
});
