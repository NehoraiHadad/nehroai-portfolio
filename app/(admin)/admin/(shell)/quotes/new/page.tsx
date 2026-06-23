import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';

// FOUNDATION PLACEHOLDER — Chip #2 (Quote Builder UI) replaces this file with
// the real builder (QuoteBuilder client component, form + line items + totals).
export default async function NewQuotePage() {
  await requireAdmin();
  const dict = await getDictionary(await adminLang());
  return (
    <>
      <PageHeader title={dict.admin.builder.newTitle} subtitle={dict.admin.quotes.subtitle} />
      <div className="card p-10 text-center text-sm text-fg-2">{dict.admin.builder.noItems}</div>
    </>
  );
}
