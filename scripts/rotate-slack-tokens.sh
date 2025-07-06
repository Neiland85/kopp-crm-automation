#!/bin/bash

# 🔒 Script de Rotación de Tokens Slack - Post GitGuardian Alert
# Ejecutar después de haber removido tokens hardcodeados

echo "🔒 ROTACIÓN DE TOKENS SLACK POST-GITGUARDIAN"
echo "============================================"
echo ""

echo "⚠️  TOKENS COMPROMETIDOS DETECTADOS POR GITGUARDIAN"
echo "   Token expuesto: xoxb-9155273277588-*"
echo "   Client ID expuesto: 9155273277588.9155036764963"
echo ""

echo "📋 PASOS OBLIGATORIOS DE ROTACIÓN:"
echo "=================================="
echo ""

echo "1. 🌐 Ve a https://api.slack.com/apps"
echo "   - Selecciona tu aplicación Slack"
echo ""

echo "2. 🔑 ROTAR BOT TOKEN:"
echo "   OAuth & Permissions > Bot User OAuth Token"
echo "   - Haz clic en 'Regenerate'"
echo "   - Copia el NUEVO token (xoxb-***)"
echo ""

echo "3. 🔐 ROTAR CLIENT SECRET:"
echo "   Basic Information > App Credentials"
echo "   - Client Secret > 'Regenerate'"
echo "   - Copia el NUEVO Client Secret"
echo ""

echo "4. 🔒 ROTAR SIGNING SECRET:"
echo "   Basic Information > App Credentials"
echo "   - Signing Secret > 'Regenerate'"  
echo "   - Copia el NUEVO Signing Secret"
echo ""

echo "5. 📝 ACTUALIZAR .env LOCAL:"
echo "   Edita tu archivo .env con los NUEVOS valores:"
echo ""
echo "   SLACK_BOT_TOKEN=xoxb-[NUEVO_TOKEN]"
echo "   SLACK_CLIENT_SECRET=[NUEVO_CLIENT_SECRET]"
echo "   SLACK_SIGNING_SECRET=[NUEVO_SIGNING_SECRET]"
echo "   # CLIENT_ID se mantiene igual"
echo ""

echo "6. 🧪 VALIDAR OAUTH:"
echo "   npm run oauth:start"
echo "   # Probar comandos: /kop-test, /kop-status"
echo ""

echo "7. ✅ CONFIRMAR SEGURIDAD:"
echo "   - Tokens anteriores invalidados"
echo "   - Nuevos tokens funcionando"
echo "   - GitGuardian alerts resueltas"
echo ""

echo "🛡️ ESTADO ACTUAL:"
echo "=================="
echo "✅ Documentación sanitizada"
echo "✅ Tokens ficticios en docs"  
echo "✅ Commit de seguridad aplicado"
echo "⏳ Tokens pendientes de rotación"
echo ""

echo "⚡ EJECUTAR ROTACIÓN AHORA:"
echo "1. Abrir: https://api.slack.com/apps"
echo "2. Regenerar todos los tokens"
echo "3. Actualizar .env local"
echo "4. Probar OAuth: npm run oauth:start"
echo ""

echo "🔐 ¡ROTACIÓN CRÍTICA PARA SEGURIDAD!"
