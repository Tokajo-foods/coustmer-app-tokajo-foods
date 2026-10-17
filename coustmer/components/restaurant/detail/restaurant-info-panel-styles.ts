import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

const INK = '#0B1220';
const MUTED = '#64748B';
const ORANGE = '#F97316';
const BORDER = '#E2E8F0';
const SURFACE = '#FFFFFF';
const PAGE = '#F1F5F9';

export const infoColors = { INK, MUTED, ORANGE, BORDER, SURFACE, PAGE };

export const infoStyles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 14,
    backgroundColor: PAGE,
  },
  statusCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  statusCardOpen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusCardClosed: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOpen: { backgroundColor: '#16A34A' },
  statusDotClosed: { backgroundColor: '#D97706' },
  statusTitle: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: INK,
    lineHeight: 22,
  },
  statusSub: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  badgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: INK,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  notifyBtnText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#9A3412',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: '47%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: INK,
    lineHeight: 20,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: INK,
    letterSpacing: -0.3,
  },
  cardBody: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: INK,
    lineHeight: 22,
  },
  cardMuted: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFF7ED',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  chipText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: '#9A3412',
  },
  payRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  payPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: PAGE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  payPillText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: INK,
  },
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  complianceTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: '#14532D',
  },
  complianceBody: {
    marginTop: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#166534',
    lineHeight: 19,
  },
  fssaiMono: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: INK,
    letterSpacing: 0.8,
  },
  scheduleTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 12,
    backgroundColor: SURFACE,
  },
  scheduleRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  scheduleDay: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: INK,
    width: 108,
  },
  scheduleValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  scheduleValueOpen: {
    color: INK,
  },
  sectionGap: {
    gap: 8,
  },
});
