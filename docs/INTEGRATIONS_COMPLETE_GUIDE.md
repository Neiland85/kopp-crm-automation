# 🏟️ Kopp CRM - Guía Completa de Integraciones

## 🎯 Overview

Esta guía detalla la configuración completa de todas las integraciones del sistema Kopp CRM:

- **Slack** - Notificaciones y alertas
- **Zapier** - Automatización de workflows
- **HubSpot** - CRM y gestión de contactos
- **Google Sheets** - Lead scoring y data input
- **Notion** - Documentación y tracking

## ⚡ Quick Start

### Configuración Automática (Recomendada)

```bash
# Configurar todas las integraciones
npm run setup:all

# O configurar individualmente
npm run setup:slack     # Configurar Slack
npm run setup:zapier    # Configurar Zapier
npm run setup:hubspot   # Configurar HubSpot
npm run setup:notion    # Configurar Notion
```

### Configuración Manual

```bash
# Ejecutar scripts individuales
./scripts/setup-slack.sh
./scripts/setup-zapier.sh
./scripts/setup-hubspot.sh
./scripts/setup-notion.sh
```

## 🔧 Configuración de Slack

### 1. Crear App en Slack

1. Ve a <https://api.slack.com/apps>
2. Crea nueva app "Kopp CRM Automation"
3. Configura permisos: `chat:write`, `channels:read`, `channels:write`, `pins:write`
4. Instala app en workspace
5. Copia Bot Token y Signing Secret

### 2. Variables de Entorno

```bash
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

### 3. Configuración Automática

```bash
npm run setup:slack
```

**Resultado:**

- ✅ Canales `#automations-alerts` y `#scoring-leads` creados
- ✅ Mensaje de bienvenida enviado y anclado
- ✅ Configuración guardada en `config/slack_setup.json`

## 🔗 Configuración de Zapier

### 1. Instalar Zapier CLI

```bash
npm install -g zapier-platform-cli
zapier login
```

### 2. Configurar App

```bash
npm run setup:zapier
```

### 3. Estructura de Triggers y Actions

#### Triggers

- `newGoogleSheetsLeadScoring` - Nuevas filas en Lead Scoring
- `newFormSubmission` - Nuevos form submissions
- `pageView` - Page views importantes
- `updatedContactProperty` - Propiedades de contacto actualizadas

#### Actions

- `hubspotContact` - Crear/actualizar contacto HubSpot
- `slackNotification` - Enviar notificación Slack
- `updateHubSpotExternalScore` - Actualizar external_score
- `sendHighScoreSlackAlert` - Alerta para high-score leads

### 4. Deploy

```bash
# Solo cuando esté completamente probado (para ahorrar costos)
zapier deploy
```

## 🌐 Configuración de HubSpot

### 1. Obtener API Key

1. Ve a HubSpot → Settings → Integrations → API Key
2. Crea Private App con permisos de contactos
3. Copia API Key

### 2. Variable de Entorno

```bash
HUBSPOT_API_KEY=your-api-key-here
```

### 3. Configuración Automática

```bash
npm run setup:hubspot
```

### 4. Propiedades Personalizadas (Manual)

Crear en HubSpot → Settings → Properties → Contact Properties:

| Propiedad           | Tipo     | Descripción                        |
| ------------------- | -------- | ---------------------------------- |
| `lead_score`        | Number   | Puntuación interna del lead        |
| `external_score`    | Number   | Puntuación externa (Google Sheets) |
| `last_score_update` | DateTime | Última actualización de score      |

### 5. Workflow (Manual)

1. Automation → Workflows → Create Workflow
2. Tipo: Contact-based workflow
3. Trigger: Contact property "lead_score" is updated
4. Action: Set property "last_score_update" = now

## 📊 Configuración de Google Sheets

### 1. Crear Sheet "Lead Scoring"

Columnas requeridas:

- `email` (texto)
- `external_score` (número)
- `name` (texto)
- `company` (texto)
- `source` (texto)
- `timestamp` (fecha/hora)

### 2. Configurar Permisos

- Compartir sheet con Google Service Account
- Configurar API credentials en Google Cloud Console

### 3. Variables de Entorno

```bash
GOOGLE_SHEETS_API_KEY=your-api-key
GOOGLE_SHEETS_ID=your-sheet-id
```

## 📝 Configuración de Notion

### 1. Crear Integration

1. Ve a <https://www.notion.so/my-integrations>
2. Crea nueva integration "Kopp CRM"
3. Copia Integration Token

### 2. Variable de Entorno (Opcional)

```bash
NOTION_TOKEN=your-notion-token
```

### 3. Configuración

```bash
npm run setup:notion
```

### 4. Crear Páginas Manualmente

