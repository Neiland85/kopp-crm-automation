/**
 * App configuration for testing - No external connections
 */

import express, { Request, Response } from 'express';
import { healthCheck, readinessCheck } from './controllers/healthController';

// Crear la app de testing sin inicializar servicios externos
const app: express.Application = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints using the actual controller
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);

// Mock integrations endpoint para testing
app.get('/api/integrations/test', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Test integrations endpoint working',
    timestamp: new Date().toISOString(),
    environment: 'test',
  });
});

export default app;
