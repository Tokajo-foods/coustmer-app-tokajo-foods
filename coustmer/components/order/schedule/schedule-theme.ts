import { swiggyOrderUi as U } from '@/constants/swiggy-order-ui';

/** Schedule UI tokens, taken from the cart / checkout theme. */
export const SCHEDULE_COLORS = {
  orange: U.orange,
  orangeDark: '#8A0C38',
  orangeSoft: 'rgba(172, 15, 69, 0.08)',
  orangeBorder: 'rgba(172, 15, 69, 0.28)',
  text: U.text,
  textSec: U.textSecondary,
  textMuted: U.textMuted,
  border: U.border,
  disabledBg: '#F6F6F8',
  error: '#E23744',
  errorSoft: '#FEF2F2',
  errorBorder: '#FECACA',
  ok: U.green,
  okSoft: U.greenSoft,
  okBorder: 'rgba(72, 196, 121, 0.35)',
  white: U.card,
} as const;
