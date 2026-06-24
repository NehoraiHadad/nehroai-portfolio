'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import type { ClientRecord } from '@/lib/admin/types';

export function ClientsListContent({ clients }: { clients: ClientRecord[] }) {
  const { admin } = useDictionary();
  const c = admin.clients;
  const [search, setSearch] = useState('');

  if (clients.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <Users className="h-8 w-8 text-fg-3" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-sm text-fg-1">{c.empty}</p>
        <Link href="/admin/clients/new" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {c.addClient}
        </Link>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? clients.filter(
        (cl) =>
          cl.name.toLowerCase().includes(q) ||
          cl.company.toLowerCase().includes(q) ||
          cl.email.toLowerCase().includes(q),
      )
    : clients;

  return (
    <div className="flex flex-col gap-4">
      {/* Search filter */}
      <input
        type="search"
        className="admin-input max-w-sm"
        placeholder={c.searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label={c.searchPlaceholder}
      />

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <p className="text-sm text-fg-1">{c.empty}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto scrollbar-slim">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{c.fieldName}</th>
                  <th>{c.fieldCompany}</th>
                  <th>{c.fieldEmail}</th>
                  <th>{c.fieldPhone}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cl) => (
                  <tr key={cl.id} className="transition-colors hover:bg-surface-raised">
                    <td>
                      <Link
                        href={`/admin/clients/${cl.id}`}
                        className="font-medium text-accent-text outline-none hover:underline focus-visible:[box-shadow:var(--shadow-focus-ring)]"
                      >
                        {cl.name}
                      </Link>
                    </td>
                    <td>
                      <span className="text-sm text-fg-1">{cl.company}</span>
                    </td>
                    <td>
                      <span className="text-sm text-fg-1" dir="ltr">{cl.email}</span>
                    </td>
                    <td>
                      <span className="text-sm text-fg-1" dir="ltr">{cl.phone}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
