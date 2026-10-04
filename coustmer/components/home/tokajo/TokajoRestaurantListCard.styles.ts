import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';
const GREEN = '#12833B';

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0EBE6',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.96,
  },
  imageWrap: {
    height: 172,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageEmpty: {
    backgroundColor: '#EFEFEF',
  },
  imageShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  imageShadeLight: {
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  promoted: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(17,17,17,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  promotedText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerChip: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    maxWidth: '78%',
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  offerChipText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 13,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 16.5,
    color: '#171717',
    letterSpacing: -0.25,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  cuisines: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#8A8A8A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12.5,
    color: '#4B4B4B',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C4C4C4',
    marginRight: 2,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  vegChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF7EF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  vegSquare: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.4,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GREEN,
  },
  vegChipText: {
    fontFamily: fonts.uiBold,
    fontSize: 10.5,
    color: GREEN,
  },
  subMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#9A9A9A',
  },
});
