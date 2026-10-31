import { LEGAL_CONTACT as C, LEGAL_UPDATED } from '../contact';
import type { LegalDocument } from '../types';

export const GRIEVANCE: LegalDocument = {
  slug: 'grievance',
  title: 'Grievance Redressal',
  summary: 'How to raise a complaint and our response timelines.',
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: '1. Our commitment',
      paragraphs: [
        `${C.company} is committed to resolving your concerns fairly and quickly, in line with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.`,
      ],
    },
    {
      heading: '2. Step 1 — Help & Support',
      paragraphs: [
        'Most issues are fastest to resolve in the app. Open Help & Support, select your order and raise a ticket, chat with our team on the ticket, or request a callback at a time that suits you.',
      ],
    },
    {
      heading: '3. Step 2 — Grievance Officer',
      paragraphs: [
        'If you are not satisfied with the resolution, or your complaint concerns content, privacy or misuse of the Platform, contact our Grievance Officer:',
      ],
      bullets: [
        `Name / designation: ${C.grievanceOfficer}`,
        `Email: ${C.grievanceEmail}`,
        'Please include your registered mobile number, order ID (if any), a description of the issue and any supporting screenshots.',
      ],
    },
    {
      heading: '4. Timelines',
      bullets: [
        'Acknowledgement within 48 hours of receiving your complaint.',
        'Resolution within 30 days of receipt, and sooner wherever possible.',
        'Requests to remove unlawful content or content violating your privacy are acted on within the timelines required by law.',
      ],
    },
    {
      heading: '5. Further escalation',
      paragraphs: [
        'If your complaint is not resolved to your satisfaction, you may approach the National Consumer Helpline (1915 or consumerhelpline.gov.in) or the appropriate consumer commission. For personal data complaints, you may approach the Data Protection Board of India.',
      ],
    },
  ],
};
