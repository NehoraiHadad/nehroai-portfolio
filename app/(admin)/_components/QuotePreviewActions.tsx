'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Copy, FileDown, Pencil, Save, Send } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { saveQuoteAction, shareQuoteAction } from './quote-actions';
import type { QuoteDoc } from '@/lib/admin/types';

// Action bar for the quote preview. Hidden when printing (.no-print).
// Layout: left cluster (Save, Edit) — right cluster (Download PDF, Send).
// "Send to client" mints a public approval link via shareQuoteAction and reveals
// a copy-to-clipboard panel; the action is idempotent (re-clicking re-fetches the
// same token URL).

export function QuotePreviewActions({ quote }: { quote: QuoteDoc }) {
  const { admin } = useDictionary();
  const a = admin.actions;
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, startShareTransition] = useTransition();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveDraft = () => {
    startTransition(async () => {
      await saveQuoteAction(quote);
    });
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/admin/quotes/${quote.id}/pdf`);
      if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quote.number || 'quote'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[QuotePreviewActions] PDF download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    setShareError(false);
    startShareTransition(async () => {
      try {
        const res = await shareQuoteAction(quote.id);
        setShareUrl(res.url);
      } catch (err) {
        console.error('[QuotePreviewActions] Share failed:', err);
        setShareError(true);
      }
    });
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="no-print mx-auto mb-6 max-w-3xl flex flex-col gap-3">
      {/* Toolbar row */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        role="toolbar"
        aria-label={a.preview}
      >
        {/* Left: secondary actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            aria-disabled={isPending}
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
            disabled={isGenerating}
            aria-disabled={isGenerating}
            className="btn btn-primary btn-sm"
            aria-label={a.downloadPdf}
          >
            <FileDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {a.downloadPdf}
          </button>

          {/* Share / send to client — mints a public approval link */}
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            aria-disabled={isSharing}
            className="btn btn-secondary btn-sm"
            aria-label={a.sendToClient}
          >
            <Send className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            {a.sendToClient}
          </button>
        </div>
      </div>

      {/* Inline error */}
      {shareError && (
        <p className="text-xs text-[var(--err,#ef4444)]" role="alert">
          {a.shareError}
        </p>
      )}

      {/* Share link panel — revealed after a successful shareQuoteAction call */}
      {shareUrl && (
        <div className="rounded-md border border-[var(--ok,#22c55e)]/40 bg-[var(--ok,#22c55e)]/5 p-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-fg-2">{a.shareLinkLabel}</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 overflow-x-auto rounded bg-[var(--surface-2,#1e1e2e)] px-2 py-1.5 text-xs font-mono text-fg-1 whitespace-nowrap border-0 outline-none"
              dir="ltr"
              onFocus={(e) => e.currentTarget.select()}
              aria-label={a.shareLinkLabel}
            />
            <button
              type="button"
              className="btn btn-sm shrink-0"
              onClick={handleCopyLink}
              aria-label={a.copyLink}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[var(--ok,#22c55e)]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="ms-1">{copied ? a.linkCopied : a.copyLink}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
