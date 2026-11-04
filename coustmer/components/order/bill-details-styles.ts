import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

export const TEXT = '#0B1220';
export const TEXT_SEC = '#64748B';
export const TEXT_MUTED = '#94A3B8';
const BORDER = '#E5E7EB';
export const GREEN = '#16A34A';
export const ORANGE = '#F97316';
const ORANGE_DARK = '#EA580C';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  itemsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  itemsPillText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: ORANGE_DARK,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
  },
  billValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: TEXT,
  },
  deliveryFeeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikeMuted: {
    textDecorationLine: 'line-through',
    color: TEXT_MUTED,
    fontFamily: fonts.ui,
  },
  waiverHint: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: GREEN,
  },
  pendingFee: {
    color: TEXT_MUTED,
    fontFamily: fonts.ui,
    fontSize: 12,
  },
  taxesBlock: {
    gap: 6,
  },
  taxesLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taxesDetail: {
    marginLeft: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#FED7AA',
    gap: 8,
    paddingVertical: 4,
  },
  taxDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  taxDetailText: {
    flex: 1,
    gap: 2,
  },
  taxDetailLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: TEXT,
  },
  taxDetailHint: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: TEXT_MUTED,
    lineHeight: 14,
  },
  taxDetailValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: TEXT_SEC,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  savingsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  savingsTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: '#166534',
  },
  savingsValue: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#166534',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: TEXT,
  },
  totalValue: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: TEXT,
  },
  footerHint: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 11,
    color: TEXT_MUTED,
  },
  walletPaidHint: {
    marginTop: -2,
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: GREEN,
    textAlign: 'right',
  },
});
