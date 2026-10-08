import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

export const locationPromptStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 8, 0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
    color: authTheme.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 20,
    color: authTheme.textDim,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
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
