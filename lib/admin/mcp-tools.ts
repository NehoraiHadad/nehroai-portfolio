// MCP tool registrations for the nehroai-admin server. Each tool is scoped to
// the authenticated owner — identity always comes from extra.authInfo, never
// from a tool argument. Keep descriptions written for a new teammate: enough
// context to use the tool correctly without reading the source.
import 'server-only';

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types.js';

import {
  listQuotes,
  getQuote,
  upsertQuote,
  deleteQuote,
  getBrand,
  saveBrand,
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  listQuotesByClient,
} from './db/queries';
import { buildAndCreateQuote, applyQuotePatch } from './build-quote';
import { computeTotals } from './totals';
import { generateQuotePdf } from './pdf/generate-quote-pdf';
import {
  zCreateQuoteInput,
  zPatchQuoteInput,
  zBrandInput,
  zQuoteLanguage,
  zClientRecordInput,
  zClientRecordPatch,
} from '@/app/api/admin/v1/_lib/schemas';

// ---- Auth helper -------------------------------------------------------------

type Extra = RequestHandlerExtra<ServerRequest, ServerNotification>;

/**
 * Extract the owner email from the MCP request context. Throws a clear error if
 * auth info is absent — this should never happen because withMcpAuth is
 * configured with { required: true }, so treat it as a programming error.
 */
function ownerOf(extra: Extra): string {
  const email = extra?.authInfo?.extra?.ownerEmail as string | undefined;
  if (!email) {
    throw new Error(
      'authInfo.extra.ownerEmail is missing — route must be wrapped with withMcpAuth({ required: true }).',
    );
  }
  return email;
}

// ---- Tool error helper -------------------------------------------------------

/** Return a tool error result without a stack trace. */
function toolError(message: string) {
  return {
    content: [{ type: 'text' as const, text: 'Error: ' + message }],
    isError: true,
  };
}

// ---- Tool registration ------------------------------------------------------

