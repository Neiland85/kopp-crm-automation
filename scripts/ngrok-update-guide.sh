#!/bin/bash

# Script de actualización de ngrok y configuración OAuth
echo "🔧 NGROK ACTUALIZADO EXITOSAMENTE"
echo "=================================="
echo ""
echo "✅ Versión anterior: 2.3.41"
echo "✅ Versión nueva: $(ngrok version | grep 'ngrok version' | cut -d' ' -f3)"
echo ""

echo "🚀 PASOS SIGUIENTES:"
echo "==================="
echo ""

echo "1. 🌐 Iniciar ngrok:"
echo "   ngrok http 3000"
echo ""

echo "2. 📋 Obtener nueva URL:"
echo "   - Se mostrará en la terminal de ngrok"
echo "   - Ejemplo: https://abc123-def456.ngrok-free.app"
echo ""

echo "3. 🔧 Actualizar URLs en Slack App (api.slack.com):"
echo "   OAuth & Permissions > Redirect URLs:"
echo "     https://TU_NUEVA_URL.ngrok-free.app/slack/oauth_redirect"
echo ""
echo "   Event Subscriptions > Request URL:"  
echo "     https://TU_NUEVA_URL.ngrok-free.app/slack/events"
echo ""
echo "   Manage Distribution > Sharable URL:"
echo "     https://TU_NUEVA_URL.ngrok-free.app/slack/install"
echo ""

echo "4. ⚡ Actualizar archivos del proyecto:"
echo "   - Editar src/slack/oauth-app.ts"
echo "   - Editar scripts/oauth-ngrok-verify.js"
echo "   - Editar documentación OAuth"
echo ""

echo "5. 🧪 Probar OAuth:"
echo "   npm run oauth:start"
echo "   # Luego abrir: https://TU_NUEVA_URL.ngrok-free.app/slack/install"
echo ""

echo "💡 NOTA: ngrok v3 usa URLs con formato 'ngrok-free.app' en lugar de 'ngrok.io'"
echo "🔄 La URL cambiará cada vez que reinicies ngrok (versión gratuita)"
