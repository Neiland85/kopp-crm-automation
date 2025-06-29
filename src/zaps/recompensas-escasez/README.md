# 🎁 Recompensas por Escasez - Zapier CLI Integration

## Descripción

**Recompensas por Escasez** es una integración sofisticada que detecta productos con stock
bajo y activa automáticamente un sistema de recompensas emocionales para incentivar compras
urgentes mediante cupones personalizados.

## 🚀 Características Principales

### ✅ Detección Inteligente de Escasez

- **Trigger Google Sheets**: Webhook en cambios de stock con `stock_remaining ≤ 20`
- **Niveles de Urgencia**: Critical (≤5), High (≤10), Medium (≤20)
- **Actualización HubSpot**: `recompensa_emocional = 'Oferta especial'`
- **Generación de Cupones**: Códigos únicos basados en urgencia y producto

### ✅ Características Avanzadas

- **Cupones Dinámicos**: Descuentos variables según urgencia (15%-25%)
- **Reintentos Exponenciales**: Backoff automático ante fallos
- **Logging Estructurado**: Logs detallados en `logs/recompensas.log`
- **Slack Block Kit**: Mensajes interactivos con botones de acción
- **Multi-Contact**: Actualización masiva de contactos relacionados

## 📁 Estructura del Proyecto

```
src/zaps/recompensas-escasez/
├── index.ts          # Configuración del trigger y Google Sheets
├── handler.ts        # Lógica principal de recompensas
└── README.md         # Esta documentación

tests/zaps/recompensas-escasez/
└── recompensas-escasez.test.ts  # Tests unitarios completos

logs/
└── recompensas.log   # Logs estructurados
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# HubSpot API
HUBSPOT_API_KEY=your-hubspot-api-key

# Slack Bot
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Google Sheets
GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
GOOGLE_SHEETS_ID=your-spreadsheet-id

# Recompensas Config
RECOMPENSAS_ESCASEZ_ENABLED=true
STOCK_THRESHOLD=20
```

## 🎯 Flujo de Funcionamiento

### 1. Trigger Google Sheets

```typescript
// Se activa cuando stock_remaining ≤ threshold
{
  productId: "JERSEY-KS-001",
  productName: "Jersey Kopp Stadium Edición Limitada",
  stockRemaining: 15,
  previousStock: 35,
  sheetRowId: "row-123",
  urgencyLevel: "high"
}
```

### 2. Generación de Cupón

```typescript
// Genera código único basado en urgencia
function generateCouponCode(productId, urgencyLevel) {
  const prefix = urgencyLevel === 'critical' ? 'URGENT' : 'SPECIAL';
  const timestamp = Date.now().toString().slice(-6);
  const productCode = productId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return `${prefix}${productCode}${timestamp}`;
}
// Resultado: "URGENTJERS123456" o "SPECIALJERS789012"
```

### 3. Actualización HubSpot

```typescript
// Actualiza contactos relacionados
await hubspot.crm.contacts.basicApi.update(contactId, {
  properties: {
    recompensa_emocional: 'Oferta especial',
    last_stock_alert: new Date().toISOString(),
    stock_alert_product: productName,
    coupon_code: couponCode,
    stock_urgency_level: urgencyLevel,
  },
});
```

### 4. Mensaje Slack Block Kit

```
🎁 *Recompensa Emocional* 🚨
─────────────────────────────
Producto: Jersey Kopp Stadium Edición Limitada
Stock restante: 15 unidades
Nivel de urgencia: HIGH
Contactos actualizados: 25

💎 *¡ÚLTIMAS UNIDADES! 25% OFF*
Código: URGENTJERS123456

🎯 Acción recomendada: Envío de cupón URGENTE - Stock crítico

[📧 Enviar Cupones] [📊 Ver Stock Sheet] [📈 Analizar Tendencia]
```

## 🎨 Niveles de Urgencia

### 🚨 CRITICAL (Stock ≤ 5)

- **Prefijo**: `URGENT`
- **Descuento**: 25% OFF
- **Mensaje**: "¡ÚLTIMAS UNIDADES! 25% OFF"
- **Estilo**: Botón rojo, máxima prioridad

### ⚠️ HIGH (Stock ≤ 10)

- **Prefijo**: `SPECIAL`
- **Descuento**: 20% OFF
- **Mensaje**: "STOCK LIMITADO - 20% OFF"
- **Estilo**: Botón naranja, alta prioridad

### 💡 MEDIUM (Stock ≤ 20)

- **Prefijo**: `SPECIAL`
- **Descuento**: 15% OFF
- **Mensaje**: "OFERTA ESPECIAL - 15% OFF"
- **Estilo**: Botón amarillo, prioridad normal

