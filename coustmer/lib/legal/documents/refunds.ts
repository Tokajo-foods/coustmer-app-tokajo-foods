import { LEGAL_CONTACT as C, LEGAL_UPDATED } from '../contact';
import type { LegalDocument } from '../types';

export const REFUNDS: LegalDocument = {
  slug: 'refunds',
  title: 'Refund & Cancellation Policy',
  summary: 'When you can cancel, when you get a refund and how long it takes.',
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: '1. Cancelling an order',
      bullets: [
        'You can cancel an order from the order screen until the restaurant accepts it. Any amount paid online is refunded in full.',
        'Once the restaurant accepts and starts preparing your food, the order cannot be cancelled from the app. If there is a genuine problem, contact us from Help & Support.',
        'If the restaurant cancels or cannot fulfil your order, you receive a full refund of the amount paid online.',
        'If we cancel an order because no Delivery Partner is available or the area becomes unserviceable, you receive a full refund.',
      ],
    },
    {
      heading: '2. When you are eligible for a refund',
      bullets: [
        'Items missing from your order.',
        'Wrong items delivered.',
        'Food that is spilled, damaged in transit, spoiled or unsafe to eat.',
        'Payment debited but the order was not confirmed.',
        'Duplicate payment for the same order.',
      ],
      paragraphs: [
        'Report the issue from Help & Support within 24 hours of delivery and add clear photos where possible. Each request is reviewed, and refunds may be full or partial depending on the items affected.',
      ],
    },
    {
      heading: '3. When a refund may not be given',
      bullets: [
        'You were unreachable at delivery or refused the order without a valid reason, and the order was returned to the restaurant.',
        'The delivery address or map pin you provided was incorrect or incomplete.',
        'Complaints about taste or spice level, where the food matches the menu description.',
        'Requests raised more than 24 hours after delivery, except for payment issues.',
        'Repeated or fraudulent refund claims.',
      ],
    },
    {
      heading: '4. How refunds are paid',
      bullets: [
        'TOKAJO wallet: credited instantly once approved.',
        'UPI, cards and net banking: initiated within 24 hours of approval and usually received in 5–7 business days, depending on your bank.',
        'Cash on Delivery orders: refunded to your TOKAJO wallet, or to a bank account or UPI ID you provide.',
        'Delivery fee, platform fee and taxes are refunded along with items where the whole order is affected.',
      ],
    },
    {
      heading: '5. Coupons and offers',
      paragraphs: [
        'Refunds are calculated on the amount you actually paid after discounts. Coupons used on a cancelled order may be restored if they are still valid.',
      ],
    },
    {
      heading: '6. Tracking a refund',
      paragraphs: [
        `Go to Help & Support → View my refunds to see the status of each refund. If a refund has not reached you after 7 business days, raise a ticket in the app or write to ${C.supportEmail} with your order ID and transaction reference.`,
      ],
    },
  ],
};
