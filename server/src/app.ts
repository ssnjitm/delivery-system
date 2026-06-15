import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiDocument } from './utils/swagger.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';


// docker compose -f docker-compose.dev.yml up
// docker compose -f docker-compose.uat.yml up


//=================
// Route imports MUST come before buildOpenApiDocument().
// Each routes.ts self-registers its schemas into the OpenAPI
// registry as a side effect of being imported.
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';

const app: Application = express();

// ─────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,   // required for Swagger UI inline assets
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
// Build the spec AFTER all route imports so every
// module's schemas are already registered.
const openApiDocument = buildOpenApiDocument();

// Raw JSON spec — must be registered BEFORE swaggerUi.serve
// otherwise the /api-docs router swallows /api-docs/json
app.get('/api-docs/json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openApiDocument);
});

app.use('/api-docs', swaggerUi.serve);
app.get(
  '/api-docs',
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'Delivery System API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  }),
);


// Core Route Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);


// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Centralised Error Handler
app.use(errorHandler);

export default app;
