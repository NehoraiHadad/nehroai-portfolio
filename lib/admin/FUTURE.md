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
- **File storage / logo upload (Vercel Blob)** — today the brand logo is a URL
  string (`BrandProfile.logoUrl`); the document falls back to the bundled Nehorai
  monogram for light surfaces (`/brand/monogram-light.svg`) when it is empty. To
  allow a real uploaded logo (and later, attaching supporting docs):
  1. `pnpm add @vercel/blob`; the Vercel project already provisions a
     `BLOB_READ_WRITE_TOKEN` once a Blob store is created in the dashboard.
  2. Add a Server Action `uploadBrandLogoAction(formData)` next to
     `brand-actions.ts`: `requireAdmin()` → validate (image mime, ≤ ~2 MB) →
     `put(\`brand/\${owner}/logo-\${id}.\${ext}\`, file, { access: 'public' })`
     → persist the returned `url` into `logoUrl` via `saveBrand`.
  3. Swap the Settings logo URL field for a file input + preview; keep the URL
     field as a manual fallback. The public Blob URL is what gets stored, so
     `QuotePreview` needs no change (it already renders `brand.logoUrl`).
  - Build only when there's a real need to host uploaded assets; the wordmark
    default covers the common case.
