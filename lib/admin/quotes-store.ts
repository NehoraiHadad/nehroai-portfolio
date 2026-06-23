'use client';

import { useSyncExternalStore } from 'react';
import type { QuoteDoc } from './types';

// Per-user localStorage persistence for quotes (DB is future scope — see
// FUTURE.md). Keyed by the logged-in email so drafts survive logout and never
// bleed across accounts. Mirrors the app's existing storage pattern
// (ThemeToggle): DOM/storage is the source of truth, components subscribe via
// useSyncExternalStore to an event, so there's no setState-in-effect and no
// hydration mismatch.

const STORE_PREFIX = 'nehorai:admin:quotes:';
const EVENT = 'nehorai:adminquoteschange';

function storeKey(email: string): string {
  return `${STORE_PREFIX}${email.toLowerCase()}`;
}

function emitChange() {
  window.dispatchEvent(new Event(EVENT));
}

export function readQuotes(email: string): QuoteDoc[] {
  try {
    const raw = window.localStorage.getItem(storeKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuoteDoc[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQuotes(email: string, quotes: QuoteDoc[]) {
  try {
    window.localStorage.setItem(storeKey(email), JSON.stringify(quotes));
  } catch {
    // Storage unavailable — in-memory state in the caller still works for the session.
  }
  emitChange();
}

export function getQuote(email: string, id: string): QuoteDoc | undefined {
  return readQuotes(email).find((q) => q.id === id);
}

/** Insert or update by id. Stamps updatedAt. */
export function upsertQuote(email: string, quote: QuoteDoc): QuoteDoc {
  const stamped: QuoteDoc = { ...quote, updatedAt: new Date().toISOString() };
  const quotes = readQuotes(email);
  const idx = quotes.findIndex((q) => q.id === stamped.id);
  if (idx >= 0) {
    quotes[idx] = stamped;
  } else {
    quotes.unshift(stamped);
  }
  writeQuotes(email, quotes);
  return stamped;
}

export function deleteQuote(email: string, id: string): void {
  writeQuotes(email, readQuotes(email).filter((q) => q.id !== id));
}

// --- React subscription -------------------------------------------------------

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange); // cross-tab sync
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// Snapshot cache so useSyncExternalStore gets a stable reference between events
// (returning a fresh array every call would loop). Re-derived only on change.
const snapshotCache = new Map<string, { json: string; value: QuoteDoc[] }>();

function getQuotesSnapshot(email: string): QuoteDoc[] {
  let json = '[]';
  try {
    json = window.localStorage.getItem(storeKey(email)) ?? '[]';
  } catch {
    json = '[]';
  }
  const cached = snapshotCache.get(email);
  if (cached && cached.json === json) {
    return cached.value;
  }
  const value = readQuotes(email);
  snapshotCache.set(email, { json, value });
  return value;
}

/** Reactive list of the current user's quotes. Empty array during SSR. */
export function useQuotes(email: string): QuoteDoc[] {
  return useSyncExternalStore(
    subscribe,
    () => getQuotesSnapshot(email),
    () => [] as QuoteDoc[],
  );
}
