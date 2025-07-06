# 🚀 Guía Práctica: Setup ngrok + Slack Commands

## ✅ Estado Actual

- ✅ ngrok está instalado
- ✅ Variables de entorno configuradas en `.env`
- ✅ Servidor de desarrollo de Slack listo
- ✅ Comandos Slack implementados

## 📋 Instrucciones Paso a Paso

### **Paso 1: Ejecutar el Servidor de Slack**

Abre una **primera terminal** y ejecuta:

```bash
cd /Users/estudio/Projects/GitHub/MICROSERVICIOS/kopp-stadium-crm_slack-hubspot-zappier-notion/kopp-crm-automation

# Opción A: Con npm script
npm run dev:slack

# Opción B: Directamente con ts-node-dev
npx ts-node-dev --respawn --transpile-only src/slack/dev-server.ts
```

**Deberías ver algo así:**

```
🚀 Iniciando servidor de desarrollo para Slack Bolt...
✅ Servidor de desarrollo iniciado en puerto 3000
🎉 ¡Servidor Slack Bolt iniciado correctamente!
⚡ Slack app is running on port 3000!
```

### **Paso 2: Ejecutar ngrok (Segunda Terminal)**

Abre una **segunda terminal** (nueva ventana/pestaña) y ejecuta:

```bash
cd /Users/estudio/Projects/GitHub/MICROSERVICIOS/kopp-stadium-crm_slack-hubspot-zappier-notion/kopp-crm-automation

# Opción A: Con script helper
./scripts/start-ngrok.sh

# Opción B: Directamente
ngrok http 3000
```

**Deberías ver algo así:**

```
ngrok

Session Status     online
Account            tu-email@ejemplo.com (Plan: Free)
Version            3.x.x
Region             United States (us)
Latency            45ms
Web Interface      http://127.0.0.1:4040
Forwarding         https://abc123.ngrok.io -> http://localhost:3000

Connections        ttl     opn     rt1     rt5     p50     p90
                   0       0       0.00    0.00    0.00    0.00
```

### **Paso 3: Copiar la URL de ngrok**

De la salida de ngrok, copia la URL `https://abc123.ngrok.io`

**⚠️ IMPORTANTE:** Esta URL cambia cada vez que reinicias ngrok (en el plan gratuito)

### **Paso 4: Configurar Comandos en Slack**

1. Ve a [https://api.slack.com/apps](https://api.slack.com/apps)
2. Selecciona tu app "Kopp Stadium"
3. Ve a **"Slash Commands"** en el menú lateral
4. Para cada comando existente, edita el **Request URL** a:
   ```
   https://[tu-ngrok-url].ngrok.io/slack/events
   ```

### **Paso 5: Probar los Comandos**

En tu workspace de Slack, prueba:

```
/kop-test
/kop-status
/kop-leads
/kop-help
```

## 🔧 Comandos Útiles

### **Verificar que el servidor está corriendo:**

```bash
lsof -i :3000
curl http://localhost:3000/health
```

### **Ver logs en tiempo real:**

```bash
tail -f logs/app.log
```

### **Detener los servicios:**

- **Slack Server:** `Ctrl+C` en la primera terminal
- **ngrok:** `Ctrl+C` en la segunda terminal

## 🚨 Troubleshooting

### **Si el servidor no inicia:**

```bash
# Verificar dependencias
npm list @slack/bolt

# Limpiar y reinstalar
npm run clean
npm install
```

### **Si ngrok no funciona:**

```bash
# Verificar instalación
which ngrok
ngrok version

# Autenticar (si es necesario)
ngrok authtoken TU_TOKEN
```

### **Si los comandos no responden:**

1. Verificar que ambos servicios estén corriendo
2. Comprobar que la URL de ngrok esté actualizada en Slack
3. Revisar logs en ambas terminales

## 📱 URLs de Administración

- **Slack App:** https://api.slack.com/apps
- **ngrok Dashboard:** http://127.0.0.1:4040 (cuando ngrok esté corriendo)
- **Health Check Local:** http://localhost:3000/health

---

**¡Listo!** Una vez que tengas ambos servicios corriendo y la configuración actualizada en Slack, los comandos deberían funcionar perfectamente.
