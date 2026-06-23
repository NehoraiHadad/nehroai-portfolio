import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { listQuotes } from '@/lib/admin/db/queries';
import { adminLang } from '../../../_components/lang';
import { PageHeader } from '../../../_components/PageHeader';
import { QuotesListContent } from '../../../_components/QuotesListContent';

export default async function QuotesPage() {
  const user = await requireAdmin();
  const [dict, quotes] = await Promise.all([
    getDictionary(await adminLang()),
    listQuotes(user.email),
  ]);
  const { quotes: q } = dict.admin;
  return (
    <>
      <PageHeader
        title={q.title}
        subtitle={q.subtitle}
        action={
          <Link href="/admin/quotes/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {q.newQuote}
          </Link>
        }
      />
      <QuotesListContent quotes={quotes} />
    </>
  );
}
