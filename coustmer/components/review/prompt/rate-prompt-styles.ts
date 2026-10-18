import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

export const ratePromptStyles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4E4E7',
    marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: '100%', height: '100%' },
  headerText: { flex: 1, gap: 2 },
  delivered: { fontFamily: fonts.uiBold, fontSize: 13, color: '#16A34A' },
  items: { fontFamily: fonts.ui, fontSize: 13, color: '#71717A' },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E4E4E7', marginVertical: 18 },
  later: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 24 },
  laterText: { fontFamily: fonts.uiMedium, fontSize: 14, color: '#71717A' },
  thanks: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  thanksTitle: { fontFamily: fonts.displayBold, fontSize: 20, color: '#18181B' },
  thanksBody: { fontFamily: fonts.ui, fontSize: 14, color: '#71717A', textAlign: 'center', paddingHorizontal: 12 },
});
