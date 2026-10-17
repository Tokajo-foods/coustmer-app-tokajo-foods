import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

const INK = '#0B1220';
const MUTED = '#64748B';
const ORANGE = '#F97316';
const BORDER = '#E8ECF1';
const SURFACE = '#FFFFFF';
const SOFT = '#FFF7ED';

export const infoColors = { INK, MUTED, ORANGE, BORDER, SURFACE, SOFT };

export const infoStyles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 12,
    backgroundColor: SURFACE,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
  sectionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: INK,
    letterSpacing: -0.2,
  },
  sectionKicker: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  body: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: INK,
    lineHeight: 21,
  },
  bodyMuted: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  statusDotOpen: { backgroundColor: ORANGE },
  statusDotClosed: { backgroundColor: '#94A3B8' },
  statusTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: INK,
    lineHeight: 21,
  },
  statusSub: {
    marginTop: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  badgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: INK,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 4,
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notifyBtnOutline: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  notifyBtnText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  notifyBtnTextOutline: {
    color: ORANGE,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statTile: {
    width: '50%',
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  statLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.2,
  },
  statValue: {
    marginTop: 4,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
    lineHeight: 19,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: INK,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  payPillText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: INK,
  },
  complianceBlock: {
    gap: 10,
    paddingTop: 4,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  complianceLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: MUTED,
  },
  fssaiMono: {
    marginTop: 4,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
    letterSpacing: 0.6,
  },
  scheduleList: {
    gap: 0,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  scheduleRowLast: {
    borderBottomWidth: 0,
  },
  scheduleDay: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
    width: 100,
  },
  scheduleValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  scheduleValueActive: {
    fontFamily: fonts.uiBold,
    color: INK,
  },
});
