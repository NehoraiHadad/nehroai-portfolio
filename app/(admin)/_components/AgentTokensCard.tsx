'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Trash2, KeyRound } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import type { ApiTokenRow } from '@/lib/admin/db/queries';
import { createTokenAction, listTokensAction, revokeTokenAction } from './token-actions';

export function AgentTokensCard({ initialTokens }: { initialTokens: ApiTokenRow[] }) {
  const { admin } = useDictionary();
  const t = admin.settings.tokens;
  const router = useRouter();

  const [tokens, setTokens] = useState<ApiTokenRow[]>(initialTokens);
  const [labelInput, setLabelInput] = useState('');
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshList = async () => {
    try {
      const fresh = await listTokensAction();
      setTokens(fresh);
    } catch {
      // non-fatal — list may be stale
    }
  };

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createTokenAction(labelInput);
        setRevealedToken(result.token);
        setLabelInput('');
        setCopied(false);
        await refreshList();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.createError);
      }
    });
  };

  const handleCopy = () => {
    if (!revealedToken) return;
    navigator.clipboard.writeText(revealedToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRevoke = (id: string) => {
    setError(null);
    // Optimistic update
    setTokens((prev) =>
      prev.map((tok) => (tok.id === id ? { ...tok, revokedAt: new Date() } : tok)),
    );
    startTransition(async () => {
      try {
        await revokeTokenAction(id);
        await refreshList();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.createError);
        // revert optimistic update on error
        await refreshList();
      }
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return t.never;
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card flex flex-col gap-4 p-5">
      {/* Heading */}
      <div>
        <h2 className="!mb-0 text-[var(--t-20)] flex items-center gap-2">
          <KeyRound className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
          {t.heading}
        </h2>
        <p className="text-xs text-fg-2">{t.description}</p>
      </div>

      {/* Create token row */}
      <div className="flex gap-2">
        <div className="admin-field flex-1 !gap-0">
          <input
            type="text"
            className="admin-input"
            placeholder={t.labelPlaceholder}
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
            disabled={isPending}
            dir="ltr"
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm self-end"
          onClick={handleCreate}
          disabled={isPending}
        >
          {t.createButton}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-[var(--err,#ef4444)]" role="alert">
          {error}
        </p>
      )}

      {/* Revealed token box */}
      {revealedToken && (
        <div className="rounded-md border border-[var(--ok,#22c55e)]/40 bg-[var(--ok,#22c55e)]/5 p-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--ok,#22c55e)]">{t.revealWarning}</p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 overflow-x-auto rounded bg-[var(--surface-2,#1e1e2e)] px-2 py-1.5 text-xs font-mono text-fg-1 whitespace-nowrap"
              dir="ltr"
            >
              {revealedToken}
            </code>
            <button
              type="button"
              className="btn btn-sm shrink-0"
              onClick={handleCopy}
              aria-label={t.copyButton}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[var(--ok,#22c55e)]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="ms-1">{copied ? t.copied : t.copyButton}</span>
            </button>
          </div>
          <button
            type="button"
            className="self-end text-xs text-fg-2 underline underline-offset-2"
            onClick={() => setRevealedToken(null)}
          >
            {t.dismiss}
          </button>
        </div>
      )}

      {/* Token list */}
      {tokens.length === 0 ? (
        <p className="text-xs text-fg-2">{t.emptyState}</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border,#27272a)]">
          {tokens.map((tok) => {
            const isRevoked = !!tok.revokedAt;
            return (
              <div
                key={tok.id}
                className={`flex items-center gap-3 py-2.5 ${isRevoked ? 'opacity-40' : ''}`}
              >
                {/* Prefix */}
                <code
                  className="shrink-0 rounded bg-[var(--surface-2,#1e1e2e)] px-1.5 py-0.5 text-xs font-mono text-fg-1"
                  dir="ltr"
                >
                  {tok.prefix}…
                </code>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${isRevoked ? 'line-through' : ''}`}>
                    {tok.label || <span className="text-fg-2 italic">(no label)</span>}
                  </p>
                  <p className="text-[10px] text-fg-2">
                    <span>{t.createdLabel}: {formatDate(tok.createdAt)}</span>
                    {' · '}
                    <span>{t.lastUsedLabel}: {formatDate(tok.lastUsedAt)}</span>
                  </p>
                </div>

                {/* Badge or revoke */}
                {isRevoked ? (
                  <span className="chip text-[10px]">{t.revoked}</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm shrink-0 text-[var(--err,#ef4444)] hover:bg-[var(--err,#ef4444)]/10"
                    onClick={() => handleRevoke(tok.id)}
                    disabled={isPending}
                    aria-label={`${t.revoke} ${tok.label || tok.prefix}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="ms-1">{t.revoke}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
