#!/bin/bash

# Build and deploy script for Zapier Lead Scoring Integration
# Este script compila, verifica y prepara la integración para despliegue

set -e  # Exit on any error

echo "🚀 Iniciando build y deploy de Zapier Lead Scoring Integration..."

# 1. Limpiar directorio dist
echo "🧹 Limpiando directorio de build..."
rm -rf dist/
mkdir -p dist/

# 2. Verificar variables de entorno
echo "🔐 Verificando configuración de entorno..."
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
    echo "📝 Por favor, configura las credenciales en .env antes de continuar."
    echo "Variables requeridas:"
    echo "  - GOOGLE_ACCESS_TOKEN"
    echo "  - GOOGLE_SPREADSHEET_ID"
    echo "  - HUBSPOT_API_KEY"
    echo "  - SLACK_WEBHOOK_URL"
    exit 1
fi

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# 4. Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# 5. Verificar que los archivos principales existen
echo "✅ Verificando archivos de build..."
required_files=(
    "dist/zapier/index.js"
    "dist/zapier/triggers/newGoogleSheetsLeadScoring.js"
    "dist/zapier/creates/updateHubSpotExternalScore.js"
    "dist/zapier/creates/sendHighScoreSlackAlert.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo requerido no encontrado: $file"
        exit 1
    fi
done

echo "✅ Todos los archivos de build verificados"

# 6. Ejecutar linting
echo "🔍 Ejecutando linting..."
npm run lint

# 7. Ejecutar tests básicos
echo "🧪 Ejecutando tests..."
npm test -- --passWithNoTests --testTimeout=10000

# 8. Generar documentación de build
echo "📚 Generando documentación de build..."
cat > dist/BUILD_INFO.md << EOF
# Build Information

**Build Date:** $(date)
**Node Version:** $(node --version)
**NPM Version:** $(npm --version)

## Files Generated

$(find dist/ -name "*.js" | sort)

## Integration Components

### Triggers
- \`newGoogleSheetsLeadScoring\`: Detecta nuevas filas en Google Sheets

### Actions  
- \`updateHubSpotExternalScore\`: Actualiza external_score en HubSpot
- \`sendHighScoreSlackAlert\`: Envía alertas a Slack para scores > 50

## Setup Instructions

1. Configure credentials in Zapier:
   - Google Sheets access token
   - HubSpot API key  
   - Slack webhook URL

2. Create Zap with this flow:
   Google Sheets Trigger → HubSpot Action → Slack Action

3. Test with sample data in Google Sheets
EOF

# 9. Verificar configuración de Zapier CLI (si está disponible)
if command -v zapier &> /dev/null; then
    echo "⚡ Verificando Zapier CLI..."
    
    # Verificar si está logueado
    if zapier whoami &> /dev/null; then
        echo "✅ Zapier CLI configurado correctamente"
        
        # Opcional: Validar la app
        echo "🔍 Validando app Zapier..."
        zapier validate
        
        echo "📋 Información de la app:"
        zapier describe
        
    else
        echo "⚠️  Zapier CLI no está logueado. Ejecuta 'zapier login' para continuar."
    fi
else
    echo "⚠️  Zapier CLI no está instalado. Instala con 'npm install -g zapier-platform-cli'"
fi

# 10. Generar comandos de despliegue
echo "📝 Generando comandos de despliegue..."
cat > deploy-commands.sh << 'EOF'
#!/bin/bash
# Comandos para desplegar la integración Zapier

echo "🚀 Comandos de despliegue - Zapier Lead Scoring Integration"
echo ""

echo "1. Login a Zapier (si no está hecho):"
echo "   zapier login"
echo ""

echo "2. Registrar la app (solo primera vez):"
echo "   zapier register 'Kopp Lead Scoring Integration'"
echo ""

echo "3. Push la nueva versión:"
echo "   zapier push"
echo ""

echo "4. Probar la integración:"
echo "   zapier test"
echo ""

echo "5. Promover a producción (después de testing):"
echo "   zapier promote [version]"
echo ""

echo "6. Invitar usuarios testers:"
echo "   zapier invite user@example.com"
echo ""

echo "ℹ️  Para más información: https://zapier.com/developer/documentation/v2/cli-tutorials/"
EOF

chmod +x deploy-commands.sh

# 11. Resumen final
echo ""
echo "🎉 Build completado exitosamente!"
echo ""
echo "📊 Resumen:"
echo "  ✅ TypeScript compilado"
echo "  ✅ Archivos de build verificados"
echo "  ✅ Tests ejecutados"
echo "  ✅ Linting passed"
echo "  ✅ Documentación generada"
echo ""
echo "📁 Archivos generados:"
echo "  - dist/            (código compilado)"
echo "  - dist/BUILD_INFO.md (información de build)"
echo "  - deploy-commands.sh (comandos de despliegue)"
echo ""
echo "🔄 Próximos pasos:"
echo "  1. Revisar configuración en .env"
echo "  2. Ejecutar ./deploy-commands.sh para ver comandos de despliegue"
echo "  3. Testear la integración en Zapier"
echo ""
echo "📖 Documentación completa en: docs/GOOGLE_SHEETS_LEAD_SCORING_INTEGRATION.md"
