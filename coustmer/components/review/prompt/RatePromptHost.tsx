import { usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { usePendingRating, type PendingRating } from '@/lib/review/use-pending-rating';

import { RatePromptSheet } from './RatePromptSheet';

/** Screens where a popup would interrupt the customer mid-task. */
const QUIET_ROUTES = [/\/review$/, /^\/search/, /^\/checkout/, /^\/cart/, /\/payment/];

/** Asks the customer to rate their latest delivered order once, anywhere in the app. */
export function RatePromptHost() {
  const pathname = usePathname();
  const quiet = QUIET_ROUTES.some((re) => re.test(pathname));
  const { pending, dismiss } = usePendingRating(true);
  // Held locally so the sheet can show its thank-you state after the order stops being "pending".
  const [active, setActive] = useState<PendingRating | null>(null);
  const closed = useRef(new Set<string>());

  useEffect(() => {
    if (pending && !active && !quiet && !closed.current.has(pending.orderId)) setActive(pending);
  }, [pending, active, quiet]);

  const handleClose = useCallback(() => {
    if (active) {
      closed.current.add(active.orderId);
      void dismiss(active.orderId);
    }
    setActive(null);
  }, [active, dismiss]);

  if (!active) return null;
  return <RatePromptSheet key={active.orderId} pending={active} onClose={handleClose} />;
}
