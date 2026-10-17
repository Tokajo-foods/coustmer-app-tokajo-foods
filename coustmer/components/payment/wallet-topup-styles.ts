import { StyleSheet } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authTheme.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: authTheme.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: authTheme.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  balanceCard: {
    backgroundColor: authTheme.brand,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: authTheme.text,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: authTheme.text,
    paddingVertical: 12,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: authTheme.textMuted,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    backgroundColor: authTheme.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  quickBtnActive: {
    backgroundColor: authTheme.brand,
    borderColor: authTheme.brand,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: authTheme.text,
  },
  quickBtnTextActive: {
    color: '#FFFFFF',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    marginBottom: 8,
  },
  methodOptionActive: {
    borderColor: authTheme.brand,
    backgroundColor: authTheme.brandSoft,
  },
  methodIcon: {
    fontSize: 20,
  },
  methodLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: authTheme.text,
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: authTheme.brand,
  },
  topupBtn: {
    backgroundColor: authTheme.brand,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  topupBtnDisabled: {
    opacity: 0.5,
  },
  topupBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
