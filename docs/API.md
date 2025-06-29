# Kopp CRM Automation - API Documentation

## Descripción

Sistema de automatización CRM para Kopp Stadium que integra Slack, HubSpot, Firebase y reemplaza gradualmente Zapier.

## Arquitectura

### Componentes Principales

- **Slack Integration**: Automatización de notificaciones y webhooks
- **HubSpot CRM**: Sincronización de datos de clientes y leads
- **Firebase**: Base de datos en tiempo real y autenticación
- **Zapier Migration**: Migración gradual de workflows existentes

### Estructura de Directorios

```
kopp-crm-automation/
├── src/           # Código fuente principal
├── config/        # Archivos de configuración
├── scripts/       # Scripts de automatización
├── workflows/     # GitHub Actions
├── docs/          # Documentación
└── logs/          # Archivos de log
```

## Endpoints de API

### Health Check

```http
GET /health
```

Verifica el estado del sistema.

### Slack Webhooks

```http
POST /webhook/slack
```

Recibe webhooks de Slack para procesamiento.

### HubSpot Integration

```http
GET /api/hubspot/contacts
POST /api/hubspot/contacts
PUT /api/hubspot/contacts/:id
```

### Automatización

```http
POST /api/automation/sync
GET /api/automation/status
```

## Configuración

### Variables de Entorno

Ver `.env.example` para la lista completa de variables requeridas.

### Configuración de Desarrollo

```bash
npm run setup:env
npm run dev
```

### Configuración de Producción

```bash
npm run build
npm run deploy
```

## Testing

### Ejecutar Tests

```bash
npm test           # Tests únicos
npm run test:watch # Tests en modo watch
npm run test:coverage # Coverage report
```

### Linting

```bash
npm run lint       # Lint y fix automático
npm run lint:check # Solo verificación
```

## Deployment

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run deploy
```

El deployment se realiza automáticamente a Vercel cuando se hace push a la rama `main`.

## Monitoreo

### Logs

Los logs se almacenan en `./logs/` y rotan diariamente en producción.

### Health Checks

Endpoint disponible en `/health` para monitoreo de estado.

### Métricas

- Integración con Vercel Analytics
- Notificaciones a Slack en caso de errores
- Monitoreo de rendimiento en tiempo real
