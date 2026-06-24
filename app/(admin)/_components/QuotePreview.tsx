'use client';

import Image from 'next/image';
import { useDictionary } from '@/lib/i18n/provider';
import { computeTotals, formatMoney } from '@/lib/admin/totals';
import type { QuoteDoc, BrandProfile } from '@/lib/admin/types';

// Premium, printable quote document. Renders as a real white "paper" sheet with
// a self-contained palette (.quote-paper in globals.css) so screen and print are
// identical (WYSIWYG). `dir` follows quote.language (he → rtl); Hebrew quotes use
// the Rubik stack via .quote-paper--he.
//
// Brand mark: a custom brand.logoUrl wins; otherwise the document falls back to
// the Nehorai monogram built for light surfaces (/brand/monogram-light.svg — a
// dark-navy N that reads on the white sheet; the plain monogram is for dark UI).
const DEFAULT_MARK = '/brand/monogram-light.svg';

export function QuotePreview({ quote, brand }: { quote: QuoteDoc; brand: BrandProfile }) {
  const { admin } = useDictionary();
  const p = admin.preview;
  const t = admin.totals;
  const b = admin.builder;
  const he = quote.language === 'he';
  const dir = he ? 'rtl' : 'ltr';
  const totals = computeTotals(quote.items, quote.vatRate);
  const money = (n: number) => formatMoney(n, quote.language);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(he ? 'he-IL' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  const hasDiscountCol = quote.items.some((i) => i.discountPct);
  const colCount = hasDiscountCol ? 5 : 4;

  return (
    <div
      dir={dir}
      lang={he ? 'he' : 'en'}
      className={`print-sheet quote-paper mx-auto w-full max-w-[794px]${he ? ' quote-paper--he' : ''}`}
    >
      <div className="quote-paper__bar" aria-hidden="true" />

      <div className="quote-paper__body">
        {/* Letterhead — brand ⟷ document title + number */}
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={220}
                height={56}
                unoptimized
                className="h-14 w-auto max-w-[220px] object-contain"
              />
            ) : (
              <Image
                src={DEFAULT_MARK}
                alt={brand.name}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 object-contain"
              />
            )}
            <div>
              <p className="qp-ink text-[18px] font-semibold leading-tight">{brand.name}</p>
              {brand.tagline && <p className="qp-ink-2 mt-1 text-[12px]">{brand.tagline}</p>}
            </div>
          </div>

          <div className="text-end">
            <p className="qp-eyebrow">{p.title}</p>
            <p className="qp-ink admin-num mt-1.5 font-mono text-[24px] font-bold leading-none">{quote.number}</p>
          </div>
        </header>

        <div className="qp-divide mt-7" />

        {/* Summary band — who it's for ⟷ quote details + the headline amount */}
        <div className="qp-summary mt-7 grid sm:grid-cols-2">
          <section className="qp-summary__col">
            <p className="qp-eyebrow mb-3">{p.quoteFor}</p>
            <p className="qp-ink text-[15px] font-semibold">{quote.client.name || '—'}</p>
            {quote.client.company && <p className="qp-ink-1 mt-0.5 text-[13px]">{quote.client.company}</p>}
            {/* bdi isolates Latin/number runs so they read correctly while the
               line still aligns to the start edge (right in RTL) like the rest. */}
            {quote.client.email && (
              <p className="qp-ink-1 mt-0.5 text-[13px]">
                <bdi>{quote.client.email}</bdi>
              </p>
            )}
            {quote.client.phone && (
              <p className="qp-ink-1 mt-0.5 text-[13px]">
                <bdi>{quote.client.phone}</bdi>
              </p>
            )}
            {quote.client.taxId && (
              <p className="qp-ink-2 mt-1 text-[12px]">
                {b.clientTaxId}: <bdi>{quote.client.taxId}</bdi>
              </p>
            )}
            {quote.client.address && <p className="qp-ink-2 mt-0.5 text-[12px]">{quote.client.address}</p>}
          </section>

          <section className="qp-summary__col">
            <p className="qp-eyebrow mb-3">{p.details}</p>
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between gap-4">
                <dt className="qp-ink-2 text-[12px]">{b.quoteStatus}</dt>
                <dd>
                  <span className={`qp-status qp-status--${quote.status}`}>{admin.status[quote.status]}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="qp-ink-2 text-[12px]">{p.date}</dt>
                <dd className="qp-ink admin-num text-[13px]">{fmtDate(quote.createdAt)}</dd>
              </div>
              {quote.validUntil && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="qp-ink-2 text-[12px]">{p.validUntil}</dt>
                  <dd className="qp-ink admin-num text-[13px]">{fmtDate(quote.validUntil)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Project */}
        {(quote.projectTitle || quote.projectDescription) && (
          <section className="mt-8">
            <p className="qp-eyebrow mb-1.5">{p.project}</p>
            {quote.projectTitle && <p className="qp-ink text-[16px] font-semibold">{quote.projectTitle}</p>}
            {quote.projectDescription && (
              <p className="qp-ink-1 mt-1 max-w-[64ch] text-[14px] leading-relaxed">{quote.projectDescription}</p>
            )}
          </section>
        )}

        {/* Line items */}
        <div className="qp-box mt-7">
          <table className="qp-table">
            <thead>
              <tr>
                <th>{b.itemDescription}</th>
                <th className="admin-num text-end">{b.itemQty}</th>
                <th className="admin-num text-end">{b.itemUnitPrice}</th>
                {hasDiscountCol && <th className="admin-num text-end">{b.itemDiscount}</th>}
                <th className="admin-num text-end">{b.itemLineTotal}</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="qp-ink-2 text-center">
                    {b.noItems}
                  </td>
                </tr>
              )}
              {quote.items.map((item) => {
                const gross = item.quantity * item.unitPrice;
                const net = gross - gross * (item.discountPct / 100);
                return (
                  <tr key={item.id}>
                    <td className="qp-ink">{item.description || '—'}</td>
                    <td className="qp-ink-1 admin-num text-end">{item.quantity}</td>
                    <td className="qp-ink-1 admin-num text-end">{money(item.unitPrice)}</td>
                    {hasDiscountCol && (
                      <td className="qp-ink-2 admin-num text-end">{item.discountPct ? `−${item.discountPct}%` : '—'}</td>
                    )}
                    <td className="qp-ink admin-num text-end font-semibold">{money(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <dl className="qp-totals">
            <div className="flex justify-between text-[13px]">
              <dt className="qp-ink-1">{t.subtotal}</dt>
              <dd className="qp-ink admin-num">{money(totals.subtotal)}</dd>
            </div>
            {totals.discountTotal > 0 && (
              <div className="mt-2 flex justify-between text-[13px]">
                <dt className="qp-discount">{t.discount}</dt>
                <dd className="qp-discount admin-num">−{money(totals.discountTotal)}</dd>
              </div>
            )}
            <div className="mt-2 flex justify-between text-[13px]">
              <dt className="qp-ink-1">
                {t.vat} ({quote.vatRate}%)
              </dt>
              <dd className="qp-ink admin-num">{money(totals.vatTotal)}</dd>
            </div>
            <div className="qp-total flex items-baseline justify-between">
              <dt className="qp-ink font-mono text-[12px] font-semibold uppercase tracking-[var(--ls-wide)]">
                {t.total}
              </dt>
              <dd className="qp-amount admin-num text-[20px]">{money(totals.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Terms */}
        <section className="qp-divide mt-8 pt-4">
          <p className="qp-eyebrow mb-1.5">{p.terms}</p>
          <p className="qp-ink-1 max-w-[72ch] whitespace-pre-wrap text-[13px] leading-relaxed">
            {quote.terms || p.termsPlaceholder}
          </p>
        </section>

        {/* Footer — brand contact line, pinned to the foot of the sheet */}
        <footer className="qp-divide mt-auto flex flex-wrap items-center justify-between gap-2 pt-6">
          <p className="qp-ink-2 text-[12px]">
            <span className="qp-ink font-semibold">{brand.name}</span>
            {brand.email ? (
              <>
                {' · '}
                <bdi>{brand.email}</bdi>
              </>
            ) : null}
            {brand.phone ? (
              <>
                {' · '}
                <bdi>{brand.phone}</bdi>
              </>
            ) : null}
          </p>
          <p className="qp-ink-2 text-[12px]">{p.thankYou}</p>
        </footer>
      </div>
    </div>
  );
}
