import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';

const { ink, muted, orange } = searchColors;

export const suggestRipple = { color: '#F4F4F5' };

export const suggestStyles = StyleSheet.create({
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: { fontFamily: fonts.uiBold, fontSize: 11.5, letterSpacing: 1, color: '#71717A' },
  sectionCount: { fontFamily: fonts.uiMedium, fontSize: 11.5, color: '#A1A1AA' },
  sectionRule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E4E4E7' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 9 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbRound: { width: 44, height: 44, borderRadius: 22, backgroundColor: searchColors.peach },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.ui, fontSize: 15, color: '#52525B' },
  hit: { fontFamily: fonts.uiBold, color: ink },
  meta: { fontFamily: fonts.ui, fontSize: 12.5, color: muted },
  metaStrong: { fontFamily: fonts.uiMedium, color: '#3F3F46' },
  closed: { fontFamily: fonts.uiMedium, fontSize: 12.5, color: '#DC2626' },
  trailing: { alignItems: 'flex-end', gap: 4 },
  price: { fontFamily: fonts.uiSemi, fontSize: 14, color: ink },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#16A34A',
  },
  ratingText: { fontFamily: fonts.uiBold, fontSize: 11, color: '#FFFFFF' },

  veg: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVeg: { borderColor: '#DC2626' },
  vegDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  nonVegDot: { backgroundColor: '#DC2626' },

  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E4E7',
  },
  seeAllIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: searchColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllText: { flex: 1, fontFamily: fonts.ui, fontSize: 14.5, color: muted },
  seeAllQuery: { fontFamily: fonts.uiSemi, color: orange },
  corrected: { fontFamily: fonts.ui, fontSize: 13, color: muted, paddingHorizontal: 16, paddingTop: 12 },
  correctedQuery: { fontFamily: fonts.uiSemi, color: ink },
});
