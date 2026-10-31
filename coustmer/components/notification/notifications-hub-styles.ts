import { StyleSheet } from 'react-native';

import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { authTheme } from '@/constants/auth-theme';

export const hubStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24 + APP_BOTTOM_NAV_INSET,
  },
  listHeader: {
    paddingBottom: 4,
  },
  headerRightSlot: {
    minWidth: 88,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0C2',
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FFF1E6',
    padding: 4,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: authTheme.brand,
    fontWeight: '700',
  },
  shortcutCard: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  shortcutDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginLeft: 56,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutCopy: {
    flex: 1,
    minWidth: 0,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  shortcutSub: {
    marginTop: 2,
    fontSize: 12,
    color: authTheme.textMuted,
    lineHeight: 16,
  },
  hint: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
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
    paddingVertical: 36,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202020',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
