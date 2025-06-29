# 📚 Documentación API Swagger - Kopp Stadium CRM

## 🎯 Documentación Oficial de la API

La API de Kopp Stadium CRM cuenta con documentación completa y oficial usando **Swagger/OpenAPI 3.0**, proporcionando una interfaz interactiva y exportable para todos los endpoints.

## 🚀 Acceso a la Documentación

### 🌐 URLs de Documentación

| Formato          | URL              | Descripción                              |
| ---------------- | ---------------- | ---------------------------------------- |
| **Swagger UI**   | `/api-docs`      | Interfaz interactiva con pruebas en vivo |
| **OpenAPI JSON** | `/api-docs.json` | Especificación en formato JSON           |
| **OpenAPI YAML** | `/api-docs.yaml` | Especificación en formato YAML           |

### 📍 Servidores Disponibles

- **🏠 Local**: `http://localhost:3000`
- **🚀 Producción**: `https://kopp-crm-automation.vercel.app`
- **🧪 Staging**: `https://staging-kopp-crm.vercel.app`

## 📖 Endpoints Documentados

### ✅ Health & System

- `GET /health` - Verificación básica de salud
- `GET /health/detailed` - Health check completo con métricas
- `GET /version` - Información de versión y build

### 📢 Slack Integration

- `POST /slack/notify` - Enviar notificaciones a Slack
- `GET /slack/channels` - Listar canales disponibles
- `POST /slack/webhook` - Webhook para eventos de Slack

### 📊 HubSpot CRM

- `POST /hubspot/contacts` - Crear nuevo contacto con scoring automático
- `PUT /hubspot/contacts/{id}/score` - Actualizar score de lead
- `GET /hubspot/contacts/{id}` - Obtener información de contacto

### ⚡ Zapier Automation

- `POST /zapier/webhook/lead-scoring` - Webhook para scoring desde Google Sheets
- `POST /zapier/webhook/form-submission` - Webhook para formularios web
- `GET /zapier/status` - Estado de integraciones Zapier

## 🔒 Autenticación y Seguridad

### 🔑 Esquemas de Autenticación

| Esquema          | Tipo   | Header/Campo                     | Uso               |
| ---------------- | ------ | -------------------------------- | ----------------- |
| **Bearer Auth**  | JWT    | `Authorization: Bearer <token>`  | APIs principales  |
| **API Key**      | Header | `X-API-Key: <key>`               | Webhooks externos |
| **Slack Auth**   | Header | `X-Slack-Signature: <signature>` | Webhooks Slack    |
| **HubSpot Auth** | Header | `Authorization: Bearer <token>`  | API HubSpot       |

### 🛡️ Validaciones Implementadas

- ✅ **Validación de tokens** en pre-commit hooks
- 🔐 **Variables de entorno** protegidas
- ⏱️ **Rate limiting** en endpoints críticos
- 🧹 **Sanitización** de inputs
- 🚫 **Prevención de ataques** comunes

## 🎨 Características de la Documentación

### 📋 Información Completa

- **Descripción detallada** de cada endpoint
- **Ejemplos de request/response** reales
- **Códigos de error** con explicaciones
- **Esquemas de datos** validados
- **Casos de uso** prácticos

### 🧪 Testing Interactivo

- **Pruebas en vivo** desde Swagger UI
- **Autenticación persistente** en la interfaz
- **Ejemplos pre-configurados** para cada endpoint
- **Validación automática** de requests

### 📤 Exportación

- **JSON**: Para integración con otras herramientas
- **YAML**: Para documentación y versionado
- **Postman**: Importación directa disponible

## 🏗️ Arquitectura de la Documentación

### 📁 Estructura del Código

```
src/
├── config/
│   └── swagger.ts          # Configuración principal de Swagger
├── routes/
│   ├── health.ts          # Health endpoints con JSDoc
│   ├── slack.ts           # Slack endpoints con JSDoc
│   ├── hubspot.ts         # HubSpot endpoints con JSDoc
│   └── zapier.ts          # Zapier endpoints con JSDoc
└── app.ts                 # Integración de Swagger en Express
```

### 🔧 Configuración Técnica

```typescript
// Swagger JSDoc automático desde comentarios
apis: [
  './src/routes/*.ts', // Rutas principales
  './src/controllers/*.ts', // Controladores
  './src/webhooks/*.ts', // Webhooks
  './src/api/*.ts', // APIs adicionales
];
```

## 📊 Schemas y Modelos

### 🏷️ Componentes Reutilizables

| Schema           | Descripción                 | Uso                   |
| ---------------- | --------------------------- | --------------------- |
| `Error`          | Respuesta de error estándar | Todos los endpoints   |
| `HealthCheck`    | Estado de salud del sistema | Health endpoints      |
| `SlackMessage`   | Mensaje de Slack            | Slack notifications   |
| `HubSpotContact` | Contacto de HubSpot         | CRM operations        |
| `LeadScoring`    | Scoring de leads            | Lead management       |
| `WebhookPayload` | Payload de webhooks         | External integrations |

### 📝 Responses Estándar

- `200` - **Success**: Operación exitosa
- `400` - **Bad Request**: Datos inválidos
- `401` - **Unauthorized**: Token inválido
- `403` - **Forbidden**: Sin permisos
- `404` - **Not Found**: Recurso no encontrado
- `429` - **Too Many Requests**: Rate limit excedido
- `500` - **Internal Error**: Error del servidor

## 🧪 Testing y Validación

### ✅ Pruebas Automatizadas

```bash
# Probar endpoints de documentación
node test-swagger.js

# Verificar que Swagger esté funcionando
npm run dev
curl http://localhost:3000/api-docs.json
```

### 🔍 Validación Continua

- **Pre-commit hooks** verifican JSDoc
- **CI/CD** valida especificación OpenAPI
- **Tests unitarios** para endpoints documentados
- **Coverage** incluye documentación

## 🚀 Despliegue y Mantenimiento

### 📦 Build Process

```bash
# Compilar TypeScript con JSDoc
npm run build

# El build incluye automáticamente la documentación
# Los endpoints /api-docs* están disponibles en producción
```

### 🔄 Actualizaciones

1. **Modificar JSDoc** en archivos de rutas
2. **Ejecutar tests** para validar cambios
3. **Build y deploy** automático
4. **Documentación actualizada** inmediatamente

## 🎉 FASE 1 COMPLETADA

### ✅ Objetivos Logrados

- 📚 **Documentación oficial** con Swagger/OpenAPI 3.0
- 🆓 **Gratuita y self-hosted** en Vercel
- 🔍 **Interfaz interactiva** para testing
- 📤 **Exportable** en JSON/YAML
- 🔒 **Autenticación documentada** completamente
- 🧪 **Testing integrado** en la documentación
- ⚡ **Ultra cost-optimized** sin costos adicionales

### 🎯 Características Premium

- **🎨 UI personalizada** con branding Kopp Stadium
- **📊 Métricas en tiempo real** de uso de API
- **🔔 Notificaciones automáticas** de cambios
- **📋 Ejemplos contextual** por caso de uso
- **🚀 Performance optimizado** para cargas altas

## 🔗 Enlaces Útiles

- [🏠 API Principal](/)
- [📚 Swagger UI](/api-docs)
- [📄 OpenAPI JSON](/api-docs.json)
- [📝 OpenAPI YAML](/api-docs.yaml)
- [✅ Health Check](/health)
- [📊 Health Detallado](/health/detailed)

---

**🏟️ Kopp Stadium CRM API - Documentación Oficial**
_Automatización estratégica con documentación de nivel enterprise_
