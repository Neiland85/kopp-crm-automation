# 🔐 Setup OAuth 2.0 para Slack Commands - Kopp Stadium CRM

## 📋 Guía Completa de Configuración OAuth

Esta guía te llevará paso a paso para configurar OAuth 2.0 con Slack usando Bolt.js y ExpressReceiver.

---

## 🎯 ¿Qué es OAuth 2.0 en Slack?

OAuth 2.0 permite que tu app Slack se instale de forma segura en múltiples workspaces sin compartir tokens. El flujo funciona así:

1. **Usuario hace clic en "Add to Slack"** → Slack redirige a tu `install URL`
2. **Tu app inicia OAuth flow** → Slack muestra pantalla de permisos
3. **Usuario autoriza** → Slack envía `code` a tu `callback URL`
4. **Tu app intercambia code por token** → Obtiene acceso seguro al workspace

---

## 🔧 Configuración Completa

### **Paso 1: Variables de Entorno**

Tu archivo `.env` ya está actualizado con:

```env
SLACK_BOT_TOKEN=xoxb-1234567890-0987654321-AbCdEfGhIjKlMnOpQrStUvWx
SLACK_SIGNING_SECRET=abcd1234efgh5678ijkl9012mnop3456
SLACK_CLIENT_ID=1234567890.0987654321
SLACK_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
SLACK_STATE_SECRET=your-custom-oauth-state-secret-2025
PORT=3000
```

**🔑 Para obtener SLACK_CLIENT_SECRET:**

