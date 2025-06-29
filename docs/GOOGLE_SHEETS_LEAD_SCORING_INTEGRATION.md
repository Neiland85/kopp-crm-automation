# Google Sheets Lead Scoring Integration

## Descripción

Esta integración de Zapier CLI en TypeScript permite:

1. **Escuchar nuevas filas** en la hoja "Lead Scoring" de Google Sheets
2. **Actualizar el `external_score`** del contacto en HubSpot usando el email como identificador
3. **Enviar alertas a Slack** al canal #scoring-leads cuando `external_score > 50`

## Configuración

### Variables de Entorno

Agregar las siguientes variables a tu archivo `.env`:

```bash
# Google Sheets Configuration
GOOGLE_ACCESS_TOKEN=your-google-oauth2-access-token
GOOGLE_SPREADSHEET_ID=your-google-spreadsheet-id-with-lead-scoring-sheet
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REFRESH_TOKEN=your-google-oauth-refresh-token

# HubSpot Configuration
HUBSPOT_API_KEY=your-hubspot-api-key-here

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

### Estructura de Google Sheets

La hoja "Lead Scoring" debe tener las siguientes columnas:

| Email                  | External Score | Timestamp            | Name     | Company      | Source  |
| ---------------------- | -------------- | -------------------- | -------- | ------------ | ------- |
| <john.doe@example.com> | 75             | 2024-01-15T10:30:00Z | John Doe | Example Corp | Website |

**Columnas requeridas:**

- `Email`: Email del contacto (usado para buscar en HubSpot)
- `External Score`: Puntuación externa (número entero)

**Columnas opcionales:**

- `Timestamp`: Fecha de la entrada
- `Name`: Nombre del contacto
- `Company`: Empresa del contacto
- `Source`: Fuente del lead

## Flujo de Trabajo

### 1. Trigger: Google Sheets

```typescript
// Configuración del trigger
{
  key: 'new_google_sheets_lead_scoring',
  noun: 'Google Sheets Lead Scoring Row',
  display: {
    label: 'New Lead Scoring Row in Google Sheets',
    description: 'Triggers when a new row is added to the Lead Scoring sheet'
  }
}
```

**Funcionalidad:**

- Polling cada 15 minutos
- Detecta nuevas filas basado en timestamp
- Retorna datos estructurados con ID único

### 2. Action: Actualizar HubSpot

```typescript
// Configuración de la acción
{
  key: 'update_hubspot_external_score',
  inputFields: [
    { key: 'email', required: true },
    { key: 'external_score', required: true }
  ]
}
```

**Funcionalidad:**

- Busca contacto por email en HubSpot
- Actualiza la propiedad `external_score`
- Implementa reintentos automáticos
- Registra todas las acciones

### 3. Action: Alerta de Slack

```typescript
// Configuración de la acción
{
  key: 'send_high_score_slack_alert',
  inputFields: [
    { key: 'email', required: true },
    { key: 'external_score', required: true },
    { key: 'name', required: false },
    { key: 'company', required: false }
  ]
}
```

**Funcionalidad:**

- Solo envía alerta si `external_score > 50`
- Usa Block Kit para mensajes ricos
- Incluye botón para ver contacto en HubSpot
- Canal fijo: #scoring-leads

### Mensaje de Slack

```
🚨 High Lead Score Alert

A new lead with a high external score has been detected!

Email: john.doe@example.com    External Score: 75
Name: John Doe                Company: Example Corp

🕐 Detected at 1/15/2024, 10:30 AM

[View in HubSpot]
```

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar credenciales de Zapier

```bash
zapier login
```

### 3. Configurar la app

```bash
zapier register "Kopp Lead Scoring Integration"
```

### 4. Hacer push de la app

```bash
zapier push
```

### 5. Crear Zaps

1. **Trigger**: "New Lead Scoring Row in Google Sheets"
2. **Action 1**: "Update HubSpot Contact External Score"
3. **Action 2**: "Send High Score Alert to Slack"

## Testing

### Ejecutar tests de integración

```bash
npm test -- googleSheetsLeadScoring.integration.test.ts
```

### Test manual con datos de ejemplo

```bash
# Agregar una fila de prueba a Google Sheets
Email: test@example.com
External Score: 85
Timestamp: 2024-01-15T10:30:00Z
Name: Test User
Company: Test Corp
Source: Manual Test
```

## Archivos Importantes

```
src/zapier/
├── triggers/
│   └── newGoogleSheetsLeadScoring.ts    # Trigger principal
├── creates/
│   ├── updateHubSpotExternalScore.ts    # Acción de HubSpot
│   └── sendHighScoreSlackAlert.ts       # Acción de Slack
├── types.ts                             # Tipos TypeScript
├── index.ts                             # Configuración principal
└── utils/
    └── common.ts                        # Utilidades (retry, logging)

tests/
└── googleSheetsLeadScoring.integration.test.ts  # Tests de integración
```

## Monitoring y Logging

- **Zapier Platform**: Logs automáticos en el dashboard
- **Utilidades custom**: `logZapAction()` para tracking detallado
- **Reintentos**: `withRetry()` para robustez ante fallos de red

## Troubleshooting

### Error: "Contact not found in HubSpot"

- Verificar que el email existe en HubSpot
- Confirmar permisos de la API key

### Error: "Google Sheets API Error"

- Verificar token de acceso válido
- Confirmar ID de spreadsheet correcto
- Verificar permisos de lectura en la hoja

### Error: "Slack webhook failed"

- Verificar URL del webhook
- Confirmar permisos del canal #scoring-leads

### No se detectan nuevas filas

- Verificar formato de timestamp en Google Sheets
- Confirmar que la hoja se llama exactamente "Lead Scoring"
- Revisar logs de Zapier para errores de polling

## Ejemplo de Configuración Completa

```javascript
// Zap Configuration
{
  "trigger": {
    "app": "Kopp Lead Scoring Integration",
    "event": "New Lead Scoring Row in Google Sheets",
    "account": "Google Sheets Account",
    "setup": {
      "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
    }
  },
  "actions": [
    {
      "app": "Kopp Lead Scoring Integration",
      "event": "Update HubSpot Contact External Score",
      "account": "HubSpot Account",
      "setup": {
        "email": "{{trigger.email}}",
        "external_score": "{{trigger.external_score}}"
      }
    },
    {
      "app": "Kopp Lead Scoring Integration",
      "event": "Send High Score Alert to Slack",
      "account": "Slack Account",
      "setup": {
        "email": "{{trigger.email}}",
        "external_score": "{{trigger.external_score}}",
        "name": "{{trigger.name}}",
        "company": "{{trigger.company}}"
      }
    }
  ]
}
```

## Notas de Implementación

- **Rate Limiting**: Respeta límites de API de Google Sheets y HubSpot
- **Error Handling**: Fallos en una acción no bloquean las siguientes
- **Data Validation**: Validación estricta de campos requeridos
- **Security**: Tokens almacenados de forma segura en Zapier
- **Scalability**: Diseñado para manejar múltiples filas por polling
