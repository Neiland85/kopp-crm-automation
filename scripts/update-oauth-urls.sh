#!/bin/bash

# Script para actualizar URLs OAuth con nueva URL de ngrok
# Uso: ./scripts/update-oauth-urls.sh https://nueva-url.ngrok-free.app

if [ $# -eq 0 ]; then
    echo "❌ Error: Proporciona la nueva URL de ngrok"
    echo "Uso: $0 https://nueva-url.ngrok-free.app"
    exit 1
fi

NEW_NGROK_URL="$1"

# Remover trailing slash si existe
NEW_NGROK_URL="${NEW_NGROK_URL%/}"

echo "🔄 Actualizando URLs OAuth con: $NEW_NGROK_URL"
echo "=============================================="

# URLs específicas
INSTALL_URL="${NEW_NGROK_URL}/slack/install"
OAUTH_REDIRECT_URL="${NEW_NGROK_URL}/slack/oauth_redirect"
EVENTS_URL="${NEW_NGROK_URL}/slack/events"

echo "📝 URLs a configurar:"
echo "   • Install: $INSTALL_URL"
echo "   • OAuth Redirect: $OAUTH_REDIRECT_URL"
echo "   • Events: $EVENTS_URL"
echo ""

# Actualizar archivo oauth-ngrok-verify.js
echo "🔧 Actualizando scripts/oauth-ngrok-verify.js..."
if [ -f "scripts/oauth-ngrok-verify.js" ]; then
    sed -i.bak "s|const NGROK_URL = 'https://[^']*';|const NGROK_URL = '$NEW_NGROK_URL';|g" scripts/oauth-ngrok-verify.js
    echo "✅ oauth-ngrok-verify.js actualizado"
else
    echo "⚠️  scripts/oauth-ngrok-verify.js no encontrado"
fi

# Actualizar archivo verify-ngrok-oauth.sh
echo "🔧 Actualizando scripts/verify-ngrok-oauth.sh..."
if [ -f "scripts/verify-ngrok-oauth.sh" ]; then
    sed -i.bak "s|NGROK_URL=\"https://[^\"]*\"|NGROK_URL=\"$NEW_NGROK_URL\"|g" scripts/verify-ngrok-oauth.sh
    echo "✅ verify-ngrok-oauth.sh actualizado"
else
    echo "⚠️  scripts/verify-ngrok-oauth.sh no encontrado"
fi

# Actualizar documentación
echo "📋 Actualizando documentación..."

files_to_update=(
    "OAUTH_NGROK_SETUP_GUIDE.md"
    "OAUTH_SLACK_PROCEDIMIENTO_COMPLETO.md"
    "OAUTH_IMPLEMENTADO_READY.md"
    "DEMO_NGROK_SLACK.md"
    "NGROK_SETUP_GUIDE.md"
)

for file in "${files_to_update[@]}"; do
    if [ -f "$file" ]; then
        sed -i.bak "s|https://2bc16bb5b5dd\.ngrok\.io|$NEW_NGROK_URL|g" "$file"
        echo "✅ $file actualizado"
    else
        echo "⚠️  $file no encontrado"
    fi
done

# Comentar la actualización en oauth-app.ts (requiere revisión manual)
echo ""
echo "⚠️  REVISIÓN MANUAL REQUERIDA:"
echo "   src/slack/oauth-app.ts - Actualizar comentarios con nueva URL"
echo ""

echo "✅ ACTUALIZACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "🔧 URLs para configurar en api.slack.com:"
echo "   OAuth & Permissions > Redirect URLs:"
echo "     $OAUTH_REDIRECT_URL"
echo ""
echo "   Event Subscriptions > Request URL:"
echo "     $EVENTS_URL"
echo ""
echo "   Manage Distribution > Sharable URL:"
echo "     $INSTALL_URL"
echo ""
echo "🧪 Para probar:"
echo "   npm run oauth:start"
echo "   # Luego abrir: $INSTALL_URL"
echo ""
echo "💾 Backups creados con extensión .bak"
