export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  slug: LegalSlug;
  title: string;
  summary: string;
  /** Shown as "Last updated" and used as the document version. */
  updated: string;
  sections: LegalSection[];
};

export type LegalSlug = 'terms' | 'privacy' | 'refunds' | 'grievance';
