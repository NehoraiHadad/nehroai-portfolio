import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { listQuotes } from '@/lib/admin/db/queries';
import { adminLang } from '../../_components/lang';
import { PageHeader } from '../../_components/PageHeader';
import { DashboardContent } from '../../_components/DashboardContent';

export default async function DashboardPage() {
  const user = await requireAdmin();
  const [dict, quotes] = await Promise.all([
    getDictionary(await adminLang()),
    listQuotes(user.email),
  ]);
  return (
    <>
      <PageHeader title={dict.admin.dashboard.title} subtitle={dict.admin.dashboard.subtitle} />
      <DashboardContent quotes={quotes} />
    </>
  );
}
