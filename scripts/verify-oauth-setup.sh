#!/bin/bash

# 🔐 Script de verificación OAuth para Slack + ngrok

echo "🔐 Verificación OAuth: Slack + ngrok"
echo "====================================="
echo ""

# Colores
red() { echo -e "\033[31m$1\033[0m"; }
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
blue() { echo -e "\033[34m$1\033[0m"; }

# Contador de verificaciones
checks_passed=0
total_checks=0

# Función para verificar
check() {
    local description="$1"
    local command="$2"
    local expected="$3"
    
    total_checks=$((total_checks + 1))
    echo -n "Verificando $description... "
    
    if eval "$command" &>/dev/null; then
        green "✅ OK"
        checks_passed=$((checks_passed + 1))
    else
        red "❌ FALLO"
        if [ ! -z "$expected" ]; then
            echo "   💡 $expected"
        fi
    fi
}

# Verificaciones OAuth específicas
echo "🔐 CONFIGURACIÓN OAUTH:"
check "SLACK_CLIENT_ID configurado" "grep -q 'SLACK_CLIENT_ID=' .env && ! grep -q 'SLACK_CLIENT_ID=$' .env"
check "SLACK_CLIENT_SECRET configurado" "grep -q 'SLACK_CLIENT_SECRET=' .env && ! grep -q 'SLACK_CLIENT_SECRET=$' .env && ! grep -q 'TU_CLIENT_SECRET_AQUI' .env"
check "SLACK_STATE_SECRET configurado" "grep -q 'SLACK_STATE_SECRET=' .env && ! grep -q 'SLACK_STATE_SECRET=$' .env"
check "SLACK_SIGNING_SECRET configurado" "grep -q 'SLACK_SIGNING_SECRET=' .env && ! grep -q 'SLACK_SIGNING_SECRET=$' .env"

echo ""
echo "📂 ARCHIVOS OAUTH:"
check "OAuth app implementada" "[ -f src/slack/oauth-app-simple.ts ]"
check "OAuth dev server" "[ -f src/slack/oauth-dev-server.ts ]"
check "Documentación OAuth" "[ -f SLACK_OAUTH_SETUP_COMPLETE.md ]"

echo ""
echo "🛠️ DEPENDENCIAS:"
check "@slack/bolt instalado" "npm list @slack/bolt --depth=0"
check "Express receiver disponible" "node -e \"require('@slack/bolt').ExpressReceiver\""

echo ""
echo "📋 CONFIGURACIÓN ACTUAL:"
echo "=============================="

if [ -f .env ]; then
    echo "🆔 Client ID: $(grep SLACK_CLIENT_ID .env | cut -d'=' -f2)"
    
    if grep -q "TU_CLIENT_SECRET_AQUI" .env; then
        red "⚠️  Client Secret: NO CONFIGURADO (necesitas actualizar .env)"
        echo "   💡 Ve a https://api.slack.com/apps → Basic Information → Client Secret"
    else
        green "🔐 Client Secret: CONFIGURADO"
    fi
    
    echo "🔑 State Secret: $(grep SLACK_STATE_SECRET .env | cut -d'=' -f2 | head -c 20)..."
    echo "📍 Port: $(grep PORT .env | cut -d'=' -f2)"
else
    red "❌ Archivo .env no encontrado"
fi

echo ""
echo "🌐 URLS OAUTH (con ngrok):"
echo "=========================="
echo "📥 Install URL: https://[tu-ngrok].ngrok.io/slack/install"
echo "🔄 OAuth Redirect: https://[tu-ngrok].ngrok.io/slack/oauth_redirect"  
echo "⚡ Slack Events: https://[tu-ngrok].ngrok.io/slack/events"

echo ""
echo "📋 RESUMEN:"
echo "==========="

if [ $checks_passed -eq $total_checks ]; then
    green "🎉 ¡Configuración OAuth lista! ($checks_passed/$total_checks)"
    echo ""
    blue "🚀 PRÓXIMOS PASOS:"
    echo ""
    echo "1. Si Client Secret no está configurado:"
    yellow "   • Ve a https://api.slack.com/apps"
    yellow "   • Basic Information → Client Secret"
    yellow "   • Actualiza SLACK_CLIENT_SECRET en .env"
    echo ""
    echo "2. Ejecutar servidor OAuth:"
    yellow "   npm run dev:oauth"
    echo ""
    echo "3. En otra terminal, ejecutar ngrok:"
    yellow "   ngrok http 3000"
    echo ""
    echo "4. Configurar URLs en Slack App:"
    yellow "   • OAuth Redirect: https://[ngrok]/slack/oauth_redirect"
    yellow "   • Request URL: https://[ngrok]/slack/events"
    echo ""
    echo "5. Instalar app:"
    yellow "   • URL: https://[ngrok]/slack/install"
    echo ""
    echo "📖 Guía completa: SLACK_OAUTH_SETUP_COMPLETE.md"
else
    red "⚠️  Configuración OAuth incompleta ($checks_passed/$total_checks)"
    echo ""
    echo "🔧 Para completar:"
    echo ""
    if [ ! -f .env ]; then
        echo "• Crear archivo .env con variables OAuth"
    fi
    if ! npm list @slack/bolt --depth=0 &>/dev/null; then
        echo "• Instalar dependencias: npm install"
    fi
    if grep -q "TU_CLIENT_SECRET_AQUI" .env 2>/dev/null; then
        echo "• Configurar SLACK_CLIENT_SECRET en .env"
    fi
fi

echo ""
