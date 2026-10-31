import { GRIEVANCE } from './documents/grievance';
import { PRIVACY } from './documents/privacy';
import { REFUNDS } from './documents/refunds';
import { TERMS } from './documents/terms';
import type { LegalDocument, LegalSlug } from './types';

export const LEGAL_DOCUMENTS: LegalDocument[] = [TERMS, PRIVACY, REFUNDS, GRIEVANCE];

export function findLegalDocument(slug: string | undefined): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((d) => d.slug === (slug as LegalSlug));
}

export type { LegalDocument, LegalSection, LegalSlug } from './types';
