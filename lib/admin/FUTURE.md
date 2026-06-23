# Admin — Future / TODO

Out of scope for the current phase (infra + UI). Tracked here and surfaced in
the Settings → "Coming soon" panel.

- **Database persistence** — replace the per-user localStorage store
  (`lib/admin/quotes-store.ts`, key `nehorai:admin:quotes:<email>`) with a real
  DB. Keep the `QuoteDoc` shape (`lib/admin/types.ts`) as the contract.
- **PDF generation (server)** — current "Download PDF" uses browser print
  (`@media print` + `window.print()`). A server/library route (e.g. pdf-lib /
  Playwright) can produce a stored PDF artifact.
- **Email sending** — "Send to client" is a disabled stub. Resend is already
  wired for the contact form; sending quotes to arbitrary client addresses needs
  a verified Resend domain first.
- **Public signed approval link** — shareable, tokenized quote URL where a
  client can approve/reject without logging in.
- **SUMIT integration** — issue invoices / receipts from an approved quote.
- **Client portal** — clients see their own quotes/history.
- **Audit log** — who changed what, when.
- **File storage** — attach assets (logo upload, supporting docs) instead of a
  logo URL.
