import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';

export const restaurantBrowseStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  flex: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: authTheme.card,
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#AC0F45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: authTheme.text,
    paddingVertical: 0,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '700',
    color: authTheme.textMuted,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  list: {
    paddingBottom: 28 + APP_BOTTOM_NAV_INSET,
  },
  loadingBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 48 + APP_BOTTOM_NAV_INSET,
  },
  loadingLabel: {
    color: authTheme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
