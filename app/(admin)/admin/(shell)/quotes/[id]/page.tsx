import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { getQuote } from '@/lib/admin/db/queries';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';
import { QuoteBuilder } from '../../../../_components/QuoteBuilder';

export default async function QuoteDetailPage({ params }: PageProps<'/admin/quotes/[id]'>) {
  const user = await requireAdmin();
  const { id } = await params;
  const [dict, initialQuote] = await Promise.all([
    getDictionary(await adminLang()),
    getQuote(user.email, id),
  ]);
  if (!initialQuote) notFound();
  return (
    <>
      <PageHeader title={dict.admin.builder.editTitle} />
      <QuoteBuilder initialQuote={initialQuote} />
    </>
  );
}
