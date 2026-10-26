import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

export const BG = '#F4F5F7';
export const WHITE = '#FFFFFF';
export const ORANGE = '#F97316';
export const ORANGE_DARK = '#EA580C';
export const TEXT = '#0B1220';
export const TEXT_SEC = '#64748B';
export const TEXT_MUTED = '#94A3B8';
export const BORDER = '#E5E7EB';
export const GREEN = '#16A34A';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.uiSemi,
    fontSize: 17,
    color: TEXT,
  },
  scroll: { paddingTop: 12 },
  section: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  restaurantIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: {
    fontFamily: fonts.uiSemi,
    fontSize: 15,
    color: TEXT,
  },
  restaurantMeta: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  itemsBlock: { gap: 8 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT,
  },
  itemQty: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: TEXT_SEC,
    minWidth: 28,
    textAlign: 'right',
  },
  itemPrice: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT,
    minWidth: 48,
    textAlign: 'right',
  },
  addressLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  addressText: {
    marginTop: 4,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
    lineHeight: 19,
  },
  scheduleValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: ORANGE_DARK,
  },
  editLink: {
    marginTop: 6,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: ORANGE,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentBody: { flex: 1, gap: 2 },
  paymentEyebrow: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: TEXT_MUTED,
    letterSpacing: 0.6,
  },
  paymentTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  paymentHint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  paymentChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  paymentChangeText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: ORANGE,
  },
  billWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  footerTotalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerTotalLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: TEXT_SEC,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footerTotalValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 22,
    color: TEXT,
  },
  footerMethod: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
});
