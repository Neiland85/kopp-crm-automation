# 🚀 Setup de Comandos Slash con Bolt.js + ngrok

## 📋 Guía Paso a Paso

### 1. **Instalación de Dependencias**

```bash
# Las dependencias ya están instaladas
npm list @slack/bolt  # Verificar que está instalado
```

### 2. **Variables de Entorno**

Asegúrate de tener estas variables en tu `.env`:

```env
SLACK_BOT_TOKEN=xoxb-tu-bot-token
SLACK_SIGNING_SECRET=tu-signing-secret
PORT=3000
```

### 3. **Instalación de ngrok**

```bash
# Opción 1: Con npm (recomendado)
npm install -g ngrok

# Opción 2: Descarga directa
# Ve a https://ngrok.com/download y descarga para tu OS
```

### 4. **Ejecutar el Servidor de Desarrollo**

```bash
# Terminal 1: Ejecutar el servidor Slack Bolt
npm run dev:slack

# Terminal 2: Ejecutar ngrok (en una nueva ventana)
ngrok http 3000
```

### 5. **Configurar Slack App**

#### A. **Obtener URL de ngrok**

Después de ejecutar `ngrok http 3000`, verás algo así:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### B. **Configurar Slash Commands en Slack**

1. Ve a [https://api.slack.com/apps](https://api.slack.com/apps)
2. Selecciona tu app "Kopp Stadium"
3. Ve a **"Slash Commands"** en el menú lateral
4. Para cada comando, edita el **Request URL**:

**Comandos a configurar:**

| Comando       | Request URL                                | Descripción          |
| ------------- | ------------------------------------------ | -------------------- |
| `/kop-test`   | `https://[tu-ngrok].ngrok.io/slack/events` | Test de conectividad |
| `/kop-status` | `https://[tu-ngrok].ngrok.io/slack/events` | Estado del sistema   |
| `/kop-leads`  | `https://[tu-ngrok].ngrok.io/slack/events` | Info de leads        |
| `/kop-help`   | `https://[tu-ngrok].ngrok.io/slack/events` | Ayuda                |

#### C. **Crear Comandos (si no existen)**

Si necesitas crear los comandos desde cero:

1. En "Slash Commands", click **"Create New Command"**
2. Rellena para cada comando:

**Comando `/kop-test`:**

- Command: `/kop-test`
- Request URL: `https://[tu-ngrok].ngrok.io/slack/events`
- Short Description: `Test de conectividad del CRM`
- Usage Hint: (vacío)

**Comando `/kop-status`:**

- Command: `/kop-status`
- Request URL: `https://[tu-ngrok].ngrok.io/slack/events`
- Short Description: `Estado del sistema Kopp CRM`
- Usage Hint: (vacío)

**Comando `/kop-leads`:**

- Command: `/kop-leads`
- Request URL: `https://[tu-ngrok].ngrok.io/slack/events`
- Short Description: `Información de leads recientes`
- Usage Hint: (vacío)

**Comando `/kop-help`:**

- Command: `/kop-help`
- Request URL: `https://[tu-ngrok].ngrok.io/slack/events`
- Short Description: `Ayuda de comandos Kopp CRM`
- Usage Hint: (vacío)

### 6. **Probar los Comandos**

En tu canal de Slack `#kop-stadium-test`, prueba:

```
/kop-test
/kop-status
/kop-leads
/kop-help
```

### 7. **Scripts Disponibles**

```bash
# Iniciar servidor de desarrollo Slack
npm run dev:slack

# Test de conectividad básica
npm run slack:test

# Recordatorio para ngrok
npm run slack:ngrok
```

---

## 🔧 Troubleshooting

### **Error: "App not found"**

- Verifica que las variables `SLACK_BOT_TOKEN` y `SLACK_SIGNING_SECRET` estén correctas
- Asegúrate de que el bot esté instalado en tu workspace

### **Error: "Request URL failed"**

- Verifica que ngrok esté corriendo en el puerto 3000
- Asegúrate de usar la URL HTTPS de ngrok (no HTTP)
- Verifica que el servidor Bolt esté corriendo

### **Error: "Timeout"**

- Revisa que el puerto 3000 esté libre
- Verifica la conexión a internet
- Puede que ngrok necesite autenticación (crear cuenta gratuita)

### **Comandos no aparecen**

- Asegúrate de haber guardado los cambios en la configuración de Slack
- Puede tomar unos minutos en propagarse
- Recarga Slack o cierra y abre la aplicación

---

## 📊 Ejemplo de Salida Esperada

### Servidor iniciado correctamente

```
🚀 Iniciando servidor de desarrollo para Slack Bolt...
✅ Servidor de desarrollo iniciado en puerto 3000
⚡️ Slack Bolt app listening on port 3000

🎉 ¡Servidor Slack Bolt iniciado correctamente!

📋 Comandos disponibles:
   • /kop-test     - Test de conectividad
   • /kop-status   - Estado del sistema
   • /kop-leads    - Información de leads
   • /kop-help     - Ayuda y comandos
```

### ngrok funcionando

```
ngrok by @inconshreveable

Session Status    online
Account           tu-email@ejemplo.com (Plan: Free)
Version           2.3.40
Region            United States (us)
Web Interface     http://127.0.0.1:4040
Forwarding        http://abc123.ngrok.io -> http://localhost:3000
Forwarding        https://abc123.ngrok.io -> http://localhost:3000
```

### Comando funcionando en Slack

Al escribir `/kop-test`, deberías ver:

```
🏟️ Kopp Stadium CRM - Test Exitoso
¡Hola @tu-usuario! 👋

✅ Slash command funcionando correctamente
🎯 Backend CRM conectado
⚡ Automatizaciones activas
```

---

## 🚀 Siguiente Paso: Deployment a Producción

Una vez que funcione localmente, puedes:

1. Actualizar las URLs en Slack a tu dominio de producción
2. Integrar los comandos en tu servidor principal
3. Configurar webhooks de producción

¡Los comandos Slash están listos! 🎉
