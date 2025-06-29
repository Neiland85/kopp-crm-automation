/**
 * App configuration for testing - No external connections
 */

import express, { Request, Response } from 'express';

// Crear la app de testing sin inicializar servicios externos
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    uptime: process.uptime(),
  });
});

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
