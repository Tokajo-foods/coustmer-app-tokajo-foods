import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

const PAGE = '#F6F6F6';
const INK = '#1A1A1A';

export const notificationSettingsStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: INK,
    letterSpacing: -0.3,
  },
  headerGhost: {
    width: 44,
    height: 44,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  wrap: {
    gap: 28,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
    minHeight: 52,
  },
  linkLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: INK,
    letterSpacing: -0.2,
  },
  linkHint: {
    marginTop: 3,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#6B7280',
  },
  chevron: {
    fontFamily: fonts.ui,
    fontSize: 22,
    color: '#C4C4C4',
    marginTop: -2,
  },
  state: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  error: {
    fontFamily: fonts.ui,
    color: authTheme.error,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});
