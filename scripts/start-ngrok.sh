#!/bin/bash

# 🚀 Script para iniciar ngrok para desarrollo de Slack

echo "🔗 Iniciando ngrok para el servidor de Slack..."
echo "🏗️ Puerto: 3000"
echo "📡 Exponiendo servidor local a internet..."
echo ""

# Ejecutar ngrok
ngrok http 3000

echo ""
echo "✅ ngrok terminado"
