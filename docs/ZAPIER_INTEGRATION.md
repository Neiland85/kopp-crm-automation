# Zapier Integration - HubSpot Form Submissions to Slack

Esta integración con Zapier CLI automatiza el flujo: **Form Submission → HubSpot Contact → Slack Notification**

## 🚀 Características

### Triggers

- **New Form Submission**: Detecta nuevas entregas de formularios en HubSpot
- **Page View**: Detecta nuevas vistas de página en HubSpot

### Actions

- **Create/Update HubSpot Contact**: Crea o actualiza contactos con mapeo de campos
- **Send Slack Notification**: Envía notificaciones con formato Block Kit

### Funcionalidades Avanzadas

- ✅ **Reintentos Exponenciales**: Manejo robusto de errores HTTP
- ✅ **Logging JSON**: Registro detallado en `logs/zaps/`
- ✅ **Mapeo Inteligente**: Campos de formulario → Propiedades HubSpot
- ✅ **Block Kit**: Mensajes de Slack visualmente atractivos
- ✅ **Tests Unitarios**: Cobertura completa con Jest

## 📋 Mapeo de Campos

### Form Submission → HubSpot Contact

```
email → email
firstname/first_name → firstname
lastname/last_name → lastname
phone → phone (formato limpio)
company → company
form_name → last_form_submitted
submitted_at → last_submission_date
```

## 🎨 Formato de Slack

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "📩 *Nuevo Form Submission*"
      }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Usuario:* {{email}}" },
        { "type": "mrkdwn", "text": "*Formulario:* {{form_name}}" },
        { "type": "mrkdwn", "text": "*Fecha:* {{submitted_at}}" }
      ]
    }
  ]
}
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
HUBSPOT_API_KEY=your_private_app_token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

### Instalación

```bash
# Instalar dependencias
npm install

# Instalar Zapier CLI globalmente
npm install -g zapier-platform-cli

# Validar la aplicación
zapier validate

# Probar localmente
npm test
```

## 🏗️ Estructura del Proyecto

```
src/zapier/
├── index.ts              # Configuración principal de la app
├── types.ts              # Definiciones de TypeScript
├── triggers/
│   ├── newFormSubmission.ts  # Trigger para formularios
│   └── pageView.ts          # Trigger para vistas de página
├── creates/
│   ├── hubspotContact.ts    # Acción de contacto HubSpot
│   └── slackNotification.ts # Acción de notificación Slack
└── utils/
    └── common.ts            # Utilidades compartidas

tests/
└── zapier.test.ts           # Tests unitarios

logs/zaps/                   # Logs JSON por fecha
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Tests Incluidos

- ✅ Configuración de triggers y creates
- ✅ Validación de campos de entrada/salida
- ✅ Funciones utilitarias (retry, mapping, validation)
- ✅ Manejo de errores
- ✅ Estructura de datos Slack Block Kit

## 📊 Logging

Los logs se almacenan en `logs/zaps/YYYY-MM-DD.json`:

```json
{
  "action": "trigger_new_form_submission",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "success": true,
  "data": {
    "submissions_count": 5,
    "since_timestamp": 1642248600000
  }
}
```

## 🔄 Reintentos

Las operaciones HTTP implementan reintentos exponenciales:

- **Intentos**: 3 por defecto
- **Delay Base**: 1000ms
- **Fórmula**: `baseDelay * 2^attempt`
- **Solo para**: Errores 5xx y timeouts

## 🔐 Autenticación

La aplicación usa autenticación personalizada con:

- **HubSpot API Key**: Token de aplicación privada
- **Slack Webhook URL**: URL de webhook entrante

### Test de Autenticación

```http
GET https://api.hubapi.com/crm/v3/objects/contacts?limit=1
Authorization: Bearer {hubspot_api_key}
```

## 🚀 Deployment

```bash
# Construir la aplicación
npm run build

# Subir a Zapier (requiere autenticación)
zapier push

# Promover a versión pública
zapier promote 1.0.0
```

## 📚 Referencias

- [Zapier Platform CLI](https://github.com/zapier/zapier-platform/tree/master/packages/cli)
- [HubSpot API v3](https://developers.hubspot.com/docs/api/overview)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Jest Testing Framework](https://jestjs.io/)

## 🐛 Troubleshooting

### Errores Comunes

**Error 401 - Unauthorized**

```bash
# Verificar API key de HubSpot
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
```

**Error 404 - Slack Webhook**

```bash
# Probar webhook de Slack
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_SLACK_WEBHOOK_URL
```

**Timeout en Triggers**

- Los triggers consultan datos de los últimos 15 minutos
- HubSpot API tiene límites de rate limiting
- Los reintentos manejan errores temporales

### Debug

```bash
# Logs detallados
export LOG_LEVEL=debug
npm test

# Validar configuración
zapier validate --debug

# Probar triggers/creates individualmente
zapier test
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

**Desarrollado con** ❤️ **usando Zapier Platform CLI + TypeScript + Jest**
