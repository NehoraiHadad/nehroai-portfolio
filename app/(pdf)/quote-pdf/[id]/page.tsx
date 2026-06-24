// Bearer-authed quote render page. Chromium navigates here with an
// `Authorization: Bearer <token>` header set via page.setExtraHTTPHeaders().
// No session cookie is needed — the token is validated server-side and resolves
// to the owning admin, keeping this path agent-friendly.
//
// This page MUST remain dynamic (reading headers() is enough — Next.js opts it
// out of static generation automatically). Do NOT add `export const dynamic`.
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { resolveOwnerFromToken } from '@/lib/admin/agent-auth';
import { getQuote, getBrand } from '@/lib/admin/db/queries';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { I18nProvider } from '@/lib/i18n/provider';
import { QuotePreview } from '@/app/(admin)/_components/QuotePreview';

export default async function QuotePdfPage(props: {
  params: Promise<{ id: string }>;
}) {
  // Extract bearer token from Authorization header
  const h = await headers();
  const authz = h.get('authorization') ?? '';
  const lower = authz.toLowerCase();
  if (!lower.startsWith('bearer ')) notFound();
  const token = authz.slice('bearer '.length).trim();

  const identity = await resolveOwnerFromToken(token);
  if (!identity) notFound();

  const { id } = await props.params;

  const quote = await getQuote(identity.ownerEmail, id);
  if (!quote) notFound();

  const [brand, dict] = await Promise.all([
    getBrand(identity.ownerEmail, quote.language),
    // Use the QUOTE's language for labels so the PDF is internally consistent
    getDictionary(quote.language),
  ]);

  return (
    <I18nProvider locale={quote.language} dictionary={dict}>
      <QuotePreview quote={quote} brand={brand} />
    </I18nProvider>
  );
}
