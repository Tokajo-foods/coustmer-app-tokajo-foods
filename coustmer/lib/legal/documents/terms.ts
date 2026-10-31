import { LEGAL_CONTACT as C, LEGAL_UPDATED } from '../contact';
import type { LegalDocument } from '../types';

export const TERMS: LegalDocument = {
  slug: 'terms',
  title: 'Terms of Use',
  summary: 'The rules for using the app, placing orders and paying.',
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: '1. About these terms',
      paragraphs: [
        `These Terms of Use ("Terms") govern your use of the ${C.app} mobile application and related services ("Platform") operated by ${C.company} ("we", "us", "our"). By creating an account, browsing or placing an order you agree to these Terms, our Privacy Policy and our Refund & Cancellation Policy. If you do not agree, please do not use the Platform.`,
        'We may update these Terms from time to time. Material changes will be notified in the app. Continuing to use the Platform after an update means you accept the revised Terms.',
      ],
    },
    {
      heading: '2. Our role',
      paragraphs: [
        `${C.company} operates a technology platform that connects you with independent restaurants ("Restaurant Partners") and independent delivery partners ("Delivery Partners"). Restaurant Partners prepare and sell the food and are responsible for its quality, quantity, hygiene, allergen information and compliance with food safety laws, including their FSSAI licence. Delivery Partners deliver your order.`,
      ],
    },
    {
      heading: '3. Eligibility and your account',
      bullets: [
        'You must be at least 18 years old, or use the Platform under the supervision of a parent or guardian.',
        'You must register with a valid mobile number verified by OTP and give accurate, current information.',
        'You are responsible for all activity on your account. Keep your device and OTPs secure and tell us immediately if you suspect unauthorised use.',
        'One person may hold only one account. We may suspend accounts created with false details or used to abuse offers.',
      ],
    },
    {
      heading: '4. Orders',
      bullets: [
        'Menus, prices, availability, preparation times and delivery estimates are provided by Restaurant Partners and may change. Estimates are indicative, not guaranteed.',
        'An order is confirmed only when the Restaurant Partner accepts it. A restaurant may decline or cancel an order, for example if an item is unavailable; any amount you paid online is then refunded.',
        'Check your cart, address and special instructions before placing an order. Orders cannot be modified after they are placed.',
        'Items restricted by law are sold only where permitted and may require age verification at delivery.',
      ],
    },
    {
      heading: '5. Prices, fees and payment',
      bullets: [
        'The final amount shown at checkout includes item prices, packaging charges set by the restaurant, delivery fee, platform fee (if any), applicable taxes and any tip you choose to add.',
        'Delivery fees may vary with distance, demand, time of day and weather. All charges are shown before you pay.',
        'Online payments are processed by authorised payment partners. We do not store your full card details.',
        'For Cash on Delivery, please pay the exact amount shown in the app to the Delivery Partner. We may disable Cash on Delivery for an account after repeated refusals or failed deliveries.',
        'Tips are optional and passed in full to your Delivery Partner.',
      ],
    },
    {
      heading: '6. Delivery',
      bullets: [
        'Provide an accurate address and map pin, and keep your phone reachable until the order is delivered.',
        'Share the delivery OTP only after you receive your order.',
        'If you are not reachable or refuse an order without a valid reason, the order may be returned to the restaurant and will not be refunded, as the food has already been prepared and dispatched.',
        'Calls between you and Delivery Partners are connected through the Platform to keep both numbers private.',
      ],
    },
    {
      heading: '7. Cancellations and refunds',
      paragraphs: [
        'You can cancel an order only until the restaurant accepts it. Refunds, compensation and credits are handled under our Refund & Cancellation Policy, available in Help & Support → Legal.',
      ],
    },
    {
      heading: '8. Offers, coupons and wallet',
      bullets: [
        'Coupons and offers are subject to their stated conditions, have no cash value and cannot be transferred or combined unless stated.',
        'Wallet balance and promotional credits can be used only on the Platform, may carry an expiry date and cannot be withdrawn as cash unless required by law.',
        'We may withdraw benefits gained through misuse, multiple accounts, fake referrals or fraudulent refund claims.',
      ],
    },
    {
      heading: '9. Acceptable use',
      paragraphs: ['You agree not to:'],
      bullets: [
        'Abuse, harass or threaten Delivery Partners, restaurant staff or our support team.',
        'Post false, offensive or defamatory reviews, or reviews for orders you did not place.',
        'Make fraudulent payments, chargebacks or refund claims.',
        'Copy, scrape, reverse engineer or interfere with the Platform or its security.',
      ],
    },
    {
      heading: '10. Reviews and content',
      paragraphs: [
        'You keep ownership of reviews, ratings and photos you post, and grant us a non-exclusive, royalty-free licence to display and use them on the Platform. We may remove content that breaks these Terms or the law.',
      ],
    },
    {
      heading: '11. Intellectual property',
      paragraphs: [
        `The Platform, its design, software, logos and the ${C.app} name belong to ${C.company} or its licensors. Restaurant names, menus and images belong to the respective Restaurant Partners. You may not use them without permission.`,
      ],
    },
    {
      heading: '12. Liability',
      paragraphs: [
        'We work hard to keep the Platform accurate and available, but it is provided on an "as is" and "as available" basis. To the extent permitted by law, our total liability for any claim relating to an order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses, or for food prepared by Restaurant Partners beyond our obligations as a platform under applicable law.',
        'Nothing in these Terms limits your rights as a consumer under the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.',
      ],
    },
    {
      heading: '13. Suspension and termination',
      paragraphs: [
        'You can delete your account at any time from your Profile. We may suspend or terminate access if you breach these Terms, misuse the Platform or where required by law. Records we must keep by law are retained for the required period.',
      ],
    },
    {
      heading: '14. Governing law and disputes',
      paragraphs: [
        `These Terms are governed by the laws of ${C.jurisdiction}. Please contact us first so we can try to resolve any concern quickly. Unresolved disputes are subject to the jurisdiction of the competent courts in ${C.jurisdiction}, without affecting your right to approach a consumer commission.`,
      ],
    },
    {
      heading: '15. Contact',
      paragraphs: [
        `For help with an order, use Help & Support in the app or write to ${C.supportEmail}. For complaints, see our Grievance Redressal policy or write to ${C.grievanceEmail}.`,
      ],
    },
  ],
};
