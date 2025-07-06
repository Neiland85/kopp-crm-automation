# 🎯 DEMOSTRACIÓN PRÁCTICA: Setup ngrok para Slack

## ✅ Todo está listo para usar

He configurado todo lo necesario para que puedas desarrollar comandos Slack localmente con ngrok.

## 🚀 INSTRUCCIONES RÁPIDAS (2 pasos)

### **Paso 1: Abrir primera terminal y ejecutar:**

```bash
cd /Users/estudio/Projects/GitHub/MICROSERVICIOS/kopp-stadium-crm_slack-hubspot-zappier-notion/kopp-crm-automation

npm run dev:slack
```

**Deberías ver:**

```
🚀 Iniciando servidor de desarrollo para Slack Bolt...
✅ Servidor de desarrollo iniciado en puerto 3000
⚡ Slack app is running on port 3000!
```

### **Paso 2: Abrir segunda terminal y ejecutar:**

```bash
cd /Users/estudio/Projects/GitHub/MICROSERVICIOS/kopp-stadium-crm_slack-hubspot-zappier-notion/kopp-crm-automation

ngrok http 3000
```

**Deberías ver algo como:**

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### **Paso 3: Configurar en Slack**

1. Copia la URL `https://abc123.ngrok.io`
2. Ve a https://api.slack.com/apps
3. Selecciona tu app
4. Ve a "Slash Commands"
5. Para cada comando, actualiza el "Request URL" a:
   ```
   https://abc123.ngrok.io/slack/events
   ```

## 🎛️ Scripts Disponibles

```bash
# Opción 1: Scripts individuales
npm run dev:slack        # Solo servidor Slack
npm run dev:ngrok        # Solo ngrok

# Opción 2: Setup interactivo
npm run dev:slack-setup  # Te guía paso a paso

# Opción 3: Manual (como te mostré arriba)
# Terminal 1: npm run dev:slack
# Terminal 2: ngrok http 3000
```

## 🧪 Comandos para probar

Una vez configurado, prueba en Slack:

```
/kop-test     # Test básico
/kop-status   # Estado del sistema
/kop-leads    # Info de leads
/kop-help     # Ayuda
```

## 📁 Archivos creados para ti

- ✅ `scripts/start-ngrok.sh` - Script para iniciar ngrok
- ✅ `scripts/setup-slack-dev.sh` - Setup interactivo completo
- ✅ `scripts/verify-slack-setup.sh` - Verificación del setup
- ✅ `NGROK_SETUP_GUIDE.md` - Guía detallada
- ✅ `.env` actualizado con PORT=3000

## 🚨 Puntos importantes

1. **Cada vez que reinicies ngrok** (plan gratuito), la URL cambia y debes actualizarla en Slack
2. **Mantén ambas terminales abiertas** mientras desarrollas
3. **Los comandos Slack ya están implementados** en `src/slack/commands.ts`
4. **Los tests funcionan** en `src/__tests__/slack/commands.test.ts`

---

**¡Listo!** Solo ejecuta los 2 comandos arriba en terminales separadas y ya puedes desarrollar comandos Slack localmente. 🎉
