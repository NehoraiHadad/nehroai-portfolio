// OpenAPI 3.1 document builder for the agent-facing v1 API. Kept in _lib so
// the route file stays thin. Call buildOpenApiDocument(origin) where origin is
// the request origin (e.g. https://nehoraihadad.com) — the server URL is
// derived from it so the spec is correct in every environment.

import zodToJsonSchema from 'zod-to-json-schema';
import {
  zClientInput,
  zLineItemInput,
  zCreateQuoteInput,
  zPatchQuoteInput,
  zBrandInput,
} from './schemas';

// Conversion options: openApi3 target, no $ref expansion (inline schemas only
// so the output is self-contained and easier for agents to consume).
const ZTJ_OPTIONS = { target: 'openApi3' as const, $refStrategy: 'none' as const };

function toSchema(schema: Parameters<typeof zodToJsonSchema>[0]): object {
  // Drop the JSON-Schema `$schema` meta key so the inlined component is clean.
  const out = zodToJsonSchema(schema, ZTJ_OPTIONS) as Record<string, unknown>;
  delete out.$schema;
  return out;
}

const bearerAuth = { bearerAuth: [] };

export function buildOpenApiDocument(origin: string): object {
  const base = `${origin}/api/admin/v1`;

  return {
    openapi: '3.1.0',
    info: {
      title: 'Nehorai Admin API',
      version: '1.0.0',
      description:
        'Agent-facing REST API for managing quotes and brand settings. ' +
        'Quote numbers are auto-allocated as NH-YYYY-NNNN. ' +
        'Currency is always ILS (₪). Default VAT rate is 18% (Israel standard). ' +
        'Authenticate with a bearer token issued from the admin UI.',
    },
    servers: [{ url: base }],
    security: [bearerAuth],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Token issued by the admin UI (/admin/settings/tokens).',
        },
      },
      schemas: {
        ClientInput: toSchema(zClientInput),
        LineItemInput: toSchema(zLineItemInput),
        CreateQuoteInput: toSchema(zCreateQuoteInput),
        PatchQuoteInput: toSchema(zPatchQuoteInput),
        BrandInput: toSchema(zBrandInput),
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'string', enum: ['unauthorized', 'not_found', 'validation_error', 'internal'] },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },

    paths: {
      '/quotes': {
        get: {
          operationId: 'listQuotes',
          summary: 'List quotes',
          security: [bearerAuth],
          parameters: [
            {
              name: 'format',
              in: 'query',
              schema: { type: 'string', enum: ['concise', 'detailed'], default: 'concise' },
              description: 'concise returns summary fields only; detailed returns full QuoteDoc objects.',
            },
          ],
          responses: {
            '200': { description: 'Array of quotes (concise or detailed depending on ?format).' },
            '401': { description: 'Missing or invalid bearer token.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          operationId: 'createQuote',
          summary: 'Create a quote',
          security: [bearerAuth],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateQuoteInput' } },
            },
          },
          responses: {
            '201': { description: 'The created QuoteDoc.' },
            '400': { description: 'Validation error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Missing or invalid bearer token.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/quotes/{id}': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Quote UUID.' },
        ],
        get: {
          operationId: 'getQuote',
          summary: 'Get a quote',
          security: [bearerAuth],
          responses: {
            '200': { description: 'The full QuoteDoc.' },
            '401': { description: 'Unauthorized.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'Quote not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        patch: {
          operationId: 'patchQuote',
          summary: 'Partially update a quote',
          security: [bearerAuth],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PatchQuoteInput' } },
            },
          },
          responses: {
            '200': { description: 'The updated QuoteDoc.' },
            '400': { description: 'Validation error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'Quote not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          operationId: 'deleteQuote',
          summary: 'Delete a quote',
          security: [bearerAuth],
          responses: {
            '200': { description: '{ ok: true }' },
            '401': { description: 'Unauthorized.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'Quote not found.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },

      '/quotes/{id}/pdf': {
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Quote UUID.' },
        ],
        get: {
          operationId: 'getQuotePdf',
          summary: 'Download the quote as a PDF',
          security: [bearerAuth],
          responses: {
            '200': {
              description: 'PDF binary.',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
            },
            '401': { description: 'Unauthorized.' },
            '404': { description: 'Quote not found.' },
          },
        },
      },

      '/skill': {
        get: {
          operationId: 'getSkill',
          summary: 'Fetch the nehroai-admin skill (Markdown) for agent self-install',
          security: [],
          parameters: [
            {
              name: 'format',
              in: 'query',
              required: false,
              schema: { type: 'string', enum: ['json'] },
              description: 'Omit for raw Markdown (text/markdown). Pass format=json for { name, description, markdown } envelope.',
            },
          ],
          responses: {
            '200': {
              description: 'The nehroai-admin skill guide.',
              content: {
                'text/markdown': { schema: { type: 'string' } },
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'description', 'markdown'],
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      markdown: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/brand': {
        get: {
          operationId: 'getBrand',
          summary: 'Get the brand profile',
          security: [bearerAuth],
          parameters: [
            {
              name: 'language',
              in: 'query',
              schema: { type: 'string', enum: ['he', 'en'], default: 'en' },
              description: 'Language variant for localised default values.',
            },
          ],
          responses: {
            '200': { description: 'The current BrandProfile.' },
            '401': { description: 'Unauthorized.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          operationId: 'updateBrand',
          summary: 'Update the brand profile (field-level merge)',
          security: [bearerAuth],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/BrandInput' } },
            },
          },
          responses: {
            '200': { description: 'The merged BrandProfile.' },
            '400': { description: 'Validation error.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  };
}