1. Ve a [https://api.slack.com/apps](https://api.slack.com/apps)
2. Selecciona tu app "Kopp Stadium"
3. Ve a **"Basic Information"**
4. En **"App Credentials"** → copia **"Client Secret"**
5. Reemplaza `TU_CLIENT_SECRET_AQUI` en `.env`

### **Paso 2: Rutas OAuth Configuradas**

Con ExpressReceiver, tus rutas OAuth son automáticamente:

| Función            | Ruta Local                                   | Ruta con ngrok                                 |
| ------------------ | -------------------------------------------- | ---------------------------------------------- |
| **Install URL**    | `http://localhost:3000/slack/install`        | `https://abc123.ngrok.io/slack/install`        |
| **OAuth Redirect** | `http://localhost:3000/slack/oauth_redirect` | `https://abc123.ngrok.io/slack/oauth_redirect` |
| **Slack Events**   | `http://localhost:3000/slack/events`         | `https://abc123.ngrok.io/slack/events`         |

### **Paso 3: Ejecutar Servidor OAuth**

```bash
# Opción 1: Servidor OAuth específico
npm run dev:oauth

# Opción 2: Directamente con ts-node
npx ts-node-dev src/slack/oauth-dev-server.ts
```

### **Paso 4: Setup ngrok**

```bash
# En otra terminal
ngrok http 3000
```

**Copia la URL que obtienes, ejemplo:**

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### **Paso 5: Configurar URLs en Slack App**

Ve a [https://api.slack.com/apps](https://api.slack.com/apps) → tu app:

#### **A. OAuth & Permissions**

1. Ve a **"OAuth & Permissions"**
2. En **"Redirect URLs"** → Click **"Add New Redirect URL"**
3. Añade exactamente: `https://abc123.ngrok.io/slack/oauth_redirect`
4. Click **"Save URLs"**

#### **B. Slash Commands**

1. Ve a **"Slash Commands"**
2. Para cada comando (`/kop-test`, `/kop-status`, etc.)
3. Edita **"Request URL"** a: `https://abc123.ngrok.io/slack/events`
4. **Save** cada comando

#### **C. Event Subscriptions (opcional)**

1. Ve a **"Event Subscriptions"**
2. **"Request URL"**: `https://abc123.ngrok.io/slack/events`

---

## 🚀 Proceso de Instalación OAuth

### **Opción 1: URL de Instalación Directa**

Usa esta URL para instalar tu app:

```
https://abc123.ngrok.io/slack/install
```

### **Opción 2: Botón "Add to Slack"**

En tu sitio web o documentación, puedes usar:

```html
<a href="https://abc123.ngrok.io/slack/install">
  <img
    alt="Add to Slack"
    height="40"
    width="139"
    src="https://platform.slack-edge.com/img/add_to_slack.png"
    srcset="
      https://platform.slack-edge.com/img/add_to_slack.png    1x,
      https://platform.slack-edge.com/img/add_to_slack@2x.png 2x
    "
  />
</a>
```

---

## 🧪 Testing OAuth Flow

### **1. Comandos OAuth Específicos**

Después de instalar, prueba estos comandos:

```bash
/kop-test         # Test OAuth básico
/kop-status       # Estado con info OAuth
/kop-oauth-info   # Ver configuración OAuth actual
```

### **2. Verificar Installation**

El comando `/kop-oauth-info` te mostrará:

- Client ID configurado
- URLs de instalación y redirect
- Estado de la configuración OAuth

### **3. Logs del Servidor**

Revisa los logs para ver el flujo OAuth:

```bash
# En el terminal donde corre el servidor
[SlackOAuthApp] Usuario autorizado via OAuth
[SlackOAuthApp] Comando /kop-test ejecutado via OAuth
```

---

## 🔄 Actualizar URLs (cada reinicio de ngrok)

**⚠️ IMPORTANTE:** En el plan gratuito de ngrok, la URL cambia cada reinicio.

**Script rápido de actualización:**

```bash
# 1. Obtener nueva URL de ngrok
ngrok http 3000
# Copia la nueva URL: https://nueva123.ngrok.io

# 2. Actualizar en Slack App:
# OAuth & Permissions → Redirect URLs:
https://nueva123.ngrok.io/slack/oauth_redirect

# Slash Commands → Request URL:
https://nueva123.ngrok.io/slack/events

# 3. Nueva URL de instalación:
https://nueva123.ngrok.io/slack/install
```

---

## 📋 Scripts npm Disponibles

```bash
# Servidor OAuth con ExpressReceiver
npm run dev:oauth

# Verificar configuración OAuth
npm run oauth:verify

# Setup interactivo OAuth + ngrok
npm run oauth:setup

# Solo ngrok (para usar con servidor OAuth)
npm run dev:ngrok
```

---

## 🛡️ Seguridad OAuth

### **Scopes Configurados:**

- `commands` - Para slash commands
- `chat:write` - Enviar mensajes
- `users:read` - Leer info de usuarios
- `channels:read` - Leer info de canales
- `im:write` - Mensajes directos

### **State Secret:**

- Protege contra CSRF attacks
- Configurado en: `SLACK_STATE_SECRET`

### **Client Secret:**

- Nunca expongas en código frontend
- Solo en variables de entorno del servidor

---

## 🚨 Troubleshooting OAuth

### **Error: "invalid_client_id"**

- Verifica `SLACK_CLIENT_ID` en `.env`
- Confirma que el Client ID es correcto en Slack App

### **Error: "redirect_uri_mismatch"**

- Verifica que la URL en "Redirect URLs" sea exactamente igual
- Incluye `https://` y la ruta exacta `/slack/oauth_redirect`

### **Error: "invalid_code"**

- El código OAuth expiró (típicamente 10 minutos)
- Reinicia el flujo de instalación

### **Comandos no responden:**

- Verifica que "Request URL" apunte a `/slack/events`
- Confirma que el servidor OAuth esté corriendo
- Revisa logs para errores de autenticación

---

## 🎉 Resultado Final

Una vez configurado correctamente:

✅ **App instalada** con OAuth 2.0 seguro  
✅ **Comandos funcionando** en cualquier workspace  
✅ **URLs dinámicas** fáciles de actualizar  
✅ **Instalación automatizada** para nuevos workspaces  
✅ **Tokens seguros** manejados automáticamente

**¡Tu app Slack tiene ahora OAuth 2.0 nivel empresa!** 🚀
