import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

export const notificationSettingsStyles = StyleSheet.create({
  wrap: {
    gap: 22,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: authTheme.textMuted,
    letterSpacing: 0.2,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: authTheme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.18)',
    marginBottom: 4,
  },
  statusBannerOff: {
    backgroundColor: '#F8FAFC',
    borderColor: authTheme.cardBorder,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: authTheme.success,
  },
  statusDotOff: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    flex: 1,
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: authTheme.text,
    lineHeight: 19,
  },
  statusHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: authTheme.textDim,
    marginTop: 2,
  },
  deviceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: authTheme.surface,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  deviceLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceLinkTitle: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: authTheme.text,
  },
  deviceLinkSub: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: authTheme.textDim,
    marginTop: 2,
  },
  footnote: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: authTheme.textDim,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  state: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  error: {
    fontFamily: fonts.ui,
    color: authTheme.error,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
