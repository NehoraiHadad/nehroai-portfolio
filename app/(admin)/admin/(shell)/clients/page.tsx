import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../_components/lang';
import { PageHeader } from '../../../_components/PageHeader';

export default async function ClientsPage() {
  await requireAdmin();
  const dict = await getDictionary(await adminLang());
  const { clients } = dict.admin;
  return (
    <>
      <PageHeader title={clients.title} subtitle={clients.subtitle} />
      <div className="card flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-sm text-fg-1">{clients.empty}</p>
        <p className="max-w-md text-xs text-fg-2">{clients.futureNote}</p>
      </div>
    </>
  );
}
