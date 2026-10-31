import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

export const legalStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fonts.displayBold, fontSize: 18, color: '#0B1220', letterSpacing: -0.3 },

  indexBody: { padding: 16, gap: 16, backgroundColor: '#F5F5F5', flexGrow: 1 },
  intro: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 20, color: '#4B5563' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  docRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { fontFamily: fonts.uiBold, fontSize: 14.5, color: '#111827' },
  docSummary: { fontFamily: fonts.ui, fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 16 },
  footnote: { fontFamily: fonts.ui, fontSize: 12, color: '#9CA3AF', textAlign: 'center' },

  docBody: { paddingHorizontal: 20, paddingTop: 20 },
  docHeading: { fontFamily: fonts.displayBold, fontSize: 24, color: '#0B1220', letterSpacing: -0.4 },
  updated: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#9CA3AF', marginTop: 4, marginBottom: 8 },
  section: { marginTop: 18, gap: 8 },
  sectionHeading: { fontFamily: fonts.uiBold, fontSize: 15.5, color: '#111827' },
  paragraph: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: '#374151' },
  bulletRow: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  bulletDot: { fontFamily: fonts.uiBold, fontSize: 14, lineHeight: 22, color: authTheme.brand },
  bulletText: { flex: 1, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: '#374151' },

  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  missingText: { fontFamily: fonts.uiSemi, fontSize: 14, color: '#6B7280' },
  missingBtn: { backgroundColor: authTheme.brand, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  missingBtnText: { fontFamily: fonts.uiBold, fontSize: 14, color: '#FFFFFF' },
});
