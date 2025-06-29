# 🚨 Hot Leads Detection - Zapier CLI Integration

## Descripción

**Hot Leads Detection** es una integración avanzada que identifica automáticamente leads
"calientes" cuando su score de influencia supera el threshold configurado y activa un flujo de
seguimiento inmediato.

## 🚀 Características Principales

### ✅ Detección Automática

- **Trigger HubSpot**: Webhook en property change `lead_influence_score > 40`
- **Actualización Automática**: Cambia `lead_status = 'Hot Lead'` en HubSpot
- **Notificación Inmediata**: Alerta prioritaria en Slack #hot-leads
- **Seguimiento Recomendado**: Llamada a acción para contacto inmediato

### ✅ Características Avanzadas

- **Threshold Configurable**: Personalizable vía `HOT_LEAD_THRESHOLD`
- **Reintentos Exponenciales**: Backoff automático ante fallos
- **Logging Estructurado**: Logs detallados en `logs/hot_leads.log`
- **Slack Block Kit**: Mensaje interactivo con botones de acción
- **Validación de Datos**: Verificación de scores y contactos

## 📁 Estructura del Proyecto

```
src/zaps/hot-leads/
├── index.ts          # Configuración del trigger y webhook
├── handler.ts        # Lógica principal de detección
└── README.md         # Esta documentación

tests/zaps/hot-leads/
└── hot-leads.test.ts  # Tests unitarios completos

logs/
└── hot_leads.log     # Logs estructurados
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# HubSpot API
HUBSPOT_API_KEY=your-hubspot-api-key

# Slack Bot
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Hot Leads Config
HOT_LEADS_ENABLED=true
HOT_LEAD_THRESHOLD=40
```

## 🎯 Flujo de Funcionamiento

### 1. Trigger HubSpot

```typescript
// Se activa cuando lead_influence_score > threshold
{
  contactId: "12345",
  email: "juan@example.com",
  leadInfluenceScore: 45,
  previousScore: 35,
  timestamp: "2025-06-29T20:46:15.123Z"
}
```

### 2. Actualización HubSpot

```typescript
// Actualiza propiedades del contacto
await hubspot.crm.contacts.basicApi.update(contactId, {
  properties: {
    lead_status: 'Hot Lead',
    last_hot_lead_detection: new Date().toISOString(),
    hot_lead_trigger_score: '40+',
  },
});
```

### 3. Mensaje Slack Block Kit

```
🚨 *Hot Lead Detectado*
───────────────────────
Usuario: juan@example.com
Score: 35 → 45
Status: ✅ Actualizado
Acción: Seguimiento inmediato

🎯 Recomendación: Este lead ha alcanzado un score de 45,
indicando alto interés. Contactar inmediatamente para
maximizar conversión.

[👀 Ver en HubSpot] [📞 Contactar Ahora]
```

## 🧪 Pruebas y Testing

### Ejecutar Tests

```bash
npm run hot-leads:validate
```

### Test Manual

```bash
npm run hot-leads:test
```

### Verificar Logs

```bash
npm run hot-leads:logs
```

## 🚀 Uso

### Inicialización Automática

```typescript
import { initHotLeads } from './src/zaps/hot-leads';

// Configura webhooks automáticamente
initHotLeads();
```

### Ejecución Manual

```typescript
import { hotLeadsTrigger } from './src/zaps/hot-leads';

// Simular trigger de HubSpot
const result = await hotLeadsTrigger(z, bundle);
```

## 📊 Métricas y Logs

### Estructura de Logs

```
[2025-06-29T21:02:15.123Z] [INFO] [hot-leads] 🚨 Hot Lead trigger activado
[2025-06-29T21:02:16.456Z] [INFO] [hot-leads] 🔄 Actualizando lead_status en HubSpot
[2025-06-29T21:02:17.789Z] [INFO] [hot-leads] 💬 Enviando alerta Hot Lead a Slack
[2025-06-29T21:02:18.012Z] [INFO] [hot-leads] ✅ Hot Lead procesado exitosamente
```

### Métricas Disponibles

- **Tiempo de Ejecución**: Duración del procesamiento
- **Status Actualizado**: Confirmación de cambio en HubSpot
- **Mensaje Enviado**: Confirmación de alerta en Slack
- **Score Change**: Cambio del score de influencia

## 🎭 Zapier CLI Integration

### Webhook Configuration

```typescript
export const hotLeadsZap = {
  key: 'hot_leads_detection',
  noun: 'Hot Lead',
  operation: {
    type: 'hook',
    perform: hotLeadsTrigger,
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

### Para el Equipo de Ventas

- **Alertas Inmediatas**: Notificación instantánea de leads calientes
- **Priorización Automática**: Identificación de leads con alta probabilidad de conversión
- **Información Contextual**: Score, historial y botones de acción directa

### Para el Equipo de Marketing

- **Seguimiento Automático**: Tracking de leads que alcanzan scoring alto
- **Análisis de Efectividad**: Métricas de leads que se convierten en hot leads
- **Optimización de Campaigns**: Identificación de qué acciones generan hot leads

### Para el Negocio

- **Respuesta Rápida**: Contacto inmediato con leads interesados
- **Mayor Conversión**: Aprovechamiento del momento de máximo interés
- **Automatización Completa**: Reducción de trabajo manual en seguimiento

## 🛠️ Troubleshooting

### Problemas Comunes

**❌ "Webhook no se activa"**

```bash
# Verificar webhook en HubSpot
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  "https://api.hubapi.com/webhooks/v3/subscriptions"
```

**❌ "Lead no se actualiza"**

```bash
# Verificar permisos de la API key
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  "https://api.hubapi.com/crm/v3/objects/contacts/12345"
```

**❌ "Slack no recibe mensaje"**

```bash
# Probar conexión Slack
curl -X POST -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-type: application/json" \
  --data '{"channel":"#hot-leads","text":"Test"}' \
  https://slack.com/api/chat.postMessage
```

## 📚 Referencias

- [HubSpot Webhooks API](https://developers.hubspot.com/docs/api/webhooks)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Zapier CLI Hooks](https://platform.zapier.com/docs/triggers#webhook)

---

**¡Hot Leads Detection está listo para maximizar tus conversiones! 🚨**
