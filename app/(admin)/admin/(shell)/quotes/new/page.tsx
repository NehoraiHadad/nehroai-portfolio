import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';
import { QuoteBuilder } from '../../../../_components/QuoteBuilder';

export default async function NewQuotePage() {
  const user = await requireAdmin();
  const dict = await getDictionary(await adminLang());
  return (
    <>
      <PageHeader title={dict.admin.builder.newTitle} />
      <QuoteBuilder email={user.email} />
    </>
  );
}
