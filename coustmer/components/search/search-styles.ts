import { StyleSheet } from 'react-native';

import { fonts } from '@/constants/typography';

export const searchColors = {
  orange: '#F97316',
  ink: '#0F172A',
  muted: '#64748B',
  border: '#F1F5F9',
  bg: '#FFFFFF',
  field: '#FFFFFF',
  fieldBorder: '#FED7AA',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: { padding: 6 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: field,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: searchColors.fieldBorder,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#B4541A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inputArea: { flex: 1, justifyContent: 'center' },
  input: { fontFamily: fonts.ui, fontSize: 15, color: ink, padding: 0 },
  placeholderLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  clearIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairline: { height: 1, backgroundColor: border },

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

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontFamily: fonts.displayBold, fontSize: 16, color: ink, marginTop: 12 },
  emptySubtext: { fontFamily: fonts.ui, fontSize: 13, color: muted },
  idleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80, gap: 8 },
  idleText: { fontFamily: fonts.displayBold, fontSize: 18, color: ink, marginTop: 12 },
  idleSubtext: { fontFamily: fonts.ui, fontSize: 14, color: muted },
});
