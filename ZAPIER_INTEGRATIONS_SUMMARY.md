# 🎯 Zapier CLI Integrations - Resumen Completo

## Integraciones Implementadas

### 1. 🎯 **Reputómetro Invisible**

**Ubicación**: `src/zaps/reputometro/`

- **Función**: Cron job que ejecuta cada 5 minutos
- **Consulta**: HubSpot por contacts con `last_submission_date ≥ now - 1h`
- **Cálculo**: `lead_influence_score = views * 0.5 + submissions * 2`
- **Acción**: Actualiza HubSpot y envía stats a Slack `#scoring-leads`
- **Scripts**: `npm run reputometro:test`, `npm run reputometro:logs`

### 2. 🚨 **Hot Leads Detection**

**Ubicación**: `src/zaps/hot-leads/`

- **Trigger**: HubSpot webhook en `lead_influence_score > 40`
- **Acción**: Actualiza `lead_status = 'Hot Lead'` en HubSpot
- **Notificación**: Alerta inmediata a Slack `#hot-leads`
- **Scripts**: `npm run hot-leads:test`, `npm run hot-leads:logs`

### 3. 🎁 **Recompensas por Escasez**

**Ubicación**: `src/zaps/recompensas-escasez/`

- **Trigger**: Google Sheets webhook en `stock_remaining ≤ 20`
- **Acción**: Actualiza `recompensa_emocional = 'Oferta especial'` en HubSpot
- **Cupones**: Genera códigos únicos (15%-25% descuento según urgencia)
- **Notificación**: Envía cupón a Slack `#scoring-leads`
- **Scripts**: `npm run recompensas:test`, `npm run recompensas:logs`

### 4. 💫 **Dropout Positivo** _(NUEVO)_

**Ubicación**: `src/zaps/dropout-positivo/`

- **Trigger**: HubSpot webhook en `last_engagement_date < now - 7 days`
- **Acción**: Incrementa `lead_influence_score += 30` en HubSpot
- **Notificación**: Alerta de reactivación a Slack `#auditoria-sagrada`
- **Scripts**: `npm run dropout:test`, `npm run dropout:logs`, `npm run dropout:validate`
- **Tests**: Mocha/Chai con nock para mocking de APIs

## 📁 Estructura de Archivos

```
src/zaps/
├── reputometro/
│   ├── index.ts          # Cron job + configuración
│   ├── handler.ts        # Lógica principal
│   └── README.md         # Documentación
├── hot-leads/
│   ├── index.ts          # Webhook HubSpot + trigger
│   ├── handler.ts        # Lógica de hot leads
│   └── README.md         # Documentación
├── recompensas-escasez/
│   ├── index.ts          # Webhook Google Sheets + trigger
│   ├── handler.ts        # Lógica de recompensas
│   └── README.md         # Documentación
└── dropout-positivo/     # NUEVO
    ├── index.ts          # Webhook HubSpot + trigger
    ├── handler.ts        # Lógica de dropout positivo
    └── README.md         # Documentación

src/scripts/              # NUEVO
└── dailyReport.ts        # Reporte diario de scoring con node-cron
## 📊 Scripts Adicionales

### 5. 📈 **Daily Report** *(NUEVO)*

**Ubicación**: `src/scripts/dailyReport.ts`

- **Función**: Cron job que ejecuta cada día 08:00 CET
- **Consulta**: HubSpot para obtener top 10 `lead_influence_score`
- **Genera**: Archivo `reports/{{YYYY-MM-DD}}.md` con tabla Markdown
- **Scripts**: `npm run daily-report:generate`, `npm run daily-report:start`
- **Formato**: Tabla con Pos, Email, Score, Nombre, Empresa

## 📁 Estructura de Archivos Completa

```

