import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';
import { QuoteBuilder } from '../../../../_components/QuoteBuilder';

export default async function QuoteDetailPage({ params }: PageProps<'/admin/quotes/[id]'>) {
  const user = await requireAdmin();
  const { id } = await params;
  const dict = await getDictionary(await adminLang());
  return (
    <>
      <PageHeader title={dict.admin.builder.editTitle} />
      <QuoteBuilder email={user.email} quoteId={id} />
    </>
  );
}
