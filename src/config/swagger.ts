import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Configuración básica de Swagger
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kopp Stadium CRM API',
      version: '1.0.0',
      description: `
# 🏟️ Kopp Stadium CRM API Documentation

Automatización estratégica de CRM para Kopp Stadium con integración completa de:
- 🔗 **Slack** - Notificaciones y alertas
- 📊 **HubSpot** - Gestión de leads y contactos  
- ⚡ **Zapier** - Automatización de workflows
- 📈 **Google Sheets** - Scoring y análisis de leads
- 📝 **Notion** - Documentación y seguimiento

## 🎯 Características Principales

### ⚡ Ultra Cost-Optimized
- CI/CD minimal solo en rama main
- Validación local prioritaria
- Timeouts reducidos (4-6 min)
- Sin builds matrix innecesarios

### 🔒 Seguridad Implementada
- Validación de tokens en pre-commit hooks
- Variables de entorno protegidas
- Rate limiting en endpoints críticos
- Sanitización de inputs

### 🧪 Testing Completo
- Tests unitarios e integración
- Coverage tracking
- Mocks optimizados para desarrollo
- Validación automática pre-commit

### 📋 ADRs Implementados
- **ADR-ZAP-01**: Zapier CLI conventions
- **ADR-HUB-05**: HubSpot DevTools integration
- **ADR-003**: Copilot configuration

## 🚀 Stack Tecnológico

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions (ultra-minimal)
- **Deployment**: Vercel
- **Documentation**: Swagger/OpenAPI 3.0

## 📚 Enlaces Útiles

- [Guía de Integración Completa](/docs/INTEGRATIONS_COMPLETE_GUIDE.md)
- [Estrategia de Optimización de Costos](/docs/COST_OPTIMIZATION_STRATEGY.md)
- [Documentación de Setup](/FASE_1_COMPLETADA.md)
      `,
      termsOfService: 'https://kopp-stadium.com/terms',
      contact: {
        name: 'Kopp Stadium Development Team',
        email: 'dev@kopp-stadium.com',
        url: 'https://kopp-stadium.com/contact',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo Local',
      },
      {
        url: 'https://kopp-crm-automation.vercel.app',
        description: 'Servidor de Producción (Vercel)',
      },
      {
        url: 'https://staging-kopp-crm.vercel.app',
        description: 'Servidor de Staging',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Endpoints de verificación de salud del sistema',
      },
      {
        name: 'Slack',
        description: 'Integración con Slack API - Notificaciones y alertas',
      },
      {
        name: 'HubSpot',
        description:
          'Integración con HubSpot CRM - Gestión de leads y contactos',
      },
      {
        name: 'Zapier',
        description:
          'Webhooks y triggers de Zapier - Automatización de workflows',
      },
      {
        name: 'Google Sheets',
        description: 'Integración con Google Sheets - Lead scoring y análisis',
      },
      {
        name: 'Webhooks',
        description: 'Endpoints para recibir webhooks externos',
      },
      {
        name: 'Analytics',
        description: 'Endpoints de métricas y análisis de rendimiento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
        slackAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Slack-Signature',
        },
        hubspotAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              description: 'Código de error',
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo del error',
            },
            details: {
              type: 'object',
              description: 'Detalles adicionales del error',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del error',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'error'],
              description: 'Estado general del sistema',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp de la verificación',
            },
            services: {
              type: 'object',
              properties: {
                slack: {
                  type: 'string',
                  enum: ['connected', 'disconnected', 'error'],
                },
                hubspot: {
                  type: 'string',
                  enum: ['connected', 'disconnected', 'error'],
                },
                database: {
                  type: 'string',
                  enum: ['connected', 'disconnected', 'error'],
                },
              },
            },
            version: {
              type: 'string',
              description: 'Versión de la API',
            },
          },
        },
        SlackMessage: {
          type: 'object',
          required: ['channel', 'text'],
          properties: {
            channel: {
              type: 'string',
              description: 'Canal de Slack destino',
              example: '#general',
            },
            text: {
              type: 'string',
              description: 'Texto del mensaje',
              example: 'Nuevo lead generado desde HubSpot',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Prioridad del mensaje',
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Attachments del mensaje',
            },
          },
        },
        HubSpotContact: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del contacto',
              example: 'juan.perez@example.com',
            },
            firstname: {
              type: 'string',
              description: 'Nombre del contacto',
              example: 'Juan',
            },
            lastname: {
              type: 'string',
              description: 'Apellido del contacto',
              example: 'Pérez',
            },
            phone: {
              type: 'string',
              description: 'Teléfono del contacto',
              example: '+34 600 123 456',
            },
            company: {
              type: 'string',
              description: 'Empresa del contacto',
              example: 'Acme Corp',
            },
            lead_score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Score del lead (0-100)',
              example: 85,
            },
            source: {
              type: 'string',
              description: 'Fuente del lead',
              example: 'Website Form',
            },
          },
        },
        LeadScoring: {
          type: 'object',
          properties: {
            contact_id: {
              type: 'string',
              description: 'ID del contacto en HubSpot',
            },
            score: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Score calculado del lead',
            },
            factors: {
              type: 'object',
              properties: {
                demographic: {
                  type: 'integer',
                  description: 'Puntuación demográfica',
                },
                behavioral: {
                  type: 'integer',
                  description: 'Puntuación comportamental',
                },
                engagement: {
                  type: 'integer',
                  description: 'Puntuación de engagement',
                },
              },
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Última actualización del score',
            },
          },
        },
        WebhookPayload: {
          type: 'object',
          properties: {
            event_type: {
              type: 'string',
              description: 'Tipo de evento del webhook',
            },
            data: {
              type: 'object',
              description: 'Datos del evento',
            },
            source: {
              type: 'string',
              enum: ['hubspot', 'slack', 'zapier', 'google_sheets'],
              description: 'Fuente del webhook',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp del evento',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Solicitud inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'No autorizado - Token inválido o faltante',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Forbidden: {
          description: 'Prohibido - Sin permisos suficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        TooManyRequests: {
          description: 'Demasiadas solicitudes - Rate limit excedido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/webhooks/*.ts',
    './src/api/*.ts',
    './src/index.ts',
  ],
};

// Generar especificación de Swagger
const specs = swaggerJsdoc(swaggerOptions);

// Configuración de Swagger UI
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1f2937; font-size: 2rem; }
    .swagger-ui .info .description { font-size: 1rem; line-height: 1.6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 1rem; border-radius: 8px; }
  `,
  customSiteTitle: 'Kopp Stadium CRM API Docs',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};

// Función para configurar Swagger en la app
export const setupSwagger = (app: Express): void => {
  // Endpoint para servir la documentación
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerUiOptions)
  );

  // Endpoint para obtener el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Endpoint para obtener YAML de la especificación
  app.get('/api-docs.yaml', (req, res) => {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.send(require('yaml').stringify(specs));
  });

  console.log('📚 Swagger documentation available at:');
  console.log('   - UI: http://localhost:3000/api-docs');
  console.log('   - JSON: http://localhost:3000/api-docs.json');
  console.log('   - YAML: http://localhost:3000/api-docs.yaml');
};

export { specs as swaggerSpecs };
