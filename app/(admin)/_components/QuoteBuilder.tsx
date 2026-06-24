'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BookUser, Save } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { computeTotals, formatMoney } from '@/lib/admin/totals';
import { saveQuoteAction } from './quote-actions';
import { createClientAction } from './client-actions';
import { QUOTE_STATUSES } from '@/lib/admin/types';
import type { ClientRecord, LineItem, QuoteDoc, QuoteLanguage, QuoteStatus } from '@/lib/admin/types';

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export function QuoteBuilder({
  initialQuote,
  isNew,
  savedClients = [],
}: {
  initialQuote: QuoteDoc;
  isNew?: boolean;
  /** Directory clients fetched server-side, passed from the page. */
  savedClients?: ClientRecord[];
}) {
  const { admin } = useDictionary();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSavingClient, startSavingClient] = useTransition();

  // Seed state directly from the server-fetched prop.
  const [quote, setQuote] = useState<QuoteDoc>(initialQuote);

  // Helpers to patch top-level fields
  const patch = useCallback(
    <K extends keyof QuoteDoc>(key: K, value: QuoteDoc[K]) =>
      setQuote((q) => ({ ...q, [key]: value })),
    [],
  );

  const patchClient = useCallback(
    <K extends keyof QuoteDoc['client']>(key: K, value: QuoteDoc['client'][K]) =>
      setQuote((q) => ({ ...q, client: { ...q.client, [key]: value } })),
    [],
  );

  const patchItem = useCallback(
    <K extends keyof LineItem>(index: number, key: K, value: LineItem[K]) =>
      setQuote((q) => {
        const items = q.items.map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        );
        return { ...q, items };
      }),
    [],
  );

  const addItem = useCallback(() => {
    setQuote((q) => {
      const newItem: LineItem = {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPct: 0,
        vatApplies: true,
      };
      return { ...q, items: [...q.items, newItem] };
    });
  }, []);

  const removeItem = useCallback(
    (index: number) =>
      setQuote((q) => ({ ...q, items: q.items.filter((_, i) => i !== index) })),
    [],
  );

  const handleSaveDraft = useCallback(() => {
    startTransition(async () => {
      const saved = await saveQuoteAction(quote);
      setQuote(saved);
    });
  }, [quote]);

  const handlePreview = useCallback(() => {
    startTransition(async () => {
      const saved = await saveQuoteAction(quote);
      setQuote(saved);
      router.push(`/admin/quotes/${saved.id}/preview`);
    });
  }, [quote, router]);

  // Copy a saved ClientRecord's fields into the quote's client block and link clientId.
  const handleSelectClient = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      if (!id) return;
      const record = savedClients.find((c) => c.id === id);
      if (!record) return;
      setQuote((q) => ({
        ...q,
        clientId: record.id,
        client: {
          name: record.name,
          company: record.company,
          email: record.email,
          phone: record.phone,
          taxId: record.taxId,
          address: record.address,
        },
      }));
    },
    [savedClients],
  );

  // Save the current client block as a new ClientRecord in the directory.
  const handleSaveAsClient = useCallback(() => {
    if (!quote.client.name.trim()) return;
    startSavingClient(async () => {
      const record = await createClientAction({
        name: quote.client.name,
        company: quote.client.company,
        email: quote.client.email,
        phone: quote.client.phone,
        taxId: quote.client.taxId,
        address: quote.client.address,
        notes: '',
      });
      // Link the new directory entry to this quote.
      setQuote((q) => ({ ...q, clientId: record.id }));
    });
  }, [quote.client]);

  const b = admin.builder;
  const c = admin.clients;
  const totals = computeTotals(quote.items, quote.vatRate);
  // isNew is available for future use (e.g. different header copy)
  void isNew;

  return (
    <div className="flex flex-col gap-6">

      {/* ----------------------------------------------------------------
          Client details
      ---------------------------------------------------------------- */}
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="!mb-0 text-[var(--t-20)]">{b.sectionClient}</h2>

          {/* Saved-client affordances — only shown when the directory is non-empty */}
          {savedClients.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {/* "Use a saved client" picker */}
              <div className="flex items-center gap-1.5">
                <BookUser className="h-3.5 w-3.5 text-fg-3" strokeWidth={1.5} aria-hidden="true" />
                <select
                  className="admin-select py-1 text-xs"
                  defaultValue=""
                  onChange={handleSelectClient}
                  aria-label={c.selectClient}
                >
                  <option value="" disabled>{c.selectClient}</option>
                  {savedClients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}{cl.company ? ` — ${cl.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="admin-field">
            <label className="admin-label" htmlFor="client-name">{b.clientName}</label>
            <input
              id="client-name"
              type="text"
              className="admin-input"
              value={quote.client.name}
              onChange={(e) => patchClient('name', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="client-company">{b.clientCompany}</label>
            <input
              id="client-company"
              type="text"
              className="admin-input"
              value={quote.client.company}
              onChange={(e) => patchClient('company', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="client-email">{b.clientEmail}</label>
            <input
              id="client-email"
              type="email"
              className="admin-input"
              value={quote.client.email}
              onChange={(e) => patchClient('email', e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="client-phone">{b.clientPhone}</label>
            <input
              id="client-phone"
              type="tel"
              className="admin-input"
              value={quote.client.phone}
              onChange={(e) => patchClient('phone', e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="client-taxId">
              {b.clientTaxId}
              <span className="admin-label__optional"> — {b.optional}</span>
            </label>
            <input
              id="client-taxId"
              type="text"
              className="admin-input"
              value={quote.client.taxId}
              onChange={(e) => patchClient('taxId', e.target.value)}
            />
          </div>
          <div className="admin-field sm:col-span-2">
            <label className="admin-label" htmlFor="client-address">
              {b.clientAddress}
              <span className="admin-label__optional"> — {b.optional}</span>
            </label>
            <input
              id="client-address"
              type="text"
              className="admin-input"
              value={quote.client.address}
              onChange={(e) => patchClient('address', e.target.value)}
            />
          </div>
        </div>

        {/* "Save to clients" — only shown when name is non-empty and not yet linked */}
        {quote.client.name.trim() && !quote.clientId && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAsClient}
              disabled={isSavingClient}
              aria-disabled={isSavingClient}
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              {c.saveAsClient}
            </button>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------
          Quote details
      ---------------------------------------------------------------- */}
      <section className="card p-5">
        <h2 className="!mb-4 text-[var(--t-20)]">{b.sectionQuote}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="admin-field">
            <label className="admin-label" htmlFor="quote-number">{b.quoteNumber}</label>
            <input
              id="quote-number"
              type="text"
              className="admin-input font-mono"
              value={quote.number}
              onChange={(e) => patch('number', e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="quote-validUntil">{b.validUntil}</label>
            <input
              id="quote-validUntil"
              type="date"
              className="admin-input"
              value={quote.validUntil}
              onChange={(e) => patch('validUntil', e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="admin-field sm:col-span-2">
            <label className="admin-label" htmlFor="quote-projectTitle">{b.projectTitle}</label>
            <input
              id="quote-projectTitle"
              type="text"
              className="admin-input"
              value={quote.projectTitle}
              onChange={(e) => patch('projectTitle', e.target.value)}
            />
          </div>
          <div className="admin-field sm:col-span-2">
            <label className="admin-label" htmlFor="quote-projectDescription">{b.projectDescription}</label>
            <input
              id="quote-projectDescription"
              type="text"
              className="admin-input"
              value={quote.projectDescription}
              onChange={(e) => patch('projectDescription', e.target.value)}
            />
          </div>
          <div className="admin-field sm:col-span-2">
          <label className="admin-label" htmlFor="quote-terms">{b.terms}</label>
            <textarea
              id="quote-terms"
              className="admin-textarea"
              rows={3}
              value={quote.terms}
              onChange={(e) => patch('terms', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="quote-language">{b.language}</label>
            <select
              id="quote-language"
              className="admin-select"
              value={quote.language}
              onChange={(e) => patch('language', e.target.value as QuoteLanguage)}
            >
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
          <div className="admin-field">
            {/* ILS only for this phase — field is disabled but stays on the doc for future migration. */}
            <label className="admin-label" htmlFor="quote-currency">{b.currency}</label>
            <select
              id="quote-currency"
              className="admin-select"
              value={quote.currency}
              disabled
              aria-disabled="true"
            >
              <option value="ILS">ILS (₪)</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="quote-status">{b.quoteStatus}</label>
            <select
              id="quote-status"
              className="admin-select"
              value={quote.status}
              onChange={(e) => patch('status', e.target.value as QuoteStatus)}
            >
              {QUOTE_STATUSES.map((s) => (
                <option key={s} value={s}>{admin.status[s]}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="quote-vatRate">{b.vatRate}</label>
            <input
              id="quote-vatRate"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              className="admin-input"
              value={quote.vatRate}
              onChange={(e) => patch('vatRate', Number(e.target.value))}
              dir="ltr"
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Line items
      ---------------------------------------------------------------- */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <h2 className="!mb-0 text-[var(--t-20)]">{b.sectionItems}</h2>
          <button
            type="button"
            onClick={addItem}
            className="btn btn-sm btn-secondary inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            {b.addItem}
          </button>
        </div>

        {quote.items.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-fg-2">{b.noItems}</p>
        ) : (
          <>
            {/* Desktop table — hidden on mobile */}
            <div className="hidden overflow-x-auto scrollbar-slim sm:block">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="w-full">{b.itemDescription}</th>
                    <th className="text-end">{b.itemQty}</th>
                    <th className="text-end">{b.itemUnitPrice}</th>
                    <th className="text-end">{b.itemDiscount}</th>
                    <th className="text-center">{b.itemVat}</th>
                    <th className="text-end">{b.itemLineTotal}</th>
                    {/* Remove column — label provided per-row via aria-label */}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, i) => {
                    const lineNet =
                      item.quantity * item.unitPrice * (1 - item.discountPct / 100);
                    return (
                      <tr key={item.id}>
                        <td>
                          <label className="sr-only" htmlFor={`item-${i}-desc`}>
                            {b.itemDescription}
                          </label>
                          <input
                            id={`item-${i}-desc`}
                            type="text"
                            className="admin-input w-full"
                            value={item.description}
                            onChange={(e) => patchItem(i, 'description', e.target.value)}
                          />
                        </td>
                        <td>
                          <label className="sr-only" htmlFor={`item-${i}-qty`}>
                            {b.itemQty}
                          </label>
                          <input
                            id={`item-${i}-qty`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={1}
                            className="admin-input w-20 text-end"
                            value={item.quantity}
                            onChange={(e) => patchItem(i, 'quantity', Number(e.target.value))}
                            dir="ltr"
                          />
                        </td>
                        <td>
                          <label className="sr-only" htmlFor={`item-${i}-price`}>
                            {b.itemUnitPrice}
                          </label>
                          <input
                            id={`item-${i}-price`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={0.01}
                            className="admin-input w-28 text-end"
                            value={item.unitPrice}
                            onChange={(e) => patchItem(i, 'unitPrice', Number(e.target.value))}
                            dir="ltr"
                          />
                        </td>
                        <td>
                          <label className="sr-only" htmlFor={`item-${i}-disc`}>
                            {b.itemDiscount}
                          </label>
                          <input
                            id={`item-${i}-disc`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={100}
                            step={0.1}
                            className="admin-input w-20 text-end"
                            value={item.discountPct}
                            onChange={(e) => patchItem(i, 'discountPct', Number(e.target.value))}
                            dir="ltr"
                          />
                        </td>
                        <td className="text-center">
                          <label className="sr-only" htmlFor={`item-${i}-vat`}>
                            {b.itemVat}
                          </label>
                          <input
                            id={`item-${i}-vat`}
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--accent)]"
                            checked={item.vatApplies}
                            onChange={(e) => patchItem(i, 'vatApplies', e.target.checked)}
                          />
                        </td>
                        <td className="admin-num text-end text-fg-1">
                          {formatMoney(lineNet, quote.language)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--r-1)] text-fg-3 transition-colors hover:bg-surface-raised hover:text-[var(--danger)] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus-ring)]"
                            aria-label={b.removeItem}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked layout — shown below sm breakpoint */}
            <div className="flex flex-col divide-y divide-[var(--line)] sm:hidden">
              {quote.items.map((item, i) => {
                const lineNet =
                  item.quantity * item.unitPrice * (1 - item.discountPct / 100);
                return (
                  <div key={item.id} className="flex flex-col gap-3 px-5 py-4">
                    <div className="admin-field">
                      <label className="admin-label" htmlFor={`m-item-${i}-desc`}>
                        {b.itemDescription}
                      </label>
                      <input
                        id={`m-item-${i}-desc`}
                        type="text"
                        className="admin-input"
                        value={item.description}
                        onChange={(e) => patchItem(i, 'description', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`m-item-${i}-qty`}>
                          {b.itemQty}
                        </label>
                        <input
                          id={`m-item-${i}-qty`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={1}
                          className="admin-input"
                          value={item.quantity}
                          onChange={(e) => patchItem(i, 'quantity', Number(e.target.value))}
                          dir="ltr"
                        />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`m-item-${i}-price`}>
                          {b.itemUnitPrice}
                        </label>
                        <input
                          id={`m-item-${i}-price`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          className="admin-input"
                          value={item.unitPrice}
                          onChange={(e) => patchItem(i, 'unitPrice', Number(e.target.value))}
                          dir="ltr"
                        />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`m-item-${i}-disc`}>
                          {b.itemDiscount}
                        </label>
                        <input
                          id={`m-item-${i}-disc`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={100}
                          step={0.1}
                          className="admin-input"
                          value={item.discountPct}
                          onChange={(e) => patchItem(i, 'discountPct', Number(e.target.value))}
                          dir="ltr"
                        />
                      </div>
                      <div className="admin-field">
                        <span className="admin-label">{b.itemLineTotal}</span>
                        <p className="admin-num py-2 text-sm text-fg-1">
                          {formatMoney(lineNet, quote.language)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label
                        className="flex cursor-pointer items-center gap-2 text-sm text-fg-1"
                        htmlFor={`m-item-${i}-vat`}
                      >
                        <input
                          id={`m-item-${i}-vat`}
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--accent)]"
                          checked={item.vatApplies}
                          onChange={(e) => patchItem(i, 'vatApplies', e.target.checked)}
                        />
                        {b.itemVat}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="inline-flex items-center gap-1 text-xs text-fg-3 transition-colors hover:text-[var(--danger)]"
                        aria-label={b.removeItem}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        {b.removeItem}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Totals panel */}
        <div className="border-t border-[var(--line)] px-5 py-4">
          <dl className="ms-auto flex w-full max-w-xs flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">{admin.totals.subtotal}</dt>
              <dd className="admin-num text-fg-1">{formatMoney(totals.subtotal, quote.language)}</dd>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-fg-2">{admin.totals.discount}</dt>
                <dd className="admin-num text-[var(--danger)]">
                  -{formatMoney(totals.discountTotal, quote.language)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-fg-2">{admin.totals.vat} ({quote.vatRate}%)</dt>
              <dd className="admin-num text-fg-1">{formatMoney(totals.vatTotal, quote.language)}</dd>
            </div>
            <div className="mt-1 flex justify-between gap-4 border-t border-[var(--line)] pt-2">
              <dt className="font-semibold text-fg-0">{admin.totals.total}</dt>
              <dd className="admin-num font-semibold text-fg-0">
                {formatMoney(totals.total, quote.language)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ----------------------------------------------------------------
          Actions
      ---------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isPending}
          aria-disabled={isPending}
          className="btn btn-primary btn-sm"
        >
          {admin.actions.saveDraft}
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={isPending}
          aria-disabled={isPending}
          className="btn btn-secondary btn-sm"
        >
          {admin.actions.preview}
        </button>
      </div>

    </div>
  );
}
