'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2 } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { createClientAction, updateClientAction, deleteClientAction } from './client-actions';
import type { ClientRecord } from '@/lib/admin/types';

// Reusable create/edit form for the client directory. Mirror SettingsForm.tsx
// for input styling, pending state, and error handling conventions.

interface ClientFormProps {
  mode: 'create' | 'edit';
  client?: ClientRecord;
}

export function ClientForm({ mode, client }: ClientFormProps) {
  const { admin } = useDictionary();
  const c = admin.clients;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [fields, setFields] = useState({
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    taxId: client?.taxId ?? '',
    address: client?.address ?? '',
    notes: client?.notes ?? '',
  });

  const set =
    (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (mode === 'create') {
          const record = await createClientAction({
            name: fields.name,
            company: fields.company,
            email: fields.email,
            phone: fields.phone,
            taxId: fields.taxId,
            address: fields.address,
            notes: fields.notes,
          });
          router.push(`/admin/clients/${record.id}`);
        } else {
          if (!client) return;
          await updateClientAction(client.id, {
            name: fields.name,
            company: fields.company,
            email: fields.email,
            phone: fields.phone,
            taxId: fields.taxId,
            address: fields.address,
            notes: fields.notes,
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  const onDelete = () => {
    if (!client) return;
    if (!window.confirm(c.deleteConfirm)) return;
    startDeleteTransition(async () => {
      try {
        await deleteClientAction(client.id);
        router.push('/admin/clients');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name — required */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="cl-name">{c.fieldName}</label>
          <input
            id="cl-name"
            type="text"
            className="admin-input"
            value={fields.name}
            onChange={set('name')}
            required
          />
        </div>

        {/* Company */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="cl-company">{c.fieldCompany}</label>
          <input
            id="cl-company"
            type="text"
            className="admin-input"
            value={fields.company}
            onChange={set('company')}
          />
        </div>

        {/* Email */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="cl-email">{c.fieldEmail}</label>
          <input
            id="cl-email"
            type="email"
            className="admin-input"
            value={fields.email}
            onChange={set('email')}
            dir="ltr"
          />
        </div>

        {/* Phone */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="cl-phone">{c.fieldPhone}</label>
          <input
            id="cl-phone"
            type="tel"
            className="admin-input"
            value={fields.phone}
            onChange={set('phone')}
            dir="ltr"
          />
        </div>

        {/* Tax ID */}
        <div className="admin-field">
          <label className="admin-label" htmlFor="cl-taxId">{c.fieldTaxId}</label>
          <input
            id="cl-taxId"
            type="text"
            className="admin-input"
            value={fields.taxId}
            onChange={set('taxId')}
            dir="ltr"
          />
        </div>

        {/* Address */}
        <div className="admin-field sm:col-span-2">
          <label className="admin-label" htmlFor="cl-address">{c.fieldAddress}</label>
          <input
            id="cl-address"
            type="text"
            className="admin-input"
            value={fields.address}
            onChange={set('address')}
          />
        </div>

        {/* Notes — textarea, directory-only */}
        <div className="admin-field sm:col-span-2">
          <label className="admin-label" htmlFor="cl-notes">{c.fieldNotes}</label>
          <textarea
            id="cl-notes"
            className="admin-textarea"
            rows={3}
            value={fields.notes}
            onChange={set('notes')}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isPending || isDeleting}
          aria-disabled={isPending || isDeleting}
        >
          {c.save}
        </button>

        {saved && (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ok)]"
            role="status"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {c.updated}
          </span>
        )}

        {mode === 'edit' && client && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending || isDeleting}
            aria-disabled={isPending || isDeleting}
            className="btn btn-sm ms-auto inline-flex items-center gap-1.5 text-[var(--danger)] hover:bg-[var(--danger-dim)]"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {c.delete}
          </button>
        )}
      </div>
    </form>
  );
}
