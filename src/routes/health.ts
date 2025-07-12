import express from 'express';
import { healthCheck, readinessCheck } from '../controllers/healthController';

const router: express.Router = express.Router();

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
 *       - ⚡ Conectividad con Zapier
 *       - 📝 Conectividad con Notion
 *       - ⚡ Tiempo de respuesta y métricas
 *
 *       **Códigos de estado:**
 *       - `200`: Todos los servicios funcionando correctamente
 *       - `206`: Algunos servicios degradados pero funcional
 *       - `503`: Servicios críticos no disponibles
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *       206:
 *         description: Sistema funcionando con servicios degradados
 *       503:
 *         description: Sistema no saludable
 */
router.get('/health', healthCheck);

/**
 * @swagger
 * /ready:
 *   get:
 *     tags: [Health]
 *     summary: Verificación de disponibilidad
 *     description: |
 *       Endpoint simple para verificar si la aplicación está lista para recibir tráfico.
 *       Usado típicamente por load balancers y orquestadores.
 *     responses:
 *       200:
 *         description: Aplicación lista para recibir tráfico
 */
router.get('/ready', readinessCheck);

// Alias para compatibilidad
router.get('/health/ready', readinessCheck);

export default router;
