#!/bin/bash

# 🚀 Script helper para setup completo de Slack + ngrok

echo "🎯 Kopp Stadium CRM - Setup Slack + ngrok"
echo "==========================================="
echo ""

# Función para mostrar colores
red() { echo -e "\033[31m$1\033[0m"; }
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
blue() { echo -e "\033[34m$1\033[0m"; }

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    red "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar dependencias
echo "🔍 Verificando dependencias..."

if ! command -v ngrok &> /dev/null; then
    red "❌ ngrok no está instalado"
    echo "💡 Instálalo con: npm install -g ngrok"
    exit 1
fi

if [ ! -f ".env" ]; then
    red "❌ Archivo .env no encontrado"
    echo "💡 Crea un archivo .env con SLACK_BOT_TOKEN y SLACK_SIGNING_SECRET"
    exit 1
fi

green "✅ Dependencias verificadas"
echo ""

# Mostrar instrucciones
blue "📋 INSTRUCCIONES:"
echo ""
echo "Este script te ayuda a configurar el entorno de desarrollo para Slack."
echo "Necesitarás abrir 2 terminales:"
echo ""
yellow "Terminal 1: Servidor de Slack Bolt.js"
yellow "Terminal 2: ngrok para túnel público"
echo ""

read -p "🤔 ¿Quieres continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "👋 ¡Hasta luego!"
    exit 0
fi

echo ""
blue "🚀 PASO 1: Ejecutar Servidor de Slack"
echo ""
echo "Copia y ejecuta este comando en una NUEVA TERMINAL:"
echo ""
green "cd $(pwd) && npm run dev:slack"
echo ""

read -p "🤔 ¿Has ejecutado el comando anterior en otra terminal? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    yellow "⏸️  Ejecuta el comando anterior en una nueva terminal y luego ejecuta este script de nuevo"
    exit 0
fi

echo ""
blue "🚀 PASO 2: Ejecutar ngrok"
echo ""
echo "Ahora ejecutaremos ngrok en esta terminal..."
echo ""

read -p "🤔 ¿Listo para ejecutar ngrok? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "👋 ¡Hasta luego!"
    exit 0
fi

echo ""
green "🔗 Iniciando ngrok..."
echo ""
blue "📝 IMPORTANTE:"
echo "   1. Copia la URL https://abc123.ngrok.io de la salida"
echo "   2. Ve a https://api.slack.com/apps"
echo "   3. Actualiza los Request URLs de los comandos Slash"
echo "   4. Usa: https://[tu-url].ngrok.io/slack/events"
echo ""
echo "Presiona Ctrl+C para detener ngrok cuando termines"
echo ""

# Ejecutar ngrok
ngrok http 3000