src/zaps/
├── reputometro/
│ ├── index.ts # Cron job + configuración
│ ├── handler.ts # Lógica principal
│ └── README.md # Documentación
├── hot-leads/
│ ├── index.ts # Webhook HubSpot + trigger
│ ├── handler.ts # Lógica de hot leads
│ └── README.md # Documentación
├── recompensas-escasez/
│ ├── index.ts # Webhook Google Sheets + trigger
│ ├── handler.ts # Lógica de recompensas
│ └── README.md # Documentación
└── dropout-positivo/ # NUEVO
├── index.ts # Webhook HubSpot + trigger
├── handler.ts # Lógica de dropout positivo
└── README.md # Documentación

src/scripts/ # NUEVO
└── dailyReport.ts # Reporte diario de scoring con node-cron

tests/zaps/
├── reputometro.test.ts
├── hot-leads/
│ └── hot-leads.test.ts
├── recompensas-escasez/
│ └── recompensas-escasez.test.ts
└── dropout-positivo/ # NUEVO - Tests con Mocha/Chai + nock
└── dropout-positivo.test.ts

logs/
├── reputometro.log # Logs del cron job
├── hot_leads.log # Logs de detección
├── recompensas.log # Logs de recompensas
└── dropout.log # NUEVO - Logs de dropout positivo

reports/ # NUEVO - Reportes diarios
├── 2025-06-29.md # Reporte Markdown
├── 2025-06-29.json # Reporte JSON
└── ...

scripts/
├── test-reputometro.js
├── test-hot-leads.js
├── test-recompensas-escasez.js
└── test-dropout-positivo.js # NUEVO

````

## ⚙️ Variables de Entorno

```bash
# APIs Core
HUBSPOT_API_KEY=your-hubspot-api-key
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Google Sheets (para Recompensas)
GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key
GOOGLE_SHEETS_ID=your-spreadsheet-id

# Configuración Reputómetro
REPUTOMETRO_ENABLED=true
REPUTOMETRO_CRON_SCHEDULE=*/5 * * * *
REPUTOMETRO_TIMEZONE=America/Mexico_City

# Configuración Hot Leads
HOT_LEADS_ENABLED=true
HOT_LEAD_THRESHOLD=40

# Configuración Recompensas
RECOMPENSAS_ESCASEZ_ENABLED=true
STOCK_THRESHOLD=20

# Configuración Dropout Positivo (NUEVO)
DROPOUT_POSITIVO_ENABLED=true
DROPOUT_THRESHOLD_DAYS=7
DROPOUT_SCORE_BOOST=30

# Configuración Daily Report (NUEVO)
DAILY_REPORT_ENABLED=true
DAILY_REPORT_TIMEZONE=Europe/Madrid
````

## 🚀 Scripts NPM Disponibles

### Tests Individuales

```bash
npm run reputometro:validate    # Tests del Reputómetro
npm run hot-leads:validate      # Tests de Hot Leads
npm run recompensas:validate    # Tests de Recompensas
npm run dropout:validate        # Tests de Dropout Positivo (NUEVO)
npm run zaps:test-all          # Todos los tests
```

### Tests Manuales

```bash
npm run reputometro:test       # Test manual Reputómetro
npm run hot-leads:test         # Test manual Hot Leads
npm run recompensas:test       # Test manual Recompensas
npm run dropout:test           # Test manual Dropout Positivo (NUEVO)
```

### Monitoreo de Logs

```bash
npm run reputometro:logs       # Ver logs en tiempo real
npm run hot-leads:logs         # Ver logs en tiempo real
npm run recompensas:logs       # Ver logs en tiempo real
npm run dropout:logs           # Ver logs Dropout Positivo (NUEVO)
```

### Reportes Diarios (NUEVO)

```bash
npm run daily-report:generate  # Generar reporte manual
npm run daily-report:start     # Iniciar cron job diario
npm run daily-report:logs      # Ver último reporte generado
```

## 🎯 Flujos de Datos

### Reputómetro Invisible (Cron)

```
[Cron 5min] → [Query HubSpot] → [Calc Scores] → [Update HubSpot] → [Slack Report]
```

### Hot Leads Detection (Webhook)

```
[HubSpot Score Change] → [Webhook] → [Validate Threshold] → [Update Status] → [Slack Alert]
```

### Recompensas por Escasez (Webhook)

```
[Google Sheets Stock] → [Webhook] → [Generate Coupon] → [Update HubSpot] → [Slack Coupon]
```

## 📊 Mensajes de Slack

### Reputómetro

```
⚡ *Reputómetro Invisible*
📊 Total: 15 leads procesados
🏆 Top 3: juan@example.com, maria@example.com, carlos@example.com
📈 Score medio: 24.5
```

### Hot Leads

```
🚨 *Hot Lead Detectado*
Usuario: juan@example.com
Score: 35 → 45
Acción: Seguimiento inmediato
[👀 Ver en HubSpot] [📞 Contactar Ahora]
```

### Recompensas por Escasez

```
🎁 *Recompensa Emocional* 🚨
Producto: Jersey Kopp Stadium Edición Limitada
Stock restante: 15 unidades
💎 *¡ÚLTIMAS UNIDADES! 25% OFF*
Código: URGENTJERS123456
[📧 Enviar Cupones] [📊 Ver Stock]
```

## 🔧 Características Técnicas

### ✅ Implementadas en Todas

- **TypeScript**: Tipado completo
- **Zapier CLI**: Integración nativa
- **Exponential Backoff**: Reintentos automáticos
- **Structured Logging**: Logs específicos por módulo
- **Jest Testing**: Cobertura completa con mocks
- **Error Handling**: Manejo robusto de errores
- **Environment Config**: Variables configurables

### ✅ APIs Integradas

- **HubSpot API Client**: `@hubspot/api-client`
- **Slack WebClient**: `@slack/web-api`
- **Google Sheets**: Via API REST
- **Node Cron**: `node-cron` para scheduling

## 🎭 Deployment Zapier

### Configuración

```bash
# Validar todas las integraciones
zapier validate

