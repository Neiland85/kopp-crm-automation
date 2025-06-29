# 💫 Dropout Positivo - Zapier CLI Integration

## Descripción

**Dropout Positivo** es una integración avanzada que detecta automáticamente contacts que
no han tenido engagement reciente (>7 días sin actividad) y les aplica un boost de score
positivo para incentivar el reengagement.

## 🚀 Características Principales

### ✅ Detección Inteligente de Dropout

- **Trigger HubSpot**: Webhook en `last_engagement_date < now - 7 days`
- **Boost Automático**: Incrementa `lead_influence_score += 30`
- **Actualización HubSpot**: Marca `dropout_boost_applied = true`
- **Notificación Slack**: Alerta de reactivación en `#auditoria-sagrada`

### ✅ Características Avanzadas

- **Threshold Configurable**: Días sin engagement personalizable
- **Score Boost Variable**: Boost de score configurable (default: 30 puntos)
- **Reintentos Exponenciales**: Backoff automático ante fallos
- **Logging Estructurado**: Logs detallados en `logs/dropout.log`
- **Validación de Engagement**: Verifica fechas y cálculo de días

## 📁 Estructura del Proyecto

```
src/zaps/dropout-positivo/
├── index.ts          # Configuración del trigger y webhook
├── handler.ts        # Lógica principal de procesamiento
└── README.md         # Esta documentación

tests/zaps/dropout-positivo/
└── dropout-positivo.test.ts  # Tests unitarios con Mocha/Chai

logs/
└── dropout.log       # Logs estructurados
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# HubSpot API
HUBSPOT_API_KEY=your-hubspot-api-key

# Slack Bot
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Dropout Positivo Config
DROPOUT_POSITIVO_ENABLED=true
DROPOUT_THRESHOLD_DAYS=7
DROPOUT_SCORE_BOOST=30
```

## 🎯 Flujo de Funcionamiento

### 1. Trigger HubSpot

```typescript
// Se activa cuando last_engagement_date < now - 7 days
{
  objectId: "12345",
  email: "usuario@example.com",
  last_engagement_date: "2025-06-22T00:00:00.000Z",
  lead_influence_score: "35"
}
```

### 2. Procesamiento y Boost

```typescript
// Calcula días sin engagement
const daysSinceEngagement = calculateDaysSinceEngagement(lastEngagementDate);

// Aplica boost si cumple threshold
if (daysSinceEngagement >= 7) {
  const newScore = currentScore + 30;

  // Actualiza propiedades en HubSpot
  await hubspot.crm.contacts.basicApi.update(contactId, {
    properties: {
      lead_influence_score: newScore.toString(),
      last_dropout_boost_date: new Date().toISOString(),
      dropout_boost_applied: 'true',
    },
  });
}
```

### 3. Mensaje Slack

```
💫 *Dropout Emocional Positivo*

Usuario: usuario@example.com
Score: 35 → 65 (+30)
Días sin engagement: 7
Acción: Reengagement aplicado

🚀 Este usuario ha sido reactivado con un boost de score
para fomentar el re-engagement.

⏰ 29/06/2025 21:30:15 CET
```

## 🧪 Pruebas y Testing

### Instalar Dependencias de Testing

```bash
npm install --save-dev mocha chai @types/mocha @types/chai nock
```

### Ejecutar Tests

```bash
npm run dropout:validate
```

### Test Manual

```bash
npm run dropout:test
```

### Verificar Logs

```bash
npm run dropout:logs
```

## 🚀 Uso

### Inicialización Automática

```typescript
import { dropoutPositivoZap } from './src/zaps/dropout-positivo';

// Configura webhooks automáticamente
export const app = {
  triggers: {
    [dropoutPositivoZap.key]: dropoutPositivoZap,
  },
};
```

### Ejecución Manual

```typescript
import { dropoutPositivoHandler } from './src/zaps/dropout-positivo/handler';

// Simular procesamiento
const result = await dropoutPositivoHandler({
  contactId: '12345',
  email: 'usuario@example.com',
  lastEngagementDate: '2025-06-22T00:00:00.000Z',
  hubspotApiKey: process.env.HUBSPOT_API_KEY!,
  slackBotToken: process.env.SLACK_BOT_TOKEN!,
  slackChannel: '#auditoria-sagrada',
});
```

## 📊 Métricas y Logs

### Estructura de Logs

```
[2025-06-29T21:30:15.123Z] [INFO] [dropout-positivo] 💫 Iniciando procesamiento Dropout Positivo
[2025-06-29T21:30:16.456Z] [INFO] [dropout-positivo] 📊 Información del contact
[2025-06-29T21:30:17.789Z] [INFO] [dropout-positivo] 🔄 Score actualizado en HubSpot
[2025-06-29T21:30:18.012Z] [INFO] [dropout-positivo] 💬 Mensaje enviado a Slack
[2025-06-29T21:30:19.234Z] [INFO] [dropout-positivo] ✅ Dropout Positivo procesado exitosamente
```

### Métricas Disponibles

- **Días sin Engagement**: Cálculo automático desde última actividad
- **Score Boost**: Incremento aplicado al lead_influence_score
- **Tiempo de Procesamiento**: Duración del procesamiento completo
- **Tasa de Éxito**: Confirmación de actualización en HubSpot y Slack

## 🎭 Zapier CLI Integration

### Webhook Configuration

```typescript
export const dropoutPositivoZap = {
  key: 'dropout_positivo',
  noun: 'Dropout Positivo',
  operation: {
    type: 'hook',
    perform: dropoutPositivoTrigger,
    performSubscribe: setupHubSpotWebhook,
    performUnsubscribe: removeHubSpotWebhook,
  },
};
```

### Deployment

```bash
# Validar configuración
zapier validate

# Ejecutar tests
zapier test

# Deployar a Zapier
zapier push
```

## 🏆 Beneficios

### Para el Equipo de Marketing

- **Reactivación Automática**: Boost de score para usuarios inactivos
- **Prevención de Churn**: Identificación temprana de usuarios en riesgo
- **Engagement Proactivo**: Acción automática antes de perder al usuario

### Para el Equipo de Ventas

- **Leads Reactivados**: Usuarios que vuelven al radar con score mejorado
- **Contexto Claro**: Información sobre período de inactividad
- **Priorización**: Identificación de oportunidades de re-engagement

### Para el Negocio

- **Retención Mejorada**: Reducción de churn por inactividad
- **ROI de Marketing**: Reactivación de inversión en leads previos
- **Automatización Completa**: Procesamiento sin intervención manual

## 🛠️ Troubleshooting

### Problemas Comunes

**❌ "Webhook no detecta contacts inactivos"**

```bash
# Verificar configuración del webhook
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  "https://api.hubapi.com/webhooks/v3/subscriptions"
```

**❌ "Score no se actualiza"**

```bash
# Verificar permisos de la API key
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  "https://api.hubapi.com/crm/v3/objects/contacts/12345?properties=lead_influence_score"
```

**❌ "Slack no recibe mensaje"**

```bash
# Probar conexión Slack
curl -X POST -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-type: application/json" \
  --data '{"channel":"#auditoria-sagrada","text":"Test dropout"}' \
  https://slack.com/api/chat.postMessage
```

## 📚 Referencias

- [HubSpot Webhooks API](https://developers.hubspot.com/docs/api/webhooks)
- [HubSpot Contacts API](https://developers.hubspot.com/docs/api/crm/contacts)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Zapier CLI Hooks](https://platform.zapier.com/docs/triggers#webhook)

---

**¡Dropout Positivo está listo para reactivar tus leads! 💫**
