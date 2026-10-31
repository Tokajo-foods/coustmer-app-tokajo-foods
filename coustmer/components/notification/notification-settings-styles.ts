import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export const notificationSettingsStyles = StyleSheet.create({
  card: {
    backgroundColor: authTheme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    overflow: 'hidden',
  },
  state: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  groupHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authTheme.cardBorder,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: authTheme.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