export function registerQuoteTools(server: McpServer): void {
  // -- list_quotes -------------------------------------------------------------
  server.registerTool(
    'list_quotes',
    {
      title: 'List Quotes',
      description:
        'List all quotes you own, newest first. Use format=concise (default) for a compact ' +
        'summary of each quote (id, number, status, client name, total) or format=detailed to ' +
        'return the full quote documents. Prefer concise when the agent just needs to pick an id.',
      inputSchema: {
        format: z.enum(['concise', 'detailed']).optional(),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const docs = await listQuotes(owner);

        const rows =
          args.format === 'detailed'
            ? docs
            : docs.map((q) => ({
                id: q.id,
                number: q.number,
                status: q.status,
                language: q.language,
                clientName: q.client.name,
                total: computeTotals(q.items, q.vatRate).total,
                updatedAt: q.updatedAt,
              }));

        const summary =
          docs.length === 0
            ? 'No quotes found.'
            : `Found ${docs.length} quote${docs.length === 1 ? '' : 's'}.`;

        return {
          content: [{ type: 'text', text: summary + '\n\n' + JSON.stringify(rows, null, 2) }],
          structuredContent: { quotes: rows },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- create_quote ------------------------------------------------------------
  server.registerTool(
    'create_quote',
    {
      title: 'Create Quote',
      description:
        'Create a new price quote. The quote number (NH-YYYY-NNNN) is allocated automatically — ' +
        'never invent one. Currency is always ILS; VAT defaults to 18%. Provide the client block ' +
        '(name is required, all other client fields default to empty string) and line items. ' +
        'Everything else is optional and defaults are applied by the server.',
      inputSchema: zCreateQuoteInput.shape,
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const quote = await buildAndCreateQuote(owner, args);
        const totals = computeTotals(quote.items, quote.vatRate);
        const summary =
          `Created quote ${quote.number} (id: ${quote.id}) — ` +
          `total ₪${totals.total.toFixed(2)}, status: ${quote.status}.`;
        return {
          content: [{ type: 'text', text: summary }],
          structuredContent: { quote },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- get_quote ---------------------------------------------------------------
  server.registerTool(
    'get_quote',
    {
      title: 'Get Quote',
      description: 'Fetch one full quote document by its id. Returns all fields.',
      inputSchema: {
        id: z.string().describe('The quote id (UUID).'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const quote = await getQuote(owner, args.id);
        if (!quote) {
          return toolError(`Quote ${args.id} not found.`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(quote, null, 2) }],
          structuredContent: { quote },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- update_quote ------------------------------------------------------------
  server.registerTool(
    'update_quote',
    {
      title: 'Update Quote',
      description:
        'Update fields of an existing quote (partial patch). Only the fields you include in the ' +
        'call are changed; everything else stays as-is. Pass the quote id plus any subset of ' +
        'fields. To replace line items entirely, pass the full items array.',
      inputSchema: {
        id: z.string().describe('The quote id (UUID) to update.'),
        ...zPatchQuoteInput.shape,
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        // Separate the id (used to locate the quote) from the patch fields —
        // applyQuotePatch does not expect an id field in the patch.
        const { id, ...patch } = args;
        const existing = await getQuote(owner, id);
        if (!existing) {
          return toolError(`Quote ${id} not found.`);
        }

        const updated = applyQuotePatch(existing, patch);
        const saved = await upsertQuote(owner, updated);

        return {
          content: [{ type: 'text', text: JSON.stringify(saved, null, 2) }],
          structuredContent: { quote: saved },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- delete_quote ------------------------------------------------------------
  server.registerTool(
    'delete_quote',
    {
      title: 'Delete Quote',
      description: 'Permanently delete a quote you own by id. This cannot be undone.',
      inputSchema: {
        id: z.string().describe('The quote id (UUID) to delete.'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const quote = await getQuote(owner, args.id);
        if (!quote) {
          return toolError(`Quote ${args.id} not found.`);
        }
        await deleteQuote(owner, args.id);
        return {
          content: [{ type: 'text', text: `Deleted ${quote.number} (id: ${args.id}).` }],
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- get_brand ---------------------------------------------------------------
  server.registerTool(
    'get_brand',
    {
      title: 'Get Brand',
      description:
        'Get your brand profile (company name, tagline, logo URL, contact details) that appears ' +
        'on generated quotes. Pass language=he to see the Hebrew variant if you have one stored.',
      inputSchema: {
        language: zQuoteLanguage.optional().describe('Language variant to retrieve (default: en).'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const brand = await getBrand(owner, args.language ?? 'en');
        return {
          content: [{ type: 'text', text: JSON.stringify(brand, null, 2) }],
          structuredContent: { brand },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- update_brand ------------------------------------------------------------
  server.registerTool(
    'update_brand',
    {
      title: 'Update Brand',
      description:
        'Update your brand profile fields (partial merge). Only the fields you pass are changed. ' +
        'The brand profile is shared across all quotes; changes take effect on the next PDF render.',
      inputSchema: zBrandInput.shape,
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const existing = await getBrand(owner, 'en');
        const merged = {
          name: args.name ?? existing.name,
          tagline: args.tagline ?? existing.tagline,
          email: args.email ?? existing.email,
          phone: args.phone ?? existing.phone,
          address: args.address ?? existing.address,
          logoUrl: args.logoUrl ?? existing.logoUrl,
        };
        await saveBrand(owner, merged);
        return {
          content: [{ type: 'text', text: JSON.stringify(merged, null, 2) }],
          structuredContent: { brand: merged },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- get_quote_pdf -----------------------------------------------------------
  server.registerTool(
    'get_quote_pdf',
    {
      title: 'Get Quote PDF',
      description:
        'Generate the branded PDF for a quote and return it as a base64-encoded resource. ' +
        'Uses headless Chromium to render the quote-pdf page — may take a few seconds on cold ' +
        'start. Requires APP_URL or AUTH_URL to be set in the environment so Chromium knows ' +
        'which origin to navigate to. If neither is set, use the HTTP endpoint ' +
        '/api/admin/v1/quotes/{id}/pdf instead.',
      inputSchema: {
        id: z.string().describe('The quote id (UUID) to render as PDF.'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const quote = await getQuote(owner, args.id);
        if (!quote) {
          return toolError(`Quote ${args.id} not found.`);
        }

        // The tool handler does not receive the original HTTP Request, so we
        // resolve the origin in this order: (1) the value the route stashed in
        // authInfo.extra (derived from the incoming request via getPublicOrigin —
        // correct in local dev and behind Vercel's proxy); (2) the AUTH_URL /
        // APP_URL env vars as a fallback; (3) a graceful error if neither exists.
        const stashedOrigin = extra.authInfo?.extra?.origin as string | undefined;
        const origin = stashedOrigin ?? process.env.AUTH_URL ?? process.env.APP_URL;
        if (!origin) {
          return toolError(
            'Cannot generate PDF: could not determine the app origin from the request, and ' +
              'neither AUTH_URL nor APP_URL is set in the environment. Set ' +
              'APP_URL=https://your-domain.com in your environment variables, or use the ' +
              'HTTP endpoint /api/admin/v1/quotes/' +
              args.id +
              '/pdf instead.',
          );
        }

        const token = extra.authInfo?.token;
        if (!token) {
          return toolError('Cannot generate PDF: bearer token is not available in authInfo.');
        }

        const pdf = await generateQuotePdf({
          origin: origin.replace(/\/$/, ''), // strip trailing slash if present
          token,
          id: args.id,
        });

        return {
          content: [
            {
              type: 'resource',
              resource: {
                uri: 'quote://' + quote.number + '.pdf',
                mimeType: 'application/pdf',
                blob: pdf.toString('base64'),
              },
            },
            {
              type: 'text',
              text: 'Generated PDF for ' + quote.number + ' (' + pdf.length + ' bytes).',
            },
          ],
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // ---- Client directory tools -------------------------------------------------
  //
  // Clients are an address-book directory — a reusable source of contact data.
  // When a quote is created from a directory client, the client fields are
  // COPIED into the quote snapshot (quote.client.*). Editing a directory entry
  // NEVER retroactively changes already-issued quotes; those quotes keep the
  // contact details that were current at creation time.

  // -- list_clients -------------------------------------------------------------
  server.registerTool(
    'list_clients',
    {
      title: 'List Clients',
      description:
        'List all directory clients you own, newest-updated first. Returns a concise summary for ' +
        'each entry: id, name, company, email, phone, and updatedAt. The directory is an ' +
        'address book — client fields are COPIED into a quote at creation time and are not ' +
        'updated retroactively when you edit a directory entry.',
      inputSchema: {},
    },
    async (_args, extra) => {
      try {
        const owner = ownerOf(extra);
        const clients = await listClients(owner);

        const rows = clients.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          updatedAt: c.updatedAt,
        }));

        const summary =
          clients.length === 0
            ? 'No clients found.'
            : `Found ${clients.length} client${clients.length === 1 ? '' : 's'}.`;

        return {
          content: [{ type: 'text', text: summary + '\n\n' + JSON.stringify(rows, null, 2) }],
          structuredContent: { clients: rows },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- get_client ---------------------------------------------------------------
  server.registerTool(
    'get_client',
    {
      title: 'Get Client',
      description:
        'Fetch one directory client by id. Returns all fields including notes, taxId, and address. ' +
        'Use list_clients first when you only know the client name.',
      inputSchema: {
        id: z.string().describe('The client id (UUID).'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const client = await getClient(owner, args.id);
        if (!client) {
          return toolError(`Client ${args.id} not found.`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(client, null, 2) }],
          structuredContent: { client },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- create_client ------------------------------------------------------------
  server.registerTool(
    'create_client',
    {
      title: 'Create Client',
      description:
        'Add a new contact to the directory. Only name is required; all other fields default to ' +
        'an empty string. The directory is an address book — creating a client here does NOT ' +
        'create a quote. To create a quote pre-filled with this client\'s details, call ' +
        'create_quote with clientId set to the new client\'s id.',
      inputSchema: zClientRecordInput.shape,
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const client = await createClient(owner, args);
        const summary = `Created client "${client.name}" (id: ${client.id}).`;
        return {
          content: [{ type: 'text', text: summary }],
          structuredContent: { client },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- update_client ------------------------------------------------------------
  server.registerTool(
    'update_client',
    {
      title: 'Update Client',
      description:
        'Update directory client fields (partial patch). Only the fields you include are changed; ' +
        'everything else stays as-is. Pass the client id plus any subset of fields. IMPORTANT: ' +
        'updating a directory entry NEVER modifies already-issued quotes — those quotes store a ' +
        'snapshot of the client\'s details at the time they were created.',
      inputSchema: {
        id: z.string().describe('The client id (UUID) to update.'),
        ...zClientRecordPatch.shape,
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        // Separate the routing id from the patch fields.
        const { id, ...patch } = args;
        const client = await updateClient(owner, id, patch);
        if (!client) {
          return toolError(`Client ${id} not found.`);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(client, null, 2) }],
          structuredContent: { client },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- delete_client ------------------------------------------------------------
  server.registerTool(
    'delete_client',
    {
      title: 'Delete Client',
      description:
        'Permanently remove a directory client by id. This cannot be undone. Any quotes that ' +
        'were linked to this client via clientId are NOT deleted — their clientId is set to null ' +
        'automatically, but the quote snapshot (client name, email, etc.) is preserved.',
      inputSchema: {
        id: z.string().describe('The client id (UUID) to delete.'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const client = await getClient(owner, args.id);
        if (!client) {
          return toolError(`Client ${args.id} not found.`);
        }
        await deleteClient(owner, args.id);
        return {
          content: [{ type: 'text', text: `Deleted client "${client.name}" (id: ${args.id}).` }],
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // -- list_client_quotes -------------------------------------------------------
  server.registerTool(
    'list_client_quotes',
    {
      title: 'List Client Quotes',
      description:
        'List all quotes explicitly linked to a directory client via the clientId field, newest ' +
        'first. Returns concise rows: id, number, status, total (computed from items + VAT), and ' +
        'updatedAt. NOTE: this query uses the clientId FK column, not the quote\'s client snapshot ' +
        '— a quote appears here only if it was created (or later updated) with clientId set to ' +
        'this directory entry. Ad-hoc quotes that share the same client name but have no clientId ' +
        'will NOT appear.',
      inputSchema: {
        id: z.string().describe('The directory client id (UUID) to look up quotes for.'),
      },
    },
    async (args, extra) => {
      try {
        const owner = ownerOf(extra);
        const docs = await listQuotesByClient(owner, args.id);

        const rows = docs.map((q) => ({
          id: q.id,
          number: q.number,
          status: q.status,
          total: computeTotals(q.items, q.vatRate).total,
          updatedAt: q.updatedAt,
        }));

        const summary =
          docs.length === 0
            ? `No quotes linked to client ${args.id}.`
            : `Found ${docs.length} quote${docs.length === 1 ? '' : 's'} linked to client ${args.id}.`;

        return {
          content: [{ type: 'text', text: summary + '\n\n' + JSON.stringify(rows, null, 2) }],
          structuredContent: { quotes: rows },
        };
      } catch (err) {
        return toolError(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
