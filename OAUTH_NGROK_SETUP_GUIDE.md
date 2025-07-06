# 🎯 Configuración OAuth Slack con ngrok Específico

## URL ngrok configurada: https://2bc16bb5b5dd.ngrok.io

### 📋 URLs OAuth configuradas en Slack App

En [api.slack.com](https://api.slack.com/apps) > Tu App > **OAuth & Permissions**:

#### 🔗 Redirect URLs

```
https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect
```

#### 📨 Event Subscriptions > Request URL

```
https://2bc16bb5b5dd.ngrok.io/slack/events
```

#### 🏠 Manage Distribution > Sharable URL

```
https://2bc16bb5b5dd.ngrok.io/slack/install
```

---

## 🚀 Procedimiento de OAuth Redirect URL

### 1. Ruta de Callback OAuth Configurada

Tu **OAuth Redirect URL** es el endpoint HTTP donde tu aplicación recibe el `code` que Slack envía tras autorizar la App, y desde el cual llamas a `oauth.v2.access` para intercambiar ese `code` por un token.

**URL configurada:**

```
POST https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect
```

### 2. Configuración en el Código

En `src/slack/oauth-app.ts`:

```typescript
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,

  endpoints: '/slack', // Base path
  redirectUri: '/slack/oauth_redirect', // Callback OAuth
});
```

### 3. URLs Resultantes

- **🏠 Install URL:** `https://2bc16bb5b5dd.ngrok.io/slack/install`
- **🔄 OAuth Redirect:** `https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect`
- **📨 Events URL:** `https://2bc16bb5b5dd.ngrok.io/slack/events`

---

## ⚡ Comandos de Verificación

### Verificar configuración OAuth

```bash
npm run oauth:ngrok
```

### Validar conectividad completa

```bash
npm run oauth:ngrok:verify
```

### Test rápido OAuth

```bash
npm run oauth:test
```

### Iniciar servidor OAuth

```bash
npm run dev:oauth
```

---

## 🎯 Flujo de Instalación OAuth

### Paso 1: Iniciar el servidor

```bash
npm run dev:oauth
```

### Paso 2: Abrir URL de instalación

```
https://2bc16bb5b5dd.ngrok.io/slack/install
```

### Paso 3: Autorizar la app en Slack

1. Se abre la página de autorización de Slack
2. Selecciona tu workspace
3. Acepta los permisos solicitados
4. Slack redirige a: `https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect`

### Paso 4: Probar comandos

Una vez autorizada, los comandos estarán disponibles:

- `/kop-test` - Test de conectividad
- `/kop-status` - Estado del sistema
- `/kop-leads` - Dashboard de leads
- `/kop-help` - Ayuda completa

---

## 🔧 Variables de Entorno OAuth

```bash
SLACK_CLIENT_ID=9155273277588.9155036764963
SLACK_CLIENT_SECRET=1e2ab1b362b342b47d8e62278aa8a082
SLACK_SIGNING_SECRET=6641bb0274c9b73a2196e71cf778ffe1
SLACK_STATE_SECRET=kopp-stadium-oauth-state-secret-2025
```

---

## 🛠️ Troubleshooting

### Error: "Invalid redirect_uri"

- ✅ Verifica que la URL esté exactamente configurada en Slack: `https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect`
- ✅ No debe tener barras extra ni espacios

### Error: "ngrok not accessible"

- 🔄 Reinicia ngrok: `ngrok http 3000`
- 📍 Verifica que la URL generada coincida con la configurada

### Error: "Server not responding"

- ⚡ Inicia el servidor: `npm run dev:oauth`
- 🔍 Verifica puerto: `curl http://localhost:3000/health`

### Error: "Invalid signing secret"

- 🔑 Verifica que `SLACK_SIGNING_SECRET` esté correcto en `.env`
- 🔄 Reinicia el servidor tras cambios en variables

---

## 📝 Logs y Monitoreo

### Ver logs del servidor OAuth

```bash
tail -f logs/slack-oauth.log
```

### Verificar salud del sistema

```bash
curl https://2bc16bb5b5dd.ngrok.io/health
```

### Test manual de endpoints

```bash
curl -X POST https://2bc16bb5b5dd.ngrok.io/slack/oauth_redirect
curl -X GET https://2bc16bb5b5dd.ngrok.io/slack/install
```

---

## ✅ Checklist OAuth

- [ ] ✅ Variables de entorno configuradas en `.env`
- [ ] ✅ URL ngrok activa: `https://2bc16bb5b5dd.ngrok.io`
- [ ] ✅ OAuth Redirect configurado en Slack App
- [ ] ✅ Event URL configurado en Slack App
- [ ] ✅ Install URL configurado en Slack App
- [ ] ✅ Servidor OAuth ejecutándose: `npm run dev:oauth`
- [ ] ⏳ App instalada en workspace vía `https://2bc16bb5b5dd.ngrok.io/slack/install`
- [ ] ⏳ Comandos funcionando: `/kop-test`, `/kop-status`, `/kop-leads`, `/kop-help`

---

## 🎉 OAuth Completado

Una vez completados todos los pasos, tu aplicación Slack estará completamente funcional con OAuth 2.0 usando la URL específica de ngrok configurada.

La instalación se realiza una sola vez por workspace, y los comandos quedarán disponibles permanentemente para todos los usuarios autorizados.