1. Crear workspace "Kopp Stadium"
2. Crear página "Fase 1 - Integración Core"
3. Copiar contenido desde `docs/notion_templates/`
4. Compartir páginas con integration

## 🔄 Flujo de Integración Completo

### Flujo Principal: Google Sheets → HubSpot → Slack

1. **Nueva fila en Google Sheets** con lead scoring
2. **Zapier trigger** detecta nueva fila (polling cada 15 min)
3. **Zapier action** busca contacto en HubSpot por email
4. **HubSpot update** actualiza `external_score` del contacto
5. **Conditional logic** verifica si score > 50
6. **Slack alert** envía notificación a `#scoring-leads`
7. **HubSpot workflow** actualiza `last_score_update`

### Flujos Secundarios

#### Form Submission → HubSpot + Slack

- Nuevo lead desde formulario web
- Crear contacto en HubSpot
- Notificar en `#automations-alerts`

#### Page View → Scoring Update

- Page view importante detectado
- Actualizar lead scoring interno
- Trigger workflows de seguimiento

## 🧪 Testing y Validación

### Tests Locales

```bash
npm run validate:local    # Validación completa
npm run test:fast        # Tests rápidos
npm run qa:minimal       # QA optimizado
```

### Tests de Integración

#### Test Slack

```bash
# Enviar mensaje de prueba
node -e "
const { WebClient } = require('@slack/web-api');
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
slack.chat.postMessage({
  channel: '#automations-alerts',
  text: '🧪 Test message from Kopp CRM'
});
"
```

#### Test HubSpot

```bash
# Crear contacto de prueba
node -e "
const axios = require('axios');
axios.post('https://api.hubapi.com/crm/v3/objects/contacts', {
  properties: {
    email: 'test@koppstadium.com',
    firstname: 'Test',
    lastname: 'User',
    external_score: '75'
  }
}, {
  headers: { 'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY }
}).then(r => console.log('✅ Contact created:', r.data.id));
"
```

#### Test Zapier

```bash
zapier test --debug
```

## 🚀 Deployment Optimizado para Costos

### GitHub Actions Ultra-Minimizado

- **CI**: 4 minutos máximo, solo main branch
- **Deploy**: 6 minutos máximo, solo version tags
- **85% reducción** en consumo de minutos

### Estrategias de Ahorro

1. **Desarrollo local prioritario** con `npm run validate:local`
2. **Push solo cuando esté completo**
3. **Zapier deploy solo cuando esté probado**
4. **Monitoreo de usage en todas las APIs**

## 📊 Monitoreo y Logs

### Slack Monitoring

- Canal `#automations-alerts` para notificaciones del sistema
- Mensajes anclados con status de integración

### Zapier Monitoring

```bash
zapier logs --limit=10      # Ver últimos logs
zapier history             # Ver histórico de execuciones
```

### HubSpot Monitoring

- Dashboard API usage en HubSpot Settings
- Logs de workflows en Automation tab

## 🛠️ Troubleshooting

### Problemas Comunes

#### Slack: Bot no puede enviar mensajes

```bash
# Verificar permisos
curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  https://slack.com/api/auth.test
```

#### HubSpot: API rate limit exceeded

```bash
# Verificar usage
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  https://api.hubapi.com/integrations/v1/limit/daily
```

#### Zapier: Triggers no funcionan

```bash
zapier logs --debug
zapier validate
```

### Comandos de Diagnóstico

```bash
# Verificar todas las integraciones
npm run setup:integrations

# Test completo local
npm run validate:local

# Verificar variables de entorno
cat .env | grep -E "(SLACK|HUBSPOT|ZAPIER|NOTION)"
```

## 📋 Checklist de Setup Completo

- [ ] Variables de entorno configuradas
- [ ] Slack app creada y permisos configurados
- [ ] Zapier CLI autenticado y app configurada
- [ ] HubSpot API key obtenida y propiedades creadas
- [ ] Google Sheets configurado con permisos
- [ ] Notion integration creada (opcional)
- [ ] Tests locales pasando
- [ ] Flujo end-to-end probado
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

## 🔗 Enlaces Útiles

- [Slack API Documentation](https://api.slack.com/)
- [Zapier Platform Documentation](https://zapier.com/developer/documentation/)
- [HubSpot API Documentation](https://developers.hubspot.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Notion API Documentation](https://developers.notion.com/)

---

## 🆘 Soporte

Para problemas con integraciones:

1. Revisar logs en cada plataforma
2. Verificar variables de entorno
3. Ejecutar tests de diagnóstico
4. Consultar documentación específica
5. Verificar límites de API y usage

**¡Setup completado y optimizado para desarrollo cost-efficient!** 🎯
