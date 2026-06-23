import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { allocateQuoteNumber } from '@/lib/admin/db/queries';
import { createBlankQuote } from '@/lib/admin/new-quote';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';
import { QuoteBuilder } from '../../../../_components/QuoteBuilder';

export default async function NewQuotePage() {
  const user = await requireAdmin();
  const year = new Date().getFullYear();
  const [dict, number] = await Promise.all([
    getDictionary(await adminLang()),
    allocateQuoteNumber(user.email, year),
  ]);
  const initialQuote = createBlankQuote({ number });
  return (
    <>
      <PageHeader title={dict.admin.builder.newTitle} />
      <QuoteBuilder initialQuote={initialQuote} isNew />
    </>
  );
}
