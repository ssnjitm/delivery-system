import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Central OpenAPI Registry
 *
 * All modules register their schemas and routes here.
 * Import this registry in each module's docs.ts file to register
 * schemas and paths, then the generator picks everything up at startup.
 */
export const registry = new OpenAPIRegistry();

/**
 * Generates the full OpenAPI 3.0 document from all registered schemas/routes.
 * Called once at server startup and cached.
 */
export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Delivery System API',
      version: '1.0.0',
      description:
        'REST API for the Delivery System platform — covers authentication, orders, vendors, drivers, and customers.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current version',
      },
    ],
  });
}
