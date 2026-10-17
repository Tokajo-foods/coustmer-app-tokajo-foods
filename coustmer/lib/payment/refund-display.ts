import type { Refund } from '@/lib/payment/types';

export type RefundDisplay = {
  title: string;
  detail: string;
  tone: 'progress' | 'done' | 'problem';
};

const formatDay = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

/** Customer wording for where the refund money is and when it lands. */
export function refundDisplay(refund: Refund): RefundDisplay {
  const status = String(refund.status ?? '').toLowerCase();
  const extra = refund.kind === 'duplicate_capture' ? 'Extra payment returned · ' : '';

  if (status === 'success' || status === 'completed') {
    if (refund.fallbackMethod === 'wallet') {
      return {
        title: `${extra}Credited to your wallet`,
        detail: "Your bank couldn't accept the refund, so the full amount was added to your wallet instead.",
        tone: 'done',
      };
    }
    if (refund.refundMethod === 'wallet') {
      return { title: `${extra}Credited to your wallet`, detail: 'Available to use right away.', tone: 'done' };
    }
    return {
      title: `${extra}Refunded to original payment method`,
      detail: refund.bankReference
        ? `Bank reference ${refund.bankReference}. Quote it to your bank if you can't see the money.`
        : 'The money has been sent to your bank, card or UPI account.',
      tone: 'done',
    };
  }
  if (status === 'failed') {
    return {
      title: 'Refund needs attention',
      detail: 'We could not complete this refund automatically. Our support team will resolve it — contact Help if it takes long.',
      tone: 'problem',
    };
  }
  if (status === 'rejected') {
    return { title: 'Refund request declined', detail: 'See the reason below or contact Help.', tone: 'problem' };
  }

  const by = formatDay(refund.expectedBy);
  return {
    title: `${extra}Refund in progress`,
    detail: by
      ? `Expected by ${by}. Banks usually take 5–7 working days to show the money.`
      : 'Being processed. Banks usually take 5–7 working days to show the money.',
    tone: 'progress',
  };
}