# Ejecutar tests
zapier test

# Deploy a Zapier
zapier push

# Promover a producción
zapier promote
```

### Zaps Configurables

```typescript
// Cada integración exporta su configuración
export const reputometroZap = { key: 'reputometro_invisible', ... };
export const hotLeadsZap = { key: 'hot_leads_detection', ... };
export const recompensasEscasezZap = { key: 'recompensas_escasez', ... };
```

## 🏆 Beneficios del Sistema

### Automatización Completa

- **Detección**: Automática de oportunidades y urgencias
- **Notificación**: Inmediata a equipos relevantes
- **Seguimiento**: Logs y métricas detalladas
- **Escalabilidad**: Procesamiento de miles de eventos

### Integración Perfecta

- **HubSpot**: CRM central con datos actualizados
- **Slack**: Comunicación en tiempo real
- **Google Sheets**: Gestión de inventario
- **Zapier**: Orquestación de flujos

### ROI Medible

- **Conversión Rápida**: Respuesta inmediata a hot leads
- **Rotación de Inventario**: Cupones por escasez
- **Eficiencia Operativa**: Automatización de procesos manuales
- **Insights Accionables**: Métricas en tiempo real

## 🚀 Próximos Pasos

### Para Producción

1. **Configurar Variables**: Completar `.env` con credenciales reales
2. **Setup Webhooks**: Configurar en HubSpot y Google Sheets
3. **Deploy Zapier**: Subir integraciones a la plataforma
4. **Monitoreo**: Configurar alertas de logs
5. **Testing**: Validar en ambiente staging

### Para Expansión

- **Nuevos Triggers**: Más eventos de HubSpot/Sheets
- **Machine Learning**: Scoring predictivo avanzado
- **Multi-Channel**: SMS, Email, WhatsApp
- **Analytics**: Dashboard de métricas en tiempo real

---

**🎉 ¡Sistema completo de automatización CRM listo para producción! 🚀**

**Total**: 3 integraciones + tests + documentación + scripts = **Ecosistema completo**
