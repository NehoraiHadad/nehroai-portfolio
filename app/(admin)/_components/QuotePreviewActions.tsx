'use client';

import Link from 'next/link';
import { FileDown, Pencil, Save, Send } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { upsertQuote } from '@/lib/admin/quotes-store';
import type { QuoteDoc } from '@/lib/admin/types';

// Action bar for the quote preview. Hidden when printing (.no-print).
// Layout: left cluster (Save, Edit) — right cluster (Download PDF, Send).
// "Send to client" is a future stub: always disabled with a tooltip explaining why.

export function QuotePreviewActions({ email, quote }: { email: string; quote: QuoteDoc }) {
  const { admin } = useDictionary();
  const a = admin.actions;

  const handleSaveDraft = () => {
    upsertQuote(email, { ...quote, status: quote.status === 'draft' ? 'draft' : quote.status });
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div
      className="no-print mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3"
      role="toolbar"
      aria-label={a.preview}
    >
      {/* Left: secondary actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="btn btn-secondary btn-sm"
          aria-label={a.saveDraft}
        >
          <Save className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {a.saveDraft}
        </button>

        <Link
          href={`/admin/quotes/${quote.id}`}
          className="btn btn-secondary btn-sm"
          aria-label={a.edit}
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {a.edit}
        </Link>
      </div>

      {/* Right: export + delivery */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="btn btn-primary btn-sm"
          aria-label={a.downloadPdf}
        >
          <FileDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {a.downloadPdf}
        </button>

        {/* Future stub — email delivery is out of scope for this phase */}
        <button
          type="button"
          disabled
          className="btn btn-secondary btn-sm"
          title={a.sendToClientFuture}
          aria-label={`${a.sendToClient} — ${a.sendToClientFuture}`}
          aria-disabled="true"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {a.sendToClient}
        </button>
      </div>
    </div>
  );
}
