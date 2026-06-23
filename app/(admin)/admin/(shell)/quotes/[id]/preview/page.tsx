import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../../../_components/lang';
import { PageHeader } from '../../../../../_components/PageHeader';
import { QuotePreviewClient } from '../../../../../_components/QuotePreviewClient';

// Server page for the branded quote preview. Authenticates the user, then
// hands off to the client island which reads the quote+brand from localStorage
// (storage is client-only). `params` is a Promise in Next 16 — must be awaited.
export default async function QuotePreviewPage(props: PageProps<'/admin/quotes/[id]/preview'>) {
  const user = await requireAdmin();
  const { id } = await props.params;
  const dict = await getDictionary(await adminLang());

  return (
    <>
      <PageHeader title={dict.admin.preview.title} subtitle={id} />
      <QuotePreviewClient email={user.email} quoteId={id} />
    </>
  );
}
