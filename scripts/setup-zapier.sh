#!/bin/bash

# 🔗 Zapier Integration Setup - Optimizado para Costos
# Configuración eficiente de Zapier CLI

set -e

echo "🔗 Configurando Integración de Zapier..."

# Verificar Zapier CLI
if ! command -v zapier >/dev/null 2>&1; then
    echo "❌ Zapier CLI no instalado"
    echo "💡 Instalando Zapier CLI..."
    npm install -g zapier-platform-cli
fi

echo "✅ Zapier CLI disponible"

# Verificar autenticación
if ! zapier whoami >/dev/null 2>&1; then
    echo "⚠️  No autenticado en Zapier"
    echo "💡 Ejecuta: zapier login"
    echo "📖 Sigue las instrucciones en el navegador"
    exit 1
fi

echo "✅ Autenticado en Zapier"

# Configurar app si no existe
if [ ! -f ".zapierapprc" ]; then
    echo "🏗️  Creando nueva app Zapier..."
    
    # Crear app desde template optimizado
    zapier init kopp_crm_integration --template=node
    
    echo "📁 Estructura de app creada"
else
    echo "✅ Configuración Zapier existente encontrada"
fi

# Validar configuración actual
echo "🔍 Validando configuración..."
zapier validate

# Verificar estructura de archivos necesarios
echo "📋 Verificando estructura de triggers y actions..."

REQUIRED_FILES=(
    "triggers/newGoogleSheetsLeadScoring.js"
    "triggers/newFormSubmission.js"
    "triggers/pageView.js"
    "triggers/updatedContactProperty.js"
    "creates/hubspotContact.js"
    "creates/slackNotification.js"
    "creates/updateHubSpotExternalScore.js"
    "creates/sendHighScoreSlackAlert.js"
    "creates/sendScoringNotification.js"
    "creates/updateScoreTimestamp.js"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    else
        echo "✅ $file existe"
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo "⚠️  Archivos faltantes detectados:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo "💡 Copiando desde src/zapier/..."
    
    # Copiar archivos desde nuestra implementación TypeScript
    mkdir -p triggers creates
    
    # Convertir archivos TypeScript a JavaScript para Zapier
    if [ -d "src/zapier" ]; then
        echo "🔄 Convirtiendo archivos TypeScript..."
        
        # Compilar TypeScript temporalmente
        npm run build:zapier || npm run build
        
        if [ -d "dist/zapier" ]; then
            cp -r dist/zapier/triggers/* triggers/ 2>/dev/null || echo "⚠️  No triggers encontrados"
            cp -r dist/zapier/creates/* creates/ 2>/dev/null || echo "⚠️  No creates encontrados"
            echo "✅ Archivos copiados desde build"
        fi
    fi
fi

# Probar configuración localmente
echo "🧪 Probando configuración local..."
zapier test

# Push a desarrollo (no deployment para ahorrar recursos)
echo "📤 Subiendo código a Zapier..."
zapier push

echo "📊 Estado actual:"
zapier logs --limit=5

# Crear configuración de deployment optimizada
cat > zapier_deployment_config.json << EOF
{
  "deployment": {
    "app_name": "kopp_crm_integration",
    "version": "1.0.0",
    "triggers": [
      {
        "key": "new_google_sheets_lead_scoring",
        "name": "New Google Sheets Lead Scoring",
        "description": "Triggers when new lead scoring data is added to Google Sheets"
      },
      {
        "key": "new_form_submission", 
        "name": "New Form Submission",
        "description": "Triggers on new form submissions"
      },
      {
        "key": "page_view",
        "name": "Page View",
        "description": "Triggers on important page views"
      },
      {
        "key": "updated_contact_property",
        "name": "Updated Contact Property", 
        "description": "Triggers when contact properties are updated"
      }
    ],
    "actions": [
      {
        "key": "hubspot_contact",
        "name": "Create/Update HubSpot Contact",
        "description": "Creates or updates a contact in HubSpot"
      },
      {
        "key": "slack_notification",
        "name": "Send Slack Notification",
        "description": "Sends notification to Slack channel"
      },
      {
        "key": "update_hubspot_external_score",
        "name": "Update HubSpot External Score",
        "description": "Updates external score property in HubSpot"
      },
      {
        "key": "send_high_score_slack_alert",
        "name": "Send High Score Slack Alert", 
        "description": "Sends alert to Slack for high-scoring leads"
      }
    ],
    "setup_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "status": "configured"
  }
}
EOF

echo "💾 Configuración guardada en zapier_deployment_config.json"

echo "🎯 Próximos pasos:"
echo "1. 🌐 Ve a zapier.com/developer para configurar tu app"
echo "2. 🔧 Configura triggers y actions en la UI"
echo "3. 🧪 Crea Zaps de prueba"
echo "4. 🚀 Cuando esté listo: zapier deploy"

echo "⚠️  IMPORTANTE para ahorrar costos:"
echo "   - Solo deploy cuando esté completamente probado"
echo "   - Usa 'zapier test' para pruebas locales"
echo "   - Monitorea usage en Zapier dashboard"

echo "🎉 Configuración base de Zapier completada!"
