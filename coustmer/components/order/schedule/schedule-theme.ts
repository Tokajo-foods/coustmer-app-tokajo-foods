import { authTheme as T } from '@/constants/auth-theme';

/** Schedule UI tokens — same orange as the rest of the customer app. */
export const SCHEDULE_COLORS = {
  orange: T.brand,
  orangeDark: T.brandDark,
  orangeSoft: T.brandSoft,
  orangeBorder: T.brandMuted,
  text: T.text,
  textSec: T.textDim,
  textMuted: '#94A3B8',
  border: T.cardBorder,
  disabledBg: T.surface,
  error: '#DC2626',
  errorSoft: '#FEF2F2',
  errorBorder: '#FECACA',
  ok: '#15803D',
  okSoft: '#F0FDF4',
  okBorder: '#BBF7D0',
  white: T.card,
} as const;
