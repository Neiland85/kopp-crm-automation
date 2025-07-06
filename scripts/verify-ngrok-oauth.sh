#!/bin/bash

# Script para verificar la configuración OAuth con ngrok específico
# URL configurada: https://2bc16bb5b5dd.ngrok.io

set -e

echo "🔍 Verificando configuración OAuth con ngrok..."
echo "================================================"

# Variables de configuración
NGROK_URL="https://2bc16bb5b5dd.ngrok.io"
LOCAL_PORT="${PORT:-3000}"

echo "📍 NGROK URL configurada: $NGROK_URL"
echo "🔌 Puerto local: $LOCAL_PORT"
echo ""

# Verificar variables de entorno OAuth
echo "📋 Verificando variables de entorno OAuth:"

if [ -z "$SLACK_CLIENT_ID" ]; then
    echo "❌ SLACK_CLIENT_ID no configurado"
    exit 1
else
    echo "✅ SLACK_CLIENT_ID: ${SLACK_CLIENT_ID:0:10}..."
fi

if [ -z "$SLACK_CLIENT_SECRET" ]; then
    echo "❌ SLACK_CLIENT_SECRET no configurado"
    exit 1
else
    echo "✅ SLACK_CLIENT_SECRET: ${SLACK_CLIENT_SECRET:0:8}..."
fi

if [ -z "$SLACK_SIGNING_SECRET" ]; then
    echo "❌ SLACK_SIGNING_SECRET no configurado"
    exit 1
else
    echo "✅ SLACK_SIGNING_SECRET: ${SLACK_SIGNING_SECRET:0:8}..."
fi

if [ -z "$SLACK_STATE_SECRET" ]; then
    echo "❌ SLACK_STATE_SECRET no configurado"
    exit 1
else
    echo "✅ SLACK_STATE_SECRET: ${SLACK_STATE_SECRET:0:8}..."
fi

echo ""

# URLs OAuth configuradas
echo "🌐 URLs OAuth configuradas para Slack:"
echo "   • 🏠 Install URL: $NGROK_URL/slack/install"
echo "   • 🔄 OAuth Redirect URL: $NGROK_URL/slack/oauth_redirect"
echo "   • 📨 Events URL: $NGROK_URL/slack/events"
echo ""

# Verificar conectividad local
echo "🔍 Verificando servidor local..."
if curl -s "http://localhost:$LOCAL_PORT/health" > /dev/null 2>&1; then
    echo "✅ Servidor local funcionando en puerto $LOCAL_PORT"
else
    echo "⚠️  Servidor local no detectado. Iniciando..."
    echo "💡 Ejecuta: npm run dev:oauth"
fi

echo ""

# Verificar conectividad ngrok
echo "🔍 Verificando conectividad ngrok..."
if curl -s --head "$NGROK_URL" | head -n 1 | grep -q "200 OK"; then
    echo "✅ ngrok funcionando: $NGROK_URL"
else
    echo "❌ ngrok no accesible: $NGROK_URL"
    echo "💡 Verifica que ngrok esté corriendo:"
    echo "   ngrok http $LOCAL_PORT"
    exit 1
fi

echo ""

# URLs para configurar en Slack App
echo "⚙️  URLs para configurar en api.slack.com:"
echo "==========================================="
echo ""
echo "🔗 OAuth & Permissions > Redirect URLs:"
echo "   $NGROK_URL/slack/oauth_redirect"
echo ""
echo "📨 Event Subscriptions > Request URL:"
echo "   $NGROK_URL/slack/events"
echo ""
echo "🏠 Manage Distribution > Sharable URL:"
echo "   $NGROK_URL/slack/install"
echo ""

# Comandos útiles
echo "🛠️  Comandos útiles:"
echo "=================="
echo ""
echo "• Iniciar servidor OAuth:"
echo "  npm run dev:oauth"
echo ""
echo "• Verificar OAuth setup:"
echo "  npm run oauth:verify"
echo ""
echo "• Probar comandos Slack:"
echo "  npm run slack:verify"
echo ""
echo "• Ver logs en tiempo real:"
echo "  tail -f logs/slack-oauth.log"
echo ""

# Test de URL de instalación
echo "🎯 Test de instalación OAuth:"
echo "============================"
echo ""
echo "1. 🌐 Abre en tu navegador:"
echo "   $NGROK_URL/slack/install"
echo ""
echo "2. 🔐 Autoriza la app en tu workspace"
echo ""
echo "3. ⚡ Prueba los comandos:"
echo "   /kop-test"
echo "   /kop-status"
echo "   /kop-leads"
echo "   /kop-help"
echo ""

echo "✅ Verificación OAuth completa!"
echo ""
echo "🚀 ¡Listo para probar el flujo OAuth completo!"
