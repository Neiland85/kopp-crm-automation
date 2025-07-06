#!/bin/bash

# Script para iniciar el servidor OAuth completo
# URL ngrok configurada: https://your-ngrok-url.ngrok.io

set -e

echo "🚀 Iniciando servidor OAuth Slack completo..."
echo "============================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Cargar variables de entorno
if [ -f ".env" ]; then
    export $(cat .env | xargs)
    echo "✅ Variables .env cargadas"
else
    echo "❌ Error: Archivo .env no encontrado"
    exit 1
fi

# Verificar variables OAuth
echo "🔍 Verificando variables OAuth..."
if [ -z "$SLACK_CLIENT_ID" ] || [ -z "$SLACK_CLIENT_SECRET" ] || [ -z "$SLACK_SIGNING_SECRET" ] || [ -z "$SLACK_STATE_SECRET" ]; then
    echo "❌ Error: Variables OAuth faltantes en .env"
    echo "Requeridas: SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET, SLACK_STATE_SECRET"
    exit 1
fi

echo "✅ Variables OAuth configuradas"

# Compilar el proyecto
echo "🔧 Compilando proyecto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Proyecto compilado exitosamente"
else
    echo "❌ Error en compilación"
    exit 1
fi

# Mostrar información OAuth
echo ""
echo "🌐 Configuración OAuth:"
echo "   • NGROK URL: https://your-ngrok-url.ngrok.io"
echo "   • Install URL: https://your-ngrok-url.ngrok.io/slack/install"
echo "   • OAuth Redirect: https://your-ngrok-url.ngrok.io/slack/oauth_redirect"
echo "   • Events URL: https://your-ngrok-url.ngrok.io/slack/events"
echo ""

# Verificar si ngrok está funcionando
echo "🔍 Verificando conectividad ngrok..."
if curl -s --head "https://your-ngrok-url.ngrok.io" | head -n 1 | grep -q "200\|404"; then
    echo "✅ ngrok accesible: https://your-ngrok-url.ngrok.io"
else
    echo "⚠️  ngrok no detectado en https://your-ngrok-url.ngrok.io"
    echo "💡 Asegúrate de que ngrok esté corriendo: ngrok http 3000"
fi

echo ""

# Iniciar servidor OAuth
echo "⚡ Iniciando servidor OAuth..."
echo "   Puerto: ${PORT:-3000}"
echo "   Modo: OAuth 2.0 con ExpressReceiver"
echo ""

# Información de testing
echo "🎯 Para probar OAuth:"
echo "   1. 🌐 Abre: https://your-ngrok-url.ngrok.io/slack/install"
echo "   2. 🔐 Autoriza la app en tu workspace"
echo "   3. ⚡ Prueba los comandos:"
echo "      • /kop-test"
echo "      • /kop-status"
echo "      • /kop-leads"
echo "      • /kop-help"
echo ""

echo "🚀 Iniciando servidor..."

# Iniciar con node directo del archivo compilado
if [ -f "dist/slack/oauth-dev-server.js" ]; then
    echo "⚡ Usando archivo compilado..."
    node dist/slack/oauth-dev-server.js
elif [ -f "src/slack/oauth-dev-server.ts" ]; then
    echo "⚡ Usando TypeScript directo..."
    npx ts-node src/slack/oauth-dev-server.ts
else
    echo "❌ Error: No se encontró el servidor OAuth"
    exit 1
fi
