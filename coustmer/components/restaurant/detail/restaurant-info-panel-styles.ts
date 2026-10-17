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
  outletHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  outletHeadline: {
    marginTop: 4,
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: INK,
    lineHeight: 22,
  },
  outletSubline: {
    marginTop: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillLive: {
    backgroundColor: SOFT,
    borderColor: '#FDBA74',
  },
  statusPillMuted: {
    backgroundColor: '#F8FAFC',
    borderColor: BORDER,
  },
  statusPillText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: ORANGE,
  },
  statusPillTextMuted: {
    color: MUTED,
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
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
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
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
  statsPanel: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  statRowLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
  },
  statValue: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
    textAlign: 'right',
    flexShrink: 1,
  },
  hoursCaption: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: MUTED,
    marginTop: -4,
  },
  hoursTable: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  hoursHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  hoursHeaderDay: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flex: 1,
  },
  hoursHeaderTime: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: MUTED,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'right',
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: SURFACE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  hoursRowToday: {
    backgroundColor: SOFT,
  },
  hoursRowLast: {
    borderBottomWidth: 0,
  },
  hoursDayCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  hoursDay: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: INK,
  },
  hoursDayToday: {
    fontFamily: fonts.uiBold,
    color: ORANGE,
  },
  todayTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  todayTagText: {
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: ORANGE,
    letterSpacing: 0.3,
  },
  hoursTime: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  hoursTimeOpen: {
    color: INK,
  },
  hoursTimeClosed: {
    color: MUTED,
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
});
