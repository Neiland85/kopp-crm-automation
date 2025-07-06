# 🚀 PROCEDIMIENTO OAUTH SLACK COMPLETO

## ✅ Configuración Verificada

### Variables de Entorno OAuth

```bash
SLACK_CLIENT_ID=9155273277588.9155036764963
SLACK_CLIENT_SECRET=1e2ab1b362b342b47d8e62278aa8a082
SLACK_SIGNING_SECRET=6641bb0274c9b73a2196e71cf778ffe1
SLACK_STATE_SECRET=kopp-stadium-oauth-state-secret-2025
SLACK_BOT_TOKEN=xoxb-9155273277588-9153065131602-mgNsZuTwQtdabsGofQA5t81F
```

### URL ngrok Configurada

```
https://2bc16bb5b5dd.ngrok.io
```

---

## 🎯 URLs OAuth para api.slack.com

### En [api.slack.com](https://api.slack.com/apps) > Tu App:

#### 1. OAuth & Permissions > Redirect URLs

```
https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect
```

#### 2. Event Subscriptions > Request URL

```
https://2bc16bb5b5dd.ngrok.io/slack/events
```

#### 3. Manage Distribution > Sharable URL

```
https://2bc16bb5b5dd.ngrok.io/slack/install
```

---

## ⚡ Flujo OAuth Explicado

### 1. ExpressReceiver Configuración

En `src/slack/oauth-app.ts`:

```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: process.env.SLACK_STATE_SECRET!,

  // 🎯 RUTAS OAUTH CRÍTICAS
  endpoints: '/slack', // Base path
  redirectUri: '/slack/oauth_redirect', // ⚡ CALLBACK CRÍTICO
});
```

### 2. Flujo de OAuth Redirect URL

#### Paso 1: Usuario inicia instalación

```
🌐 Usuario abre: https://2bc16bb5b5dd.ngrok.io/slack/install
```

#### Paso 2: Slack redirige a autorización

```
🔐 Slack muestra página de autorización del workspace
📋 Usuario acepta permisos: commands, chat:write, users:read, etc.
```

#### Paso 3: Slack envía code al callback

```
🔄 POST https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect
📦 Body: { code: "xyz123", state: "abc789" }
```

#### Paso 4: ExpressReceiver intercambia code por token

```javascript
// Automáticamente manejado por Bolt.js
const response = await slack.oauth.v2.access({
  client_id: process.env.SLACK_CLIENT_ID,
  client_secret: process.env.SLACK_CLIENT_SECRET,
  code: req.body.code,
});

// ✅ Obtiene access_token y configura la app
```

#### Paso 5: App instalada y comandos activos

```
⚡ /kop-test, /kop-status, /kop-leads, /kop-help disponibles
```

---

## 🛠️ Comandos de Setup

### Iniciar servidor OAuth

```bash
npm run dev:oauth
```

### Verificar configuración

```bash
npm run oauth:ngrok:verify
```

### Test completo

```bash
npm run oauth:test
```

---

## 🎯 Test Manual del Flujo

### 1. Iniciar servidor

```bash
# Terminal 1: Iniciar servidor OAuth
npm run dev:oauth
```

### 2. Verificar conectividad

```bash
# Terminal 2: Verificar endpoints
curl https://2bc16bb5b5dd.ngrok.io/health
curl https://2bc16bb5b5dd.ngrok.io/slack/install
```

### 3. Realizar instalación OAuth

```
🌐 Abrir en navegador: https://2bc16bb5b5dd.ngrok.io/slack/install
🔐 Autorizar en el workspace
✅ Verificar redirección exitosa
```

### 4. Probar comandos en Slack

```
/kop-test     → Test de conectividad
/kop-status   → Estado del sistema
/kop-leads    → Dashboard de leads
/kop-help     → Ayuda completa
```

---

## 🔧 Configuración en Slack App

### Basic Information

- ✅ App ID: A084XXXXXXX (automático)
- ✅ Client ID: 9155273277588.9155036764963
- ✅ Client Secret: 1e2ab1b362b342b47d8e62278aa8a082
- ✅ Signing Secret: 6641bb0274c9b73a2196e71cf778ffe1

### OAuth & Permissions

- ✅ Redirect URLs: `https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect`
- ✅ Scopes:
  - `commands` (Slash Commands)
  - `chat:write` (Send messages)
  - `users:read` (View user info)
  - `channels:read` (View channel info)
  - `im:write` (Send DMs)
  - `app_mentions:read` (Read mentions)

### Slash Commands

- ✅ `/kop-test` → `https://2bc16bb5b5dd.ngrok.io/slack/events`
- ✅ `/kop-status` → `https://2bc16bb5b5dd.ngrok.io/slack/events`
- ✅ `/kop-leads` → `https://2bc16bb5b5dd.ngrok.io/slack/events`
- ✅ `/kop-help` → `https://2bc16bb5b5dd.ngrok.io/slack/events`

### Event Subscriptions

- ✅ Request URL: `https://2bc16bb5b5dd.ngrok.io/slack/events`
- ✅ Subscribe to Bot Events:
  - `app_home_opened`
  - `app_mention`

### Manage Distribution

- ✅ Sharable URL: `https://2bc16bb5b5dd.ngrok.io/slack/install`
- ✅ Direct Install URL: Habilitado

---

## ✅ Checklist de Instalación OAuth

- [ ] 🌐 ngrok ejecutándose en `https://2bc16bb5b5dd.ngrok.io`
- [ ] ⚡ Servidor OAuth iniciado: `npm run dev:oauth`
- [ ] 🔧 URLs configuradas en api.slack.com
- [ ] 🔐 Variables OAuth en `.env`
- [ ] 📱 Comandos Slash configurados
- [ ] 🎯 Instalación via: `https://2bc16bb5b5dd.ngrok.io/slack/install`
- [ ] ✅ OAuth Redirect funcionando
- [ ] 🤖 Comandos respondiendo en Slack

---

## 🚨 Troubleshooting

### Error: "invalid_redirect_uri"

```
❌ La URL https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect no está configurada exactamente en Slack
✅ Verificar en OAuth & Permissions > Redirect URLs
```

### Error: "ngrok_not_accessible"

```
❌ ngrok no está corriendo o la URL cambió
✅ Ejecutar: ngrok http 3000
✅ Actualizar URLs en Slack si cambió
```

### Error: "server_not_responding"

```
❌ Servidor OAuth no iniciado
✅ Ejecutar: npm run dev:oauth
```

### Error: "command_not_found"

```
❌ Comandos no configurados o evento URL incorrecto
✅ Verificar Request URL: https://2bc16bb5b5dd.ngrok.io/slack/events
```

---

## 🎉 Resultado Final

Una vez completado el flujo OAuth:

1. ✅ **App instalada** en el workspace vía OAuth 2.0
2. ✅ **Comandos disponibles** para todos los usuarios
3. ✅ **Tokens gestionados automáticamente** por Bolt.js
4. ✅ **Permisos granulares** configurados
5. ✅ **Autenticación segura** con state verification

### Comandos Finales Disponibles:

- `/kop-test` - Test básico de conectividad OAuth
- `/kop-status` - Estado completo del sistema CRM
- `/kop-leads` - Dashboard de leads con métricas
- `/kop-help` - Ayuda completa de comandos

🚀 **¡OAuth 2.0 Slack completamente funcional!**
