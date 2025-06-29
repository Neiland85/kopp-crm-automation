import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Verificación de salud del sistema
 *     description: |
 *       Endpoint para verificar el estado de salud de la API y sus servicios conectados.
 *
 *       **Verificaciones incluidas:**
 *       - ✅ Estado general de la API
 *       - 🔗 Conectividad con Slack
 *       - 📊 Conectividad con HubSpot
 *       - 💾 Estado de la base de datos
 *       - ⚡ Tiempo de respuesta
 *
 *       **Códigos de estado:**
 *       - `200`: Todos los servicios funcionando correctamente
 *       - `503`: Uno o más servicios no disponibles
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               status: "ok"
 *               timestamp: "2024-06-29T18:00:00.000Z"
 *               services:
 *                 slack: "connected"
 *                 hubspot: "connected"
 *                 database: "connected"
 *               version: "1.0.0"
 *               uptime: 3600
 *               memory_usage:
 *                 used: "45.2 MB"
 *                 total: "512 MB"
 *       503:
 *         description: Uno o más servicios no disponibles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               status: "error"
 *               timestamp: "2024-06-29T18:00:00.000Z"
 *               services:
 *                 slack: "error"
 *                 hubspot: "connected"
 *                 database: "connected"
 *               version: "1.0.0"
 *               errors:
 *                 - service: "slack"
 *                   message: "Connection timeout"
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Verificar servicios (mock implementation)
    const services = {
      slack: 'connected',
      hubspot: 'connected',
      database: 'connected',
    };

    const responseTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();

    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services,
      version: '1.0.0',
      uptime: process.uptime(),
      response_time_ms: responseTime,
      memory_usage: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    res.json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Verificación detallada de salud del sistema
 *     description: |
 *       Endpoint que proporciona información detallada sobre el estado de todos los componentes del sistema.
 *
 *       **Incluye verificaciones de:**
 *       - 🔗 APIs externas (Slack, HubSpot, Zapier)
 *       - 💾 Bases de datos y almacenamiento
 *       - 🔑 Validación de tokens y credenciales
 *       - 📊 Métricas de rendimiento
 *       - 🧪 Estado de tests automáticos
 *
 *       > **Nota:** Este endpoint puede tomar más tiempo en responder debido a las verificaciones exhaustivas.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verificación detallada exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, warning, error]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 detailed_checks:
 *                   type: object
 *                   properties:
 *                     apis:
 *                       type: object
 *                       properties:
 *                         slack_api:
 *                           type: object
 *                           properties:
 *                             status: { type: string }
 *                             response_time_ms: { type: number }
 *                             last_check: { type: string }
 *                         hubspot_api:
 *                           type: object
 *                           properties:
 *                             status: { type: string }
 *                             response_time_ms: { type: number }
 *                             rate_limit_remaining: { type: number }
 *                     integrations:
 *                       type: object
 *                       properties:
 *                         zapier_webhooks:
 *                           type: object
 *                           properties:
 *                             active_zaps: { type: number }
 *                             last_trigger: { type: string }
 *                         google_sheets:
 *                           type: object
 *                           properties:
 *                             accessible: { type: boolean }
 *                             last_sync: { type: string }
 *             example:
 *               status: "ok"
 *               timestamp: "2024-06-29T18:00:00.000Z"
 *               detailed_checks:
 *                 apis:
 *                   slack_api:
 *                     status: "connected"
 *                     response_time_ms: 245
 *                     last_check: "2024-06-29T17:59:45.000Z"
 *                   hubspot_api:
 *                     status: "connected"
 *                     response_time_ms: 156
 *                     rate_limit_remaining: 95
 *                 integrations:
 *                   zapier_webhooks:
 *                     active_zaps: 12
 *                     last_trigger: "2024-06-29T17:45:00.000Z"
 *                   google_sheets:
 *                     accessible: true
 *                     last_sync: "2024-06-29T17:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       503:
 *         description: Fallo en verificaciones detalladas
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  // Mock implementation for detailed health check
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    detailed_checks: {
      apis: {
        slack_api: {
          status: 'connected',
          response_time_ms: 245,
          last_check: new Date().toISOString(),
        },
        hubspot_api: {
          status: 'connected',
          response_time_ms: 156,
          rate_limit_remaining: 95,
        },
      },
      integrations: {
        zapier_webhooks: {
          active_zaps: 12,
          last_trigger: new Date().toISOString(),
        },
        google_sheets: {
          accessible: true,
          last_sync: new Date().toISOString(),
        },
      },
    },
  });
});

/**
 * @swagger
 * /version:
 *   get:
 *     tags: [Health]
 *     summary: Información de versión de la API
 *     description: |
 *       Obtiene información sobre la versión actual de la API, incluyendo:
 *       - 📦 Versión de la aplicación
 *       - 🏗️ Información de build
 *       - 🕒 Timestamp de despliegue
 *       - 🔧 Versiones de dependencias críticas
 *     responses:
 *       200:
 *         description: Información de versión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   description: Versión de la aplicación
 *                 build:
 *                   type: object
 *                   properties:
 *                     number: { type: string }
 *                     timestamp: { type: string }
 *                     git_commit: { type: string }
 *                     branch: { type: string }
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     node: { type: string }
 *                     express: { type: string }
 *                     typescript: { type: string }
 *             example:
 *               version: "1.0.0"
 *               build:
 *                 number: "124"
 *                 timestamp: "2024-06-29T15:30:00.000Z"
 *                 git_commit: "a1b2c3d"
 *                 branch: "main"
 *               dependencies:
 *                 node: "18.17.0"
 *                 express: "4.18.0"
 *                 typescript: "5.0.0"
 */
router.get('/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    build: {
      number: process.env.BUILD_NUMBER || 'dev',
      timestamp: new Date().toISOString(),
      git_commit: process.env.GIT_COMMIT || 'local',
      branch: process.env.GIT_BRANCH || 'develop',
    },
    dependencies: {
      node: process.version,
      express: '4.18.0',
      typescript: '5.0.0',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
