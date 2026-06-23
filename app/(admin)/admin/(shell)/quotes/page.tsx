import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../_components/lang';
import { PageHeader } from '../../../_components/PageHeader';
import { QuotesListContent } from '../../../_components/QuotesListContent';

export default async function QuotesPage() {
  const user = await requireAdmin();
  const dict = await getDictionary(await adminLang());
  const { quotes } = dict.admin;
  return (
    <>
      <PageHeader
        title={quotes.title}
        subtitle={quotes.subtitle}
        action={
          <Link href="/admin/quotes/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {quotes.newQuote}
          </Link>
        }
      />
      <QuotesListContent email={user.email} />
    </>
  );
}
