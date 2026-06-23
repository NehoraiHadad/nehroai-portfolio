// Shared admin data contract. Published by the Foundation chip and consumed by
// the Quote Builder (chip #2) and the Quote Preview (chip #3). Keep this the
// single source of truth for the quote shape so the two parallel chips agree.

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export const QUOTE_STATUSES: readonly QuoteStatus[] = [
  'draft',
  'sent',
  'approved',
  'rejected',
  'expired',
];

// ILS only for this phase (₪). The field is kept on the document so a currency
// switcher can be added later without a data migration. See FUTURE.md.
export type Currency = 'ILS';

export type QuoteLanguage = 'he' | 'en';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Per-line discount as a percentage (0–100). Optional; 0 when unused. */
  discountPct: number;
  /** Whether VAT applies to this line. */
  vatApplies: boolean;
}

export interface Client {
  name: string;
  company: string;
  email: string;
  phone: string;
  /** Business / tax id — optional. */
  taxId: string;
  /** Optional postal address. */
  address: string;
}

export interface BrandProfile {
  /** Display wordmark for the quote header (e.g. "Nehorai Hadad" / "נהוראי חדד"). */
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  /** Optional logo URL; a placeholder mark is rendered when empty. */
  logoUrl: string;
}

export interface QuoteDoc {
  id: string;
  /** Human quote number, e.g. NH-2026-0001. Editable. */
  number: string;
  status: QuoteStatus;
  language: QuoteLanguage;
  currency: Currency;

  // Project / quote fields
  projectTitle: string;
  projectDescription: string;
  /** ISO date string (yyyy-mm-dd) the quote is valid until. */
  validUntil: string;
  /** Free-text terms / notes shown on the preview. */
  terms: string;

  client: Client;
  items: LineItem[];

  /** Default VAT rate (%) applied to VAT-eligible lines. Israel standard ~18%. */
  vatRate: number;

  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
}

export interface QuoteTotals {
  subtotal: number;
  discountTotal: number;
  taxableBase: number;
  vatTotal: number;
  total: number;
}
