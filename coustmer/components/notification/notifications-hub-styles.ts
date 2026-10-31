import { StyleSheet } from 'react-native';

import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

const PAGE = '#F6F6F6';

export const hubStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 14,
    gap: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  pageTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#1A1A1A',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    marginTop: 3,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24 + APP_BOTTOM_NAV_INSET,
  },
  listHeader: {
    paddingBottom: 8,
    gap: 14,
  },
  inboxLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    padding: 3,
    borderRadius: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#6B7280',
  },
  segmentTextActive: {
    fontFamily: fonts.uiBold,
    color: '#1A1A1A',
  },
  shortcutCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  shortcutDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EBEBEB',
    marginLeft: 64,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutCopy: {
    flex: 1,
    minWidth: 0,
  },
  shortcutTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: '#1A1A1A',
    letterSpacing: -0.15,
  },
  shortcutSub: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: authTheme.textDim,
    lineHeight: 16,
  },
  hint: {
    textAlign: 'center',
    fontFamily: fonts.ui,
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: APP_BOTTOM_NAV_INSET,
  },
  emptyInline: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 17,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
  },
  signedOutHeader: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  signedOutTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#1A1A1A',
    letterSpacing: -0.4,
    paddingHorizontal: 4,
  },
});
