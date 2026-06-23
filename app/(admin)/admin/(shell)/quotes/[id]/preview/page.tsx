import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { getQuote, getBrand } from '@/lib/admin/db/queries';
import { adminLang } from '../../../../../_components/lang';
import { PageHeader } from '../../../../../_components/PageHeader';
import { QuotePreviewActions } from '../../../../../_components/QuotePreviewActions';
import { QuotePreview } from '../../../../../_components/QuotePreview';

// Server page for the branded quote preview. Fetches quote + brand from the DB
// on the server — no client localStorage needed. `params` is a Promise in
// Next 16 — must be awaited.
export default async function QuotePreviewPage(props: PageProps<'/admin/quotes/[id]/preview'>) {
  const user = await requireAdmin();
  const { id } = await props.params;
  const [dict, quote] = await Promise.all([
    getDictionary(await adminLang()),
    getQuote(user.email, id),
  ]);
  if (!quote) notFound();

  const brand = await getBrand(user.email, quote.language);

  return (
    <>
      <PageHeader title={dict.admin.preview.title} subtitle={id} />
      <QuotePreviewActions quote={quote} />
      <QuotePreview quote={quote} brand={brand} />
    </>
  );
}
