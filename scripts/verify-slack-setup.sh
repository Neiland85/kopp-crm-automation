#!/bin/bash

# 🔍 Script de verificación para setup de Slack + ngrok

echo "🔍 Verificación del Setup de Slack + ngrok"
echo "==========================================="
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

# Verificaciones del sistema
echo "🖥️  SISTEMA:"
check "ngrok instalado" "which ngrok"
check "Node.js disponible" "which node"
check "npm disponible" "which npm"
check "Puerto 3000 libre" "! lsof -i :3000"

echo ""
echo "📁 PROYECTO:"
check "Directorio del proyecto" "[ -f package.json ]"
check "Dependencias de Slack" "npm list @slack/bolt --depth=0"
check "TypeScript disponible" "which tsc || npm list typescript --depth=0"
check "Scripts de desarrollo" "[ -f scripts/setup-slack-dev.sh ]"

echo ""
echo "🔐 CONFIGURACIÓN:"
check "Archivo .env existe" "[ -f .env ]"
check "SLACK_BOT_TOKEN configurado" "grep -q SLACK_BOT_TOKEN .env"
check "SLACK_SIGNING_SECRET configurado" "grep -q SLACK_SIGNING_SECRET .env"
check "PORT configurado" "grep -q PORT .env"

echo ""
echo "📂 ARCHIVOS DE DESARROLLO:"
check "Servidor de desarrollo Slack" "[ -f src/slack/dev-server.ts ]"
check "Comandos Slack" "[ -f src/slack/commands.ts ]"
check "Tests de Slack" "[ -f src/__tests__/slack/commands.test.ts ]"
check "Documentación de setup" "[ -f docs/SLACK_BOLT_SETUP.md ]"

echo ""
echo "📋 RESUMEN:"
echo "==========="

if [ $checks_passed -eq $total_checks ]; then
    green "🎉 ¡Todas las verificaciones pasaron! ($checks_passed/$total_checks)"
    echo ""
    blue "🚀 LISTO PARA DESARROLLO:"
    echo ""
    echo "1. Ejecutar servidor Slack:"
    yellow "   npm run dev:slack"
    echo ""
    echo "2. En otra terminal, ejecutar ngrok:"
    yellow "   npm run dev:ngrok"
    echo ""
    echo "3. O usar el setup interactivo:"
    yellow "   npm run dev:slack-setup"
    echo ""
    echo "📖 Documentación detallada: ./NGROK_SETUP_GUIDE.md"
else
    red "⚠️  Algunas verificaciones fallaron ($checks_passed/$total_checks)"
    echo ""
    echo "🔧 Para solucionar:"
    echo ""
    if [ ! -f .env ]; then
        echo "• Crear archivo .env con las variables de Slack"
    fi
    if ! which ngrok &>/dev/null; then
        echo "• Instalar ngrok: npm install -g ngrok"
    fi
    if ! npm list @slack/bolt --depth=0 &>/dev/null; then
        echo "• Instalar dependencias: npm install"
    fi
fi

echo ""
