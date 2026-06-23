'use client';

import Image from 'next/image';
import { useDictionary } from '@/lib/i18n/provider';
import { computeTotals, formatMoney } from '@/lib/admin/totals';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import type { QuoteDoc, BrandProfile } from '@/lib/admin/types';

// Pure, printable, branded quote sheet. No client-side state — all data flows
// in via props. The `dir` attribute is driven by quote.language (he → rtl) so
// a Hebrew quote prints RTL even when the admin UI is in English.

function Monogram() {
  return (
    <div
      aria-hidden="true"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--r-1)] border border-line bg-accent-dim font-mono text-xl font-semibold tracking-tight text-accent-pale"
    >
      NH
    </div>
  );
}

export function QuotePreview({ quote, brand }: { quote: QuoteDoc; brand: BrandProfile }) {
  const { admin } = useDictionary();
  const p = admin.preview;
  const t = admin.totals;
  const dir = quote.language === 'he' ? 'rtl' : 'ltr';
  const totals = computeTotals(quote.items, quote.vatRate);
  const money = (n: number) => formatMoney(n, quote.language);

  return (
    <div
      dir={dir}
      lang={quote.language === 'he' ? 'he' : 'en'}
      className="print-sheet card mx-auto max-w-3xl p-8 text-fg-0"
    >
      {/* Header — brand + quote meta */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-6">
        {/* Brand block */}
        <div className="flex items-center gap-4">
          {brand.logoUrl ? (
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-[var(--r-1)] object-contain"
            />
          ) : (
            <Monogram />
          )}
          <div>
            <p className="text-[var(--t-20)] font-semibold leading-tight text-fg-0">{brand.name}</p>
            {brand.tagline && <p className="text-xs text-fg-2">{brand.tagline}</p>}
            {brand.email && (
              <p className="text-xs text-fg-2">
                <a href={`mailto:${brand.email}`} className="hover:underline">{brand.email}</a>
              </p>
            )}
            {brand.phone && <p className="text-xs text-fg-2">{brand.phone}</p>}
            {brand.address && <p className="text-xs text-fg-2">{brand.address}</p>}
          </div>
        </div>

        {/* Quote number + date + status */}
        <div className="text-end">
          <p className="font-mono text-xs uppercase tracking-[var(--ls-wide)] text-fg-2">{p.quoteNumber}</p>
          <p className="admin-num font-mono text-[var(--t-20)] font-semibold text-fg-0">{quote.number}</p>
          <p className="mt-1 text-xs text-fg-2">
            <span className="font-mono uppercase tracking-[var(--ls-wide)]">{p.date}</span>{' '}
            {new Date(quote.createdAt).toLocaleDateString(quote.language === 'he' ? 'he-IL' : 'en-IL')}
          </p>
          <div className="mt-2 flex justify-end">
            <QuoteStatusBadge status={quote.status} />
          </div>
        </div>
      </header>

      <hr className="mb-6 border-line" />

      {/* Client + project */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        {/* Client */}
        <section aria-label={p.quoteFor}>
          <p className="eyebrow mb-2">{p.quoteFor}</p>
          <p className="font-semibold text-fg-0">{quote.client.name}</p>
          {quote.client.company && <p className="text-sm text-fg-1">{quote.client.company}</p>}
          {quote.client.email && (
            <p className="text-sm text-fg-1">
              <a href={`mailto:${quote.client.email}`} className="hover:underline">{quote.client.email}</a>
            </p>
          )}
          {quote.client.phone && <p className="text-sm text-fg-1">{quote.client.phone}</p>}
          {quote.client.taxId && <p className="text-xs text-fg-2">{quote.client.taxId}</p>}
          {quote.client.address && <p className="text-xs text-fg-2">{quote.client.address}</p>}
        </section>

        {/* Project */}
        <section aria-label={p.project}>
          <p className="eyebrow mb-2">{p.project}</p>
          {quote.projectTitle && (
            <p className="font-semibold text-fg-0">{quote.projectTitle}</p>
          )}
          {quote.projectDescription && (
            <p className="mt-1 text-sm text-fg-1">{quote.projectDescription}</p>
          )}
        </section>
      </div>

      {/* Line items */}
      <div className="mb-6 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="text-start">{admin.builder.itemDescription}</th>
              <th className="admin-num text-end">{admin.builder.itemQty}</th>
              <th className="admin-num text-end">{admin.builder.itemUnitPrice}</th>
              {quote.items.some((i) => i.discountPct) && (
                <th className="admin-num text-end">{admin.builder.itemDiscount}</th>
              )}
              <th className="admin-num text-end">{admin.builder.itemLineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-fg-2">{admin.builder.noItems}</td>
              </tr>
            )}
            {quote.items.map((item) => {
              const gross = item.quantity * item.unitPrice;
              const net = gross - gross * (item.discountPct / 100);
              return (
                <tr key={item.id}>
                  <td className="text-fg-0">{item.description}</td>
                  <td className="admin-num text-end text-fg-1">{item.quantity}</td>
                  <td className="admin-num text-end text-fg-1">{money(item.unitPrice)}</td>
                  {quote.items.some((i) => i.discountPct) && (
                    <td className="admin-num text-end text-fg-2">
                      {item.discountPct ? `${item.discountPct}%` : '—'}
                    </td>
                  )}
                  <td className="admin-num text-end text-fg-0">{money(net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals block */}
      <div className="mb-6 flex justify-end">
        <dl className="w-64 space-y-1">
          <div className="flex justify-between text-sm text-fg-1">
            <dt>{t.subtotal}</dt>
            <dd className="admin-num">{money(totals.subtotal)}</dd>
          </div>
          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-sm text-[var(--ok)]">
              <dt>{t.discount}</dt>
              <dd className="admin-num">−{money(totals.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between text-sm text-fg-1">
            <dt>{t.vat} ({quote.vatRate}%)</dt>
            <dd className="admin-num">{money(totals.vatTotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-1 text-base font-semibold text-fg-0">
            <dt>{t.total}</dt>
            <dd className="admin-num">{money(totals.total)}</dd>
          </div>
        </dl>
      </div>

      {/* Validity */}
      {quote.validUntil && (
        <p className="mb-4 text-xs text-fg-2">
          <span className="font-mono uppercase tracking-[var(--ls-wide)]">{p.validUntil}</span>{' '}
          {new Date(quote.validUntil).toLocaleDateString(quote.language === 'he' ? 'he-IL' : 'en-IL')}
        </p>
      )}

      {/* Terms */}
      <section aria-label={p.terms} className="border-t border-line pt-4">
        <p className="eyebrow mb-1">{p.terms}</p>
        <p className="whitespace-pre-wrap text-sm text-fg-1">
          {quote.terms || p.termsPlaceholder}
        </p>
      </section>
    </div>
  );
}
