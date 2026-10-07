import { authTheme } from '@/constants/auth-theme';
import { loginFormStyles } from '@/components/auth/login-form-styles';

export const forgotPasswordStyles = {
  ...loginFormStyles,
  stepsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
    gap: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 6,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: authTheme.tabBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepDotOn: {
    backgroundColor: authTheme.brand,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: authTheme.textDim,
  },
  stepNumOn: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: authTheme.textDim,
  },
  stepLabelOn: {
    color: authTheme.brandDark,
  },
  resendText: {
    textAlign: 'center' as const,
    color: authTheme.brand,
    fontWeight: '700' as const,
    fontSize: 13,
  },
  successCard: {
    alignItems: 'center' as const,
    gap: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: authTheme.text,
    marginTop: 4,
  },
  successBody: {
    fontSize: 14,
    color: authTheme.textMuted,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
};
