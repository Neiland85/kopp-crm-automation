# 🎯 Reputómetro Invisible - Zapier CLI Integration

## Descripción

El **Reputómetro Invisible** es una integración avanzada que combina Zapier CLI, HubSpot API
y Slack para automatizar el cálculo de scores de influencia de leads y proporcionar reportes
en tiempo real.

## 🚀 Características Principales

### ✅ Automatización Completa

- **Cron Job**: Ejecuta cada 5 minutos automáticamente
- **Consulta HubSpot**: Obtiene leads con actividad en la última hora
- **Cálculo de Score**: `lead_influence_score = views * 0.5 + submissions * 2`
- **Actualización Automática**: Sincroniza scores con HubSpot
- **Notificaciones Slack**: Envía reportes con Block Kit

### ✅ Características Avanzadas

- **Reintentos Exponenciales**: Backoff automático ante fallos
- **Logging Estructurado**: Logs detallados en `logs/reputometro.log`
- **Validación de Configuración**: Verificación de credenciales al inicio
- **Manejo de Errores**: Recuperación automática de errores temporales
- **Tests Completos**: Cobertura con Jest y mocks

## 📁 Estructura del Proyecto

```
src/zaps/reputometro/
├── index.ts          # Punto de entrada y configuración del cron
├── handler.ts        # Lógica principal del Reputómetro
└── README.md         # Esta documentación

tests/zaps/
└── reputometro.test.ts  # Tests unitarios completos

logs/
└── reputometro.log   # Logs estructurados
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# HubSpot API
HUBSPOT_API_KEY=your-hubspot-api-key

# Slack Bot
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Reputómetro Config
REPUTOMETRO_ENABLED=true
REPUTOMETRO_CRON_SCHEDULE=*/5 * * * *
REPUTOMETRO_TIMEZONE=America/Mexico_City
```

### Dependencias

```json
{
  "@hubspot/api-client": "^12.0.0",
  "@slack/web-api": "^7.1.0",
  "node-cron": "^4.1.1",
  "dotenv": "^16.0.0"
}
```

## 🎯 Funcionalidades Detalladas

### 1. Consulta HubSpot

```typescript
// Obtiene contacts con last_submission_date >= now - 1h
const contacts = await hubspot.crm.contacts.searchApi.doSearch({
  filterGroups: [
    {
      filters: [
        {
          propertyName: 'last_submission_date',
          operator: 'GTE',
          value: oneHourAgo,
        },
      ],
    },
  ],
});
```

### 2. Cálculo de Score

```typescript
const leadInfluenceScore = views * 0.5 + submissions * 2;
```

### 3. Mensaje Slack Block Kit

```
⚡ *Reputómetro Invisible*
📊 Total: 15 leads procesados
🏆 Top 3: juan@example.com, maria@example.com, carlos@example.com
📈 Score medio: 24.5
```

## 🧪 Pruebas y Testing

### Ejecutar Tests

```bash
npm test -- tests/zaps/reputometro.test.ts
```

### Test Manual

```bash
node scripts/test-reputometro.js
```

### Cobertura de Tests

- ✅ Handler principal con datos mock
- ✅ Cálculo de scores
- ✅ Integración HubSpot (mocked)
- ✅ Integración Slack (mocked)
- ✅ Manejo de errores
- ✅ Retry con backoff exponencial
- ✅ Logs estructurados

## 🚀 Uso

### Inicio Automático

```typescript
import { startReputometro } from './src/zaps/reputometro';

// Inicia el cron job automáticamente
startReputometro();
```

### Ejecución Manual

```typescript
import { reputometroTrigger } from './src/zaps/reputometro';

// Ejecuta una vez manualmente
const result = await reputometroTrigger();
console.log('Resultado:', result);
```

## 📊 Monitoreo y Logs

### Estructura de Logs

```
[2025-06-29T20:46:15.123Z] [INFO] [reputometro] 🔍 Consultando HubSpot por leads activos
[2025-06-29T20:46:16.456Z] [INFO] [reputometro] 📈 Calculando scores para 15 leads
[2025-06-29T20:46:17.789Z] [INFO] [reputometro] 🔄 Actualizando HubSpot con nuevos scores
[2025-06-29T20:46:18.012Z] [INFO] [reputometro] 💬 Enviando reporte a Slack
```

### Métricas Disponibles

- **Tiempo de Ejecución**: Duración total del proceso
- **Leads Procesados**: Cantidad de leads analizados
- **Score Promedio**: Media de los scores calculados
- **Actualizaciones HubSpot**: Número de propiedades actualizadas
- **Estado Slack**: Confirmación de envío de mensaje

## 🔒 Seguridad

### Validaciones

- ✅ Verificación de credenciales al inicio
- ✅ Validación de datos de entrada
- ✅ Manejo seguro de errores
- ✅ Logs sin datos sensibles

### Reintentos

- **Backoff Exponencial**: 1s, 2s, 4s, 8s...
- **Máximo 3 intentos** por operación
- **Logging detallado** de cada intento

## 🎭 Zapier CLI Integration

### Trigger Definition

```typescript
export const reputometroZap = {
  key: 'reputometro_invisible',
  noun: 'Lead Score',
  display: {
    label: 'Reputómetro Invisible',
    description: 'Calcula y reporta scores de influencia de leads',
  },
  operation: {
    perform: reputometroTrigger,
    sample: sampleOutput,
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

# Promover a producción
zapier promote
```

## 🏆 Beneficios

### Para el Equipo de Ventas

- **Visibilidad en Tiempo Real**: Identificación inmediata de leads "calientes"
- **Priorización Automática**: Top 3 leads con mayor score
- **Alertas Inteligentes**: Notificaciones solo cuando hay actividad

### Para el Equipo de Marketing

- **Métricas Precisas**: Cálculo consistente de scores
- **Seguimiento Automático**: Historial de scores en HubSpot
- **Análisis de Tendencias**: Datos estructurados para reporting

### Para el Negocio

- **Automatización Completa**: Reducción de trabajo manual
- **Respuesta Rápida**: Detección de oportunidades en 5 minutos
- **Escalabilidad**: Procesamiento de miles de leads

## 🛠️ Troubleshooting

### Problemas Comunes

**❌ "HubSpot API Key inválida"**

```bash
# Verificar credenciales
echo $HUBSPOT_API_KEY
# Probar conexión
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" https://api.hubapi.com/contacts/v1/lists/all
```

**❌ "Slack Bot Token inválido"**

```bash
# Verificar token
echo $SLACK_BOT_TOKEN
# Probar conexión
curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" https://slack.com/api/auth.test
```

**❌ "Cron no ejecuta"**

```bash
# Verificar configuración
node -e "console.log(require('node-cron').validate('*/5 * * * *'))"
# Revisar logs
tail -f logs/reputometro.log
```

## 📚 Referencias

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Zapier CLI Guide](https://github.com/zapier/zapier-platform/blob/main/packages/cli/README.md)
- [Node-Cron Documentation](https://github.com/node-cron/node-cron)

---

**¡El Reputómetro Invisible está listo para potenciar tu CRM! 🚀**