## 🧪 Pruebas y Testing

### Ejecutar Tests

```bash
npm run recompensas:validate
```

### Test Manual

```bash
npm run recompensas:test
```

### Verificar Logs

```bash
npm run recompensas:logs
```

### Cobertura de Tests

- ✅ Generación de códigos de cupón
- ✅ Niveles de urgencia
- ✅ Actualización de múltiples contactos
- ✅ Mensajes Slack interactivos
- ✅ Manejo de errores
- ✅ Retry con backoff exponencial

## 🚀 Uso

### Inicialización Automática

```typescript
import { initRecompensasEscasez } from './src/zaps/recompensas-escasez';

// Configura webhooks de Google Sheets automáticamente
initRecompensasEscasez();
```

### Ejecución Manual

```typescript
import { recompensasEscasezTrigger } from './src/zaps/recompensas-escasez';

// Simular trigger de Google Sheets
const result = await recompensasEscasezTrigger(z, bundle);
```

## 📊 Métricas y Logs

### Estructura de Logs

```
[2025-06-29T21:02:15.123Z] [INFO] [recompensas-escasez] 🎁 Recompensas por Escasez trigger activado
[2025-06-29T21:02:16.456Z] [INFO] [recompensas-escasez] 🔄 Actualizando recompensa_emocional en HubSpot
[2025-06-29T21:02:17.789Z] [INFO] [recompensas-escasez] 💬 Enviando alerta de escasez a Slack
[2025-06-29T21:02:18.012Z] [INFO] [recompensas-escasez] ✅ Recompensa por Escasez procesada completamente
```

### Métricas Disponibles

- **Contactos Actualizados**: Número de leads que recibieron cupones
- **Código de Cupón**: Cupón único generado
- **Nivel de Urgencia**: Critical, High o Medium
- **Tiempo de Ejecución**: Duración del procesamiento
- **Integración Google Sheets**: Estado de la sincronización

## 🎭 Zapier CLI Integration

### Google Sheets Webhook

```typescript
export const recompensasEscasezZap = {
  key: 'recompensas_escasez',
  noun: 'Stock Alert',
  operation: {
    type: 'hook',
    perform: recompensasEscasezTrigger,
    performSubscribe: setupGoogleSheetsWebhook,
    performUnsubscribe: removeGoogleSheetsWebhook,
  },
};
```

### Sample Output

```json
{
  "id": "escasez-1719691575123-abc123def",
  "timestamp": "2025-06-29T21:02:15.123Z",
  "productId": "JERSEY-KS-001",
  "productName": "Jersey Kopp Stadium Edición Limitada",
  "stockRemaining": 15,
  "previousStock": 35,
  "urgencyLevel": "high",
  "hubspotUpdated": true,
  "slackMessageSent": true,
  "contactsUpdated": 25,
  "couponCode": "SPECIALJERS123456",
  "executionTimeMs": 1850
}
```

## 🏆 Beneficios

### Para el Equipo de Ventas

- **Cupones Automáticos**: Generación inmediata de ofertas de escasez
- **Urgencia Real**: Información precisa sobre stock crítico
- **Seguimiento Simplificado**: Notificaciones centralizadas en Slack

### Para el Equipo de Marketing

- **Recompensas Emocionales**: Activación de FOMO (Fear of Missing Out)
- **Segmentación Automática**: Contactos reciben cupones basados en interés
- **Métricas de Conversión**: Tracking de efectividad de cupones

### Para el Negocio

- **Rotación de Inventario**: Aceleración de ventas de productos con stock bajo
- **Maximización de Revenue**: Descuentos estratégicos para cerrar ventas
- **Experiencia Premium**: Ofertas exclusivas para leads calificados

## 🛠️ Troubleshooting

### Problemas Comunes

**❌ "Google Sheets webhook no funciona"**

```bash
# Verificar permisos de Google Sheets API
curl -H "Authorization: Bearer $GOOGLE_SHEETS_API_KEY" \
  "https://sheets.googleapis.com/v4/spreadsheets/$GOOGLE_SHEETS_ID"
```

**❌ "Contactos no se actualizan"**

```bash
# Verificar búsqueda de contactos relacionados
curl -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  "https://api.hubapi.com/crm/v3/objects/contacts/search"
```

**❌ "Cupones no se generan"**

```bash
# Verificar logs de generación
tail -f logs/recompensas.log | grep "Código de cupón"
```

## 📚 Referencias

- [Google Sheets API](https://developers.google.com/sheets/api)
- [HubSpot CRM API](https://developers.hubspot.com/docs/api/crm)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Zapier CLI Documentation](https://platform.zapier.com/docs)

---

**¡Recompensas por Escasez está listo para acelerar tus ventas! 🎁**
