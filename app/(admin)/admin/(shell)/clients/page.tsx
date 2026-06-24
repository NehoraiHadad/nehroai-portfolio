import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { listClients } from '@/lib/admin/db/queries';
import { adminLang } from '../../../_components/lang';
import { PageHeader } from '../../../_components/PageHeader';
import { ClientsListContent } from '../../../_components/ClientsListContent';

export default async function ClientsPage() {
  const user = await requireAdmin();
  const [dict, clients] = await Promise.all([
    getDictionary(await adminLang()),
    listClients(user.email),
  ]);
  const { clients: c } = dict.admin;
  return (
    <>
      <PageHeader
        title={c.title}
        subtitle={c.subtitle}
        action={
          <Link href="/admin/clients/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {c.newClient}
          </Link>
        }
      />
      <ClientsListContent clients={clients} />
    </>
  );
}
