import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { getClient, listQuotesByClient } from '@/lib/admin/db/queries';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';
import { ClientForm } from '../../../../_components/ClientForm';
import { QuoteStatusBadge } from '../../../../_components/QuoteStatusBadge';

// `params` is a Promise in Next 16 — must be awaited before reading properties.
// (routes.d.ts is auto-generated; use an inline type here until Next rebuilds it.)
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;

  const [dict, client, quotes] = await Promise.all([
    getDictionary(await adminLang()),
    getClient(user.email, id),
    listQuotesByClient(user.email, id),
  ]);

  if (!client) notFound();

  const c = dict.admin.clients;

  return (
    <>
      <PageHeader
        title={c.editClient}
        action={
          <Link href="/admin/clients" className="btn btn-secondary btn-sm inline-flex items-center gap-1.5">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {c.backToClients}
          </Link>
        }
      />

      {/* Edit form (delete control is embedded in the form) */}
      <ClientForm mode="edit" client={client} />

      {/* Quote history */}
      <section className="mt-6">
        <h2 className="!mb-3 text-[var(--t-20)]">{c.quoteHistory}</h2>
        {quotes.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-8 text-center">
            <p className="text-sm text-fg-1">{c.noQuotesForClient}</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto scrollbar-slim">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{dict.admin.quotes.colNumber}</th>
                    <th>{dict.admin.quotes.colStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id} className="transition-colors hover:bg-surface-raised">
                      <td>
                        <Link
                          href={`/admin/quotes/${q.id}`}
                          className="font-mono text-xs text-accent-text outline-none hover:underline focus-visible:[box-shadow:var(--shadow-focus-ring)]"
                        >
                          {q.number}
                        </Link>
                      </td>
                      <td>
                        <QuoteStatusBadge status={q.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
