// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');

// Create Express app directly
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message:
      '🏟️ Bienvenido a Kopp Stadium CRM API - Sistema de gestión integral de leads deportivos',
    api: {
      name: 'Kopp Stadium CRM',
      version: '1.0.0',
      description:
        'Sistema avanzado de CRM para gestión de leads en el sector deportivo',
    },
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      webhooks: {
        slack: '/webhooks/slack',
        hubspot: '/webhooks/hubspot',
        zapier: '/webhooks/zapier',
      },
    },
    status: 'operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Basic webhook endpoints (simplified for deployment)
app.post('/webhooks/slack', (req, res) => {
  console.log('Slack webhook received:', req.body);
  res.status(200).json({ success: true, message: 'Slack webhook processed' });
});

app.post('/webhooks/hubspot', (req, res) => {
  console.log('HubSpot webhook received:', req.body);
  res.status(200).json({ success: true, message: 'HubSpot webhook processed' });
});

app.post('/webhooks/zapier', (req, res) => {
  console.log('Zapier webhook received:', req.body);
  res.status(200).json({ success: true, message: 'Zapier webhook processed' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      '/',
      '/health',
      '/webhooks/slack',
      '/webhooks/hubspot',
      '/webhooks/zapier',
    ],
  });
});

// Export for Vercel
module.exports = app;
