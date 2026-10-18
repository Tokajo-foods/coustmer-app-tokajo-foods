import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

const INK = '#18181B';
const MUTED = '#71717A';
const BRAND = '#F97316';

export const rateFormStyles = StyleSheet.create({
  wrap: { alignItems: 'stretch' },
  question: { fontFamily: fonts.ui, fontSize: 15, color: MUTED, textAlign: 'center' },
  restaurant: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: INK,
    textAlign: 'center',
    marginTop: 2,
  },
  stars: { alignItems: 'center', marginTop: 20 },
  ratingLabel: { fontFamily: fonts.uiMedium, fontSize: 14, color: '#A1A1AA', textAlign: 'center', marginTop: 10 },
  ratingLabelOn: { fontFamily: fonts.uiBold, color: BRAND },

  commentBlock: { marginTop: 22 },
  commentTitle: { fontFamily: fonts.uiBold, fontSize: 14, color: INK, marginBottom: 8 },
  optional: { fontFamily: fonts.ui, color: MUTED },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.ui,
    fontSize: 14,
    color: INK,
    backgroundColor: '#FAFAFA',
  },
  counter: { fontFamily: fonts.ui, fontSize: 11, color: '#A1A1AA', alignSelf: 'flex-end', marginTop: 6 },

  error: { fontFamily: fonts.uiMedium, fontSize: 13, color: '#DC2626', textAlign: 'center', marginTop: 14 },
  submit: {
    marginTop: 20,
    height: 50,
    borderRadius: 12,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitOff: { opacity: 0.45 },
  submitText: { fontFamily: fonts.uiBold, fontSize: 15, color: '#FFFFFF' },
});
