import { LEGAL_CONTACT as C, LEGAL_UPDATED } from '../contact';
import type { LegalDocument } from '../types';

export const PRIVACY: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  summary: 'What data we collect, why, who we share it with and your rights.',
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: '1. Overview',
      paragraphs: [
        `This Privacy Policy explains how ${C.company} collects, uses, shares and protects your personal data when you use the ${C.app} app. We process personal data in line with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000 and related rules.`,
      ],
    },
    {
      heading: '2. Data we collect',
      bullets: [
        'Account details: name, mobile number, email address and profile photo (optional).',
        'Location: your delivery addresses and, with your permission, your device location to show nearby restaurants and deliver your order.',
        'Order details: items ordered, restaurants, order history, ratings, reviews and support conversations.',
        'Payment details: payment method type and transaction references. Card and UPI credentials are handled by our payment partners and are never stored on our servers.',
        'Device and usage data: device model, operating system, app version, push notification token, crash logs and how you use the app.',
        'Voice input: if you use voice search, your speech is converted to text by your phone\'s speech service; we receive only the resulting text.',
        'Call data: when you call a Delivery Partner through the app, we log call time and duration. Numbers are masked on both sides.',
      ],
    },
    {
      heading: '3. Why we use your data',
      bullets: [
        'To create and secure your account, including OTP verification.',
        'To show restaurants that deliver to you, process orders and payments, and arrange delivery.',
        'To share live order updates and let you contact your Delivery Partner.',
        'To provide customer support, process refunds and resolve complaints.',
        'To prevent fraud, abuse and misuse of offers.',
        'To improve the app, fix errors and, with your consent, send offers and recommendations.',
        'To meet legal, tax and regulatory obligations.',
      ],
    },
    {
      heading: '4. Who we share data with',
      paragraphs: ['We share only what is needed for each purpose:'],
      bullets: [
        'Restaurant Partners: your order details and name so they can prepare your order.',
        'Delivery Partners: your name, delivery address, map pin and delivery instructions. Your phone number is not shown.',
        'Payment partners and banks: to process payments and refunds.',
        'Service providers: cloud hosting, maps, messaging, notifications and analytics providers bound by confidentiality obligations.',
        'Authorities: when required by law, court order or to protect the safety of users and the public.',
      ],
    },
    {
      heading: '5. Location permission',
      paragraphs: [
        'We ask for location access only while you use the app, to detect your delivery address and show nearby restaurants. You can deny or revoke this at any time in your phone settings and enter your address manually instead.',
      ],
    },
    {
      heading: '6. Data retention',
      paragraphs: [
        'We keep your data for as long as your account is active and as needed to provide our services. When you delete your account we delete or anonymise your personal data, except records we must keep by law (for example, invoices and payment records for tax purposes) for the legally required period.',
      ],
    },
    {
      heading: '7. Security',
      paragraphs: [
        'We use encryption in transit, access controls, secure session handling and regular reviews to protect your data. No system is completely secure, so please keep your device and OTPs private.',
      ],
    },
    {
      heading: '8. Your rights',
      bullets: [
        'Access a summary of the personal data we hold about you.',
        'Correct or update inaccurate data from your Profile or by contacting us.',
        'Erase your data by deleting your account from your Profile.',
        'Withdraw consent for optional processing, such as marketing notifications.',
        'Nominate another person to exercise your rights in case of death or incapacity.',
        'Raise a grievance with us, and escalate to the Data Protection Board of India if unresolved.',
      ],
    },
    {
      heading: '9. Children',
      paragraphs: [
        'The app is not intended for children under 18 without parental supervision. We do not knowingly collect data from children without verifiable parental consent.',
      ],
    },
    {
      heading: '10. Changes to this policy',
      paragraphs: [
        'We may update this policy from time to time. We will notify you in the app about material changes. The "Last updated" date shows the latest version.',
      ],
    },
    {
      heading: '11. Contact',
      paragraphs: [
        `For privacy questions or to exercise your rights, write to ${C.privacyEmail}. For complaints, contact the ${C.grievanceOfficer} at ${C.grievanceEmail}.`,
      ],
    },
  ],
};
