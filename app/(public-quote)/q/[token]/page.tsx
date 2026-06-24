// Public client-facing approval page for a shared quote. No session is needed —
// the share token in the URL is the capability credential. The page resolves the
// quote and owner brand server-side, determines the display state from quote
// status and validUntil, then renders the branded QuotePreview with a status
// banner. Action buttons are only shown when the quote is still pending (sent
// and not yet expired) so the recipient cannot approve/reject an already-decided
// or expired quote from the UI.
//
// This page MUST remain dynamic (reading params is enough — Next.js opts it
// out of static generation automatically). Do NOT add `export const dynamic`.
import { notFound } from 'next/navigation';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { getPublicQuoteByShareToken } from '@/lib/admin/db/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { I18nProvider } from '@/lib/i18n/provider';
import { QuotePreview } from '@/app/(admin)/_components/QuotePreview';
import { PublicQuoteActions } from '../../_components/PublicQuoteActions';
import { toWhatsAppNumber } from '@/lib/admin/phone';

// Banner color recipes — all values from the existing design token palette in
// globals.css. We use CSS variable references via inline style so the dark /
// light theme switch applies here too, and we don't invent any new classes.
const BANNER_STYLES = {
  pending: {
    background: 'var(--accent-faint)',
    borderColor: 'var(--accent-dim)',
    titleColor: 'var(--accent-pale)',
    bodyColor: 'var(--fg-1)',
  },
  approved: {
    background: 'var(--ok-dim)',
    borderColor: 'var(--ok)',
    titleColor: 'var(--ok)',
    bodyColor: 'var(--fg-1)',
  },
  rejected: {
    background: 'var(--danger-dim)',
    borderColor: 'var(--danger)',
    titleColor: 'var(--danger)',
    bodyColor: 'var(--fg-1)',
  },
  expired: {
    background: 'var(--bg-2)',
    borderColor: 'var(--warn)',
    titleColor: 'var(--warn)',
    bodyColor: 'var(--fg-1)',
  },
} as const;

type DisplayState = 'pending' | 'approved' | 'rejected' | 'expired';

export default async function PublicQuotePage(props: {
  params: Promise<{ token: string }>;
}) {
  // params is a Promise in this Next.js fork — await it before use.
  const { token } = await props.params;

  const data = await getPublicQuoteByShareToken(token);
  if (!data) notFound();

  const { quote, brand } = data;

  // Draft quotes have never been shared — the link is not yet active.
  if (quote.status === 'draft') notFound();

  const dict = await getDictionary(quote.language);
  const t = dict.admin.publicQuote;

  // Determine display state. A quote is visually "expired" only when it is
  // still pending (status === 'sent') and the validity date has passed — an
  // already-approved quote stays approved regardless of the date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired =
    quote.status === 'sent' &&
    quote.validUntil !== '' &&
    new Date(quote.validUntil) < today;

  let state: DisplayState;
  if (quote.status === 'approved') {
    state = 'approved';
  } else if (quote.status === 'rejected') {
    state = 'rejected';
  } else if (isExpired) {
    state = 'expired';
  } else {
    state = 'pending';
  }

  const bannerTitle = t[`${state}Title`];
  const bannerBody = t[`${state}Body`];
  const styles = BANNER_STYLES[state];
  const dir = quote.language === 'he' ? 'rtl' : 'ltr';

  return (
    <I18nProvider locale={quote.language} dictionary={dict}>
      {/* Top-level dir wrapper so QuotePreview and banners respect RTL
          without forcing a lang="he" on the root html (which is lang="en"). */}
      <div dir={dir} className="min-h-screen py-10">
        {/* Centered content column — max-w-3xl matches QuotePreviewActions */}
        <div className="mx-auto max-w-3xl px-4">
          {/* Status banner */}
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border px-5 py-4"
            style={{
              background: styles.background,
              borderColor: styles.borderColor,
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: styles.titleColor }}
            >
              {bannerTitle}
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: styles.bodyColor }}
            >
              {bannerBody}
            </p>
          </div>

          {/* Action buttons — only when the quote is still awaiting a decision */}
          {state === 'pending' && <PublicQuoteActions token={token} />}

          {/* Soft contact line — subtle, below the dominant Approve button.
              Only rendered when pending and at least one contact point exists. */}
          {state === 'pending' && (brand.phone || brand.email) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
              style={{ color: 'var(--fg-2)' }}
            >
              <span>{t.undecidedPrompt}</span>
              {brand.phone && (
                <a
                  href={`tel:${brand.phone}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color: 'var(--fg-2)' }}
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  {brand.phone}
                </a>
              )}
              {toWhatsAppNumber(brand.phone ?? '') && (
                <a
                  href={`https://wa.me/${toWhatsAppNumber(brand.phone ?? '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color: 'var(--fg-2)' }}
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  WhatsApp
                </a>
              )}
              {brand.email && (
                <a
                  href={`mailto:${brand.email}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color: 'var(--fg-2)' }}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  {brand.email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Quote preview — the branded paper sheet, centered by its own max-width */}
        <QuotePreview quote={quote} brand={brand} />
      </div>
    </I18nProvider>
  );
}
