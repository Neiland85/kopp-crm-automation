import express, { Express } from 'express';
import cors from 'cors';
import { setupSwagger } from './config/swagger';
import healthRoutes from './routes/health';
import slackRoutes from './routes/slack';
import hubspotRoutes from './routes/hubspot';
import zapierRoutes from './routes/zapier';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simple
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Endpoint raíz de la API
 *     description: |
 *       Endpoint de bienvenida que proporciona información básica sobre la API de Kopp Stadium CRM.
 *
 *       **Información incluida:**
 *       - 🎯 Nombre y versión de la API
 *       - 📚 Enlaces a documentación
 *       - 🔗 Endpoints disponibles
 *       - 📊 Estado general del sistema
 *       - 🚀 Información de despliegue
 *     responses:
 *       200:
 *         description: Información de bienvenida de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de bienvenida
 *                 api:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     version: { type: string }
 *                     description: { type: string }
 *                 documentation:
 *                   type: object
 *                   properties:
 *                     swagger_ui: { type: string }
 *                     openapi_json: { type: string }
 *                     openapi_yaml: { type: string }
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health: { type: array, items: { type: string } }
 *                     slack: { type: array, items: { type: string } }
 *                     hubspot: { type: array, items: { type: string } }
 *                     zapier: { type: array, items: { type: string } }
 *                 integrations:
 *                   type: object
 *                   properties:
 *                     slack: { type: string }
 *                     hubspot: { type: string }
 *                     zapier: { type: string }
 *                     google_sheets: { type: string }
 *                 features:
 *                   type: array
 *                   items: { type: string }
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               message: "🏟️ Bienvenido a Kopp Stadium CRM API"
 *               api:
 *                 name: "Kopp Stadium CRM API"
 *                 version: "1.0.0"
 *                 description: "Automatización estratégica de CRM con integración completa"
 *               documentation:
 *                 swagger_ui: "/api-docs"
 *                 openapi_json: "/api-docs.json"
 *                 openapi_yaml: "/api-docs.yaml"
 *               endpoints:
 *                 health: ["/health", "/health/detailed", "/version"]
 *                 slack: ["/slack/notify", "/slack/channels", "/slack/webhook"]
 *                 hubspot: ["/hubspot/contacts", "/hubspot/contacts/{id}/score"]
 *                 zapier: ["/zapier/webhook/lead-scoring", "/zapier/webhook/form-submission", "/zapier/status"]
 *               integrations:
 *                 slack: "Notificaciones y alertas en tiempo real"
 *                 hubspot: "Gestión de leads y contactos CRM"
 *                 zapier: "Automatización de workflows"
 *                 google_sheets: "Lead scoring y análisis"
 *               features:
 *                 - "🔒 Seguridad implementada con validación de tokens"
 *                 - "⚡ Ultra cost-optimized CI/CD"
 *                 - "📊 Lead scoring automático"
 *                 - "🔔 Notificaciones inteligentes"
 *                 - "🧪 Testing completo y coverage"
 *                 - "📋 ADRs implementados"
 *                 - "🎯 Rate limiting y validaciones"
 *               timestamp: "2024-06-29T18:00:00.000Z"
 */
app.get('/', (req, res) => {
  res.json({
    message: '🏟️ Bienvenido a Kopp Stadium CRM API',
    api: {
      name: 'Kopp Stadium CRM API',
      version: '1.0.0',
      description: 'Automatización estratégica de CRM con integración completa',
    },
    documentation: {
      swagger_ui: '/api-docs',
      openapi_json: '/api-docs.json',
      openapi_yaml: '/api-docs.yaml',
    },
    endpoints: {
      health: ['/health', '/health/detailed', '/version'],
      slack: ['/slack/notify', '/slack/channels', '/slack/webhook'],
      hubspot: ['/hubspot/contacts', '/hubspot/contacts/{id}/score'],
      zapier: [
        '/zapier/webhook/lead-scoring',
        '/zapier/webhook/form-submission',
        '/zapier/status',
      ],
    },
    integrations: {
      slack: 'Notificaciones y alertas en tiempo real',
      hubspot: 'Gestión de leads y contactos CRM',
      zapier: 'Automatización de workflows',
      google_sheets: 'Lead scoring y análisis',
    },
    features: [
      '🔒 Seguridad implementada con validación de tokens',
      '⚡ Ultra cost-optimized CI/CD',
      '📊 Lead scoring automático',
      '🔔 Notificaciones inteligentes',
      '🧪 Testing completo y coverage',
      '📋 ADRs implementados',
      '🎯 Rate limiting y validaciones',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Configurar rutas
app.use('/', healthRoutes);
app.use('/slack', slackRoutes);
app.use('/hubspot', hubspotRoutes);
app.use('/zapier', zapierRoutes);

// Configurar Swagger
setupSwagger(app);

// Middleware de manejo de errores
// eslint-disable-next-line no-unused-vars
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line no-unused-vars
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
    });
  }
);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'ENDPOINT_NOT_FOUND',
    message: `Endpoint ${req.method} ${req.originalUrl} no encontrado`,
    available_endpoints: {
      documentation: '/api-docs',
      health: '/health',
      slack: '/slack/*',
      hubspot: '/hubspot/*',
      zapier: '/zapier/*',
    },
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor solo si no estamos en entorno de testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('🚀 Kopp Stadium CRM API iniciada exitosamente!');
    console.log(`📍 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('🎯 Endpoints principales:');
    console.log('   - GET  /health - Verificación de salud');
    console.log('   - POST /slack/notify - Notificaciones Slack');
    console.log('   - POST /hubspot/contacts - Crear contactos');
    console.log('   - POST /zapier/webhook/lead-scoring - Webhook scoring');
    console.log(
      '   - POST /zapier/webhook/form-submission - Webhook formularios'
    );
    console.log('');
    console.log('🔗 Integraciones activas:');
    console.log('   - 📢 Slack API');
    console.log('   - 📊 HubSpot CRM');
    console.log('   - ⚡ Zapier Webhooks');
    console.log('   - 📈 Google Sheets');
    console.log('');
    console.log('✨ ¡API lista para automatizar Kopp Stadium CRM!');
  });
}

export default app;
