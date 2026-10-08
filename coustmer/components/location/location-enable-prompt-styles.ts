import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

export const locationPromptStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 8, 0.48)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E7E5E4',
    marginBottom: 18,
  },
  stage: {
    alignSelf: 'center',
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  halo: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: authTheme.brandSoft,
  },
  ring: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1.5,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  pinBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: authTheme.brandDark,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 32,
    color: authTheme.text,
    textAlign: 'center',
    marginTop: 6,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 22,
    color: authTheme.textDim,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  points: {
    gap: 10,
    marginBottom: 20,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7F2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#44403C',
  },
  primary: {
    backgroundColor: authTheme.brand,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  later: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  laterText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#A8A29E',
  },
});
