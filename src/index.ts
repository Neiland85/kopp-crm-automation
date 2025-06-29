import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { KoppCrmAutomation } from './core/KoppCrmAutomation';
import { Logger } from './utils/Logger';
import { ConfigManager } from './config/ConfigManager';
import { IntegrationService } from './integrations/IntegrationService';

// Cargar variables de entorno
dotenv.config();

const app = express();
const logger = new Logger('Main');
const config = new ConfigManager();
const integrationService = new IntegrationService(config);

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Configurar rutas de webhooks para integraciones
integrationService.setupWebhookRoutes(app);

// Endpoint para testing de integraciones
app.get('/api/integrations/test', async (req: Request, res: Response) => {
  try {
    await integrationService.testIntegrations();
    res.json({ 
      success: true, 
      message: 'Tests de integración ejecutados correctamente' 
    });
  } catch (error) {
    logger.error('Error en tests de integración:', error);
    res.status(500).json({ 
      error: 'Error en tests de integración' 
    });
  }
});

// Función para encontrar un puerto disponible
async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = app.listen(startPort, () => {
      const port = (server.address() as any)?.port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

// Inicializar sistema CRM
async function startApplication() {
  try {
    logger.info('🏟️ Iniciando Kopp CRM Automation...');
    
    const crmSystem = new KoppCrmAutomation(config);
    await crmSystem.initialize();
    
    // Inicializar servicios de integración
    await integrationService.initialize();
    
    const preferredPort = parseInt(process.env.PORT || '3000');
    const port = await findAvailablePort(preferredPort);
    
    const server = app.listen(port, () => {
      logger.info(`🚀 Servidor ejecutándose en puerto ${port}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${port}/health`);
      logger.info(`🔌 Webhooks activos:`);
      logger.info(`   📥 Zapier: http://localhost:${port}/webhooks/zapier`);
      logger.info(`   💬 Slack: http://localhost:${port}/webhooks/slack`);
      logger.info(`   📊 Hubspot: http://localhost:${port}/webhooks/hubspot`);
      logger.info(`   🧪 Test: http://localhost:${port}/api/integrations/test`);
    });

    // Manejo de errores del servidor
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${port} ya está en uso`);
      } else {
        logger.error('❌ Error del servidor:', error);
      }
      process.exit(1);
    });

    // Manejo graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('❌ Error iniciando aplicación:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar aplicación solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startApplication();
}

export default app;
