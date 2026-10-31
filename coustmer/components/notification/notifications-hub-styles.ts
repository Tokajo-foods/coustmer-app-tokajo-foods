import { StyleSheet } from 'react-native';

import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
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
    paddingTop: 14,
    paddingBottom: 12,
  },
  sideSlot: {
    width: 88,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    paddingBottom: 16 + APP_BOTTOM_NAV_INSET,
  },
  listHeader: {
    gap: 12,
    paddingBottom: 4,
  },
  listFooter: {
    gap: 20,
    paddingTop: 8,
  },
  inboxLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    padding: 3,
    borderRadius: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#6B7280',
  },
  segmentTextActive: {
    fontFamily: fonts.uiBold,
    color: '#1A1A1A',
  },
  sectionLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  settingsSection: {
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 52,
  },
  settingsRowTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  hint: {
    textAlign: 'center',
    fontFamily: fonts.ui,
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
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
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  signedOutHeader: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  signedOutTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: '#1A1A1A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
