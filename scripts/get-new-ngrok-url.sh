#!/bin/bash

# Script para obtener la nueva URL de ngrok después de la actualización
echo "🚀 Iniciando ngrok para obtener nueva URL..."
echo "==========================================="

# Iniciar ngrok en background
ngrok http 3000 --log=stdout &
NGROK_PID=$!

# Esperar 5 segundos para que ngrok se conecte
echo "⏳ Esperando conexión ngrok..."
sleep 5

# Obtener la URL pública de ngrok
echo "🔍 Obteniendo URL pública de ngrok..."
NEW_NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | cut -d'"' -f4 | head -1)

if [ -n "$NEW_NGROK_URL" ]; then
    echo "✅ Nueva URL ngrok obtenida: $NEW_NGROK_URL"
    echo ""
    echo "🔧 URLs OAuth actualizadas:"
    echo "   • Install URL: ${NEW_NGROK_URL}/slack/install"
    echo "   • OAuth Redirect: ${NEW_NGROK_URL}/slack/oauth_redirect"
    echo "   • Events URL: ${NEW_NGROK_URL}/slack/events"
    echo ""
    echo "📋 Configura estas URLs en https://api.slack.com/apps"
    echo ""
    echo "⚠️  IMPORTANTE: Actualiza las URLs en Slack App:"
    echo "   1. OAuth & Permissions > Redirect URLs: ${NEW_NGROK_URL}/slack/oauth_redirect"
    echo "   2. Event Subscriptions > Request URL: ${NEW_NGROK_URL}/slack/events"
    echo "   3. Manage Distribution > Sharable URL: ${NEW_NGROK_URL}/slack/install"
else
    echo "❌ No se pudo obtener la URL de ngrok"
    echo "💡 Verifica que ngrok esté corriendo en http://localhost:4040"
fi

# Mantener ngrok corriendo
echo ""
echo "🚀 ngrok está corriendo en background (PID: $NGROK_PID)"
echo "🔄 Para detenerlo: kill $NGROK_PID"
echo "📊 Dashboard ngrok: http://localhost:4040"
