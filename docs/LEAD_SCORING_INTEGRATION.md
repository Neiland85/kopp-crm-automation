# Lead Scoring Integration - Zapier CLI TypeScript

Esta integración automatiza el workflow de lead scoring: **Updated Contact Property → HubSpot Timestamp Update → Slack Notification**

## 🎯 Funcionalidad

### Trigger: Updated Contact Property

- Detecta cuando `lead_score` es actualizado en HubSpot
- Polling cada 15 minutos con filtrado inteligente
- Solo procesa contactos donde el score cambió después de `last_score_update`

### Actions Implementadas

#### 1. Update Score Timestamp

- Actualiza `last_score_update` en HubSpot con timestamp actual
- Registro detallado de cambios
- Manejo de errores robusto

#### 2. Send Scoring Notification

- Envía notificación a `#scoring-leads` **solo si lead_score ≥ 50**
- Formato dinámico según el score:
  - **≥ 80**: 🔥 HOT LEAD (botón rojo)
  - **≥ 70**: ⚡ WARM LEAD (botón azul)
  - **≥ 50**: 👀 QUALIFIED LEAD (botón azul)

## 📩 Formato de Mensaje Slack

```
📈 *Lead Score Actualizado*
Usuario: {{email}}
Score: {{lead_score}}
Nombre: {{firstname}} {{lastname}}
Empresa: {{company}}
Teléfono: {{phone}}
Última actualización: {{formatted_date}}

🔥 *HOT LEAD* (si score ≥ 80)
[Ver en HubSpot] (botón con enlace directo)
```

## 🔧 Configuración del Workflow

### 1. HubSpot Contact Property Update

```javascript
// Trigger cuando lead_score cambia
{
  "trigger": "updated_contact_property",
  "property": "lead_score",
  "polling_interval": "15_minutes"
}
```

### 2. Update Timestamp Action

```javascript
// Actualizar last_score_update
{
  "action": "update_score_timestamp",
  "contact_id": "{{trigger.id}}",
  "email": "{{trigger.email}}",
  "lead_score": "{{trigger.lead_score}}"
}
```

### 3. Conditional Slack Notification

```javascript
// Solo si lead_score >= 50
{
  "action": "send_scoring_notification",
  "email": "{{trigger.email}}",
  "lead_score": "{{trigger.lead_score}}",
  "firstname": "{{trigger.firstname}}",
  "lastname": "{{trigger.lastname}}",
  "company": "{{trigger.company}}",
  "contact_id": "{{trigger.id}}"
}
```

## 🧪 Tests de Integración

### Cobertura de Tests

- ✅ **Trigger**: Detección de contactos con score actualizado
- ✅ **Update Action**: Actualización de timestamp en HubSpot
- ✅ **Notification Action**: Envío condicional a Slack
- ✅ **Workflow Completo**: Integración end-to-end
- ✅ **Retry Logic**: Reintentos en fallos de red
- ✅ **Edge Cases**: Scores bajos, datos faltantes, errores API

### Ejecutar Tests

```bash
# Tests de integración específicos
npm test -- tests/leadScoring.integration.test.ts

# Todos los tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🚀 Implementación

### Propiedades HubSpot Requeridas

```javascript
// Contacto debe tener estas propiedades
{
  "lead_score": "75",           // Número (requerido)
  "last_score_update": "2024-01-15T10:30:00Z", // Timestamp
  "email": "user@example.com",  // Email (requerido)
  "firstname": "John",          // Texto (opcional)
  "lastname": "Doe",           // Texto (opcional)
  "company": "Example Corp",    // Texto (opcional)
  "phone": "+1234567890"       // Texto (opcional)
}
```

### Variables de Entorno

```bash
HUBSPOT_API_KEY=your_private_app_token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

## 📊 Logging & Monitoreo

### Logs JSON Estructurados

```json
{
  "action": "trigger_updated_contact_property",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "success": true,
  "data": {
    "total_contacts": 150,
    "updated_contacts": 3,
    "since_timestamp": 1642248600000
  }
}
```

### Métricas Importantes

- **Contactos procesados**: Total encontrados vs actualizados
- **Notificaciones enviadas**: Solo scores ≥ 50
- **Reintentos**: Fallos de red y recuperación
- **Latencia**: Tiempo de respuesta de APIs

## 🔄 Reintentos y Manejo de Errores

### Estrategia de Reintentos

- **Exponential Backoff**: 1s, 2s, 4s
- **Max Retries**: 3 intentos
- **Retry Conditions**: Errores 5xx, timeouts, network failures
- **Fast Fail**: Errores 4xx (auth, validation)

### Escenarios de Error

```javascript
// Fallo de red - RETRY
fetch('https://api.hubspot.com/...').catch(NetworkError); // → Retry con backoff

// Error 401 - NO RETRY
fetch('https://api.hubspot.com/...').catch({ status: 401 }); // → Immediate fail

// Error 500 - RETRY
fetch('https://api.hubspot.com/...').catch({ status: 500 }); // → Retry con backoff
```

## 📈 Casos de Uso

### Scenario 1: New Hot Lead

```
1. Contact score: 35 → 85
2. Trigger detects change
3. Update timestamp in HubSpot
4. Send "🔥 HOT LEAD" to #scoring-leads
5. Sales team gets immediate notification
```

### Scenario 2: Qualified Lead

```
1. Contact score: 45 → 55
2. Trigger detects change
3. Update timestamp in HubSpot
4. Send "👀 QUALIFIED LEAD" to #scoring-leads
5. Marketing qualified for sales follow-up
```

### Scenario 3: Low Score (No Notification)

```
1. Contact score: 20 → 35
2. Trigger detects change
3. Update timestamp in HubSpot
4. Skip Slack notification (< 50)
5. Log action as "skipped_low_score"
```

## 🛠️ Desarrollo

### Estructura de Archivos

```
src/zapier/
├── triggers/
│   └── updatedContactProperty.ts    # Detecta cambios en lead_score
├── creates/
│   ├── updateScoreTimestamp.ts      # Actualiza timestamp HubSpot
│   └── sendScoringNotification.ts   # Notificación Slack condicional
└── utils/
    └── common.ts                    # Reintentos y logging

tests/
└── leadScoring.integration.test.ts  # Tests con Supertest + Jest
```

### Comandos de Desarrollo

```bash
# Validar integración
npm run zapier:validate

# Build y test
npm run zapier:build

# Deploy a Zapier
npm run zapier:deploy

# Logs de producción
npm run zapier:logs
```

## 🏆 Características Avanzadas

### Filtrado Inteligente

- Compara `hs_lastmodifieddate` vs `last_score_update`
- Solo procesa contactos con score realmente actualizado
- Evita notificaciones duplicadas

### Notificaciones Contextuales

- Mensaje dinámico según nivel de score
- Botones de acción con enlaces directos a HubSpot
- Información completa del contacto

### Logging Detallado

- Registro de cada acción con timestamp
- Métricas de performance y errores
- Análisis de patrones de scoring

---

**🎯 Lead Scoring Integration completamente implementada con reintentos, tests de integración y notificaciones inteligentes**
