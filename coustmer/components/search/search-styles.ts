import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

export const searchColors = {
  orange: '#F97316',
  ink: '#0F172A',
  muted: '#64748B',
  border: '#F1F5F9',
  bg: '#FFFFFF',
  field: '#F4F4F5',
  fieldBorder: '#ECECEF',
  fieldIcon: '#3F3F46',
  placeholder: '#8E8E93',
  peach: '#FFF7ED',
} as const;

/** Spoken label and the fallback text when the rotator is not shown. */
export const SEARCH_PLACEHOLDER = 'Search dishes, cuisines and restaurants';
export const SEARCH_PROMPT = 'Search for';
export const SEARCH_SCOPES = ['dishes', 'cuisines', 'restaurants'] as const;

const { ink, muted, border, orange, bg, field } = searchColors;

export const searchStyles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: bg },
  safe: { flex: 1 },
  body: { flex: 1 },

  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 4,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: field,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: searchColors.fieldBorder,
    paddingHorizontal: 12,
    gap: 10,
  },
  inputArea: { flex: 1, justifyContent: 'center' },
  input: { fontFamily: fonts.ui, fontSize: 15, color: ink, padding: 0 },
  placeholderLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A1A1AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: '#E4E4E7' },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: ink },
  clearBtn: { fontFamily: fonts.uiSemi, fontSize: 13, color: orange },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: border,
  },
  recentText: { flex: 1, fontFamily: fonts.ui, fontSize: 14, color: ink },
  recentRemove: { padding: 4 },

  list: { flex: 1 },
  searchAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: border,
  },
  searchAllIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchAllText: { flex: 1, fontFamily: fonts.ui, fontSize: 14, color: muted },
  searchAllQuery: { fontFamily: fonts.uiSemi, color: ink },
  resultsList: { paddingBottom: 100 },
  resultSectionHeader: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: ink,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },

  correctedText: { fontFamily: fonts.ui, fontSize: 13, color: muted, paddingHorizontal: 16, paddingTop: 12 },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: orange,
  },
  retryText: { fontFamily: fonts.uiBold, fontSize: 13.5, color: '#FFFFFF' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontFamily: fonts.displayBold, fontSize: 16, color: ink, marginTop: 12 },
  emptySubtext: { fontFamily: fonts.ui, fontSize: 13, color: muted },
  idleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80, gap: 8 },
  idleText: { fontFamily: fonts.displayBold, fontSize: 18, color: ink, marginTop: 12 },
  idleSubtext: { fontFamily: fonts.ui, fontSize: 14, color: muted },
});
