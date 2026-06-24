import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';
import { ClientForm } from '../../../../_components/ClientForm';

export default async function NewClientPage() {
  await requireAdmin();
  const dict = await getDictionary(await adminLang());
  return (
    <>
      <PageHeader title={dict.admin.clients.addClient} />
      <ClientForm mode="create" />
    </>
  );
}
