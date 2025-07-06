# 🧪 Slack Integration Test Script

Este script proporciona una suite completa de tests para verificar la integración con Slack en el proyecto Kopp Stadium CRM.

## 🚀 Uso Rápido

```bash
# Test básico (recomendado para desarrollo diario)
npm run slack:test

# Test completo (recomendado para QA/Production)
npm run slack:test:full

# Ejecutar directamente
node scripts/slack-test.js [tipo-de-test]
```

## 📋 Tipos de Test Disponibles

### 🔹 Tests Básicos

```bash
# Test simple (auth + mensaje básico)
npm run slack:test:simple
node scripts/slack-test.js simple

# Solo autenticación
node scripts/slack-test.js auth

# Solo mensaje básico
node scripts/slack-test.js message
```

### 🔹 Tests Avanzados

```bash
# Suite completa
npm run slack:test:full
node scripts/slack-test.js comprehensive

# Mensaje enriquecido con blocks
node scripts/slack-test.js rich

# Listar canales
node scripts/slack-test.js channels

# Información de usuario
node scripts/slack-test.js user
```

## ⚙️ Configuración Requerida

### Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env`:

```bash
# Requerido
SLACK_BOT_TOKEN=xoxb-your-bot-token-here

# Opcional (por defecto: #integration-test)
SLACK_TEST_CHANNEL=#integration-test
```

### Configuración del Bot en Slack

Tu bot necesita los siguientes permisos OAuth:

- `chat:write` - Para enviar mensajes
- `channels:read` - Para listar canales
- `users:read` - Para obtener información de usuarios
- `chat:write.public` - Para escribir en canales públicos

## 📊 Qué Tests se Ejecutan

### Test Simple (por defecto)

- ✅ Autenticación con Slack API
- ✅ Envío de mensaje básico

### Test Comprehensive

- ✅ Autenticación con Slack API
- ✅ Envío de mensaje básico
- ✅ Envío de mensaje enriquecido con Slack Blocks
- ✅ Respuesta en hilo (thread)
- ✅ Listado de canales
- ✅ Información del usuario/bot

## 🎯 Ejemplos de Salida

### ✅ Test Exitoso

```
🚀 SIMPLE SLACK TEST
ℹ️  Testing Slack authentication...
✅ Authenticated as: kopp-stadium-bot in team: Kopp Stadium
ℹ️  Sending test message to #integration-test...
✅ Message sent successfully! Timestamp: 1234567890.123456
✅ Simple test completed successfully!
```

### ❌ Test Fallido

```
🚀 SIMPLE SLACK TEST
ℹ️  Testing Slack authentication...
❌ Authentication failed: invalid_auth
SLACK_BOT_TOKEN environment variable is required
Please set SLACK_BOT_TOKEN in your .env file
```

## 🔧 Troubleshooting

### Error: `invalid_auth`

- Verifica que `SLACK_BOT_TOKEN` esté configurado correctamente
- Asegúrate de que el token comience con `xoxb-`

### Error: `channel_not_found`

- Verifica que el canal `#integration-test` exista
- O configura `SLACK_TEST_CHANNEL` con un canal válido

### Error: `missing_scope`

- Revisa los permisos OAuth del bot en Slack
- Reinstala la app si es necesario

## 🎮 Integración con CI/CD

Puedes usar este script en tus pipelines:

```yaml
# GitHub Actions
- name: Test Slack Integration
  run: npm run slack:test:simple
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

```bash
# En tu pipeline local
npm run slack:test:simple && echo "Slack OK" || exit 1
```

## 🔗 Scripts Relacionados

- `npm run setup:slack` - Configuración inicial de Slack
- `npm run test:integration` - Tests de integración completos
- `npm run qa:local` - QA local que incluye test de Slack

## 📚 Referencias

- [Slack Web API](https://api.slack.com/web)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [OAuth Scopes](https://api.slack.com/scopes)
