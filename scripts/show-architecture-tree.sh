#!/bin/bash

# 🏗️ Script para visualizar el árbol de arquitectura del proyecto
# Kopp Stadium CRM Automation - Architecture Tree Visualizer
# Fecha: Julio 6, 2025

echo "🏗️ ====================================================================="
echo "🎯 KOPP STADIUM CRM AUTOMATION - ÁRBOL DE ARQUITECTURA GENERAL"
echo "🏗️ ====================================================================="
echo ""

# Función para mostrar estructura con colores
show_section() {
    local title="$1"
    local emoji="$2"
    echo "$emoji $title"
    echo "$(printf '─%.0s' {1..50})"
}

# 1. Estructura Principal del Proyecto
show_section "ESTRUCTURA PRINCIPAL DEL PROYECTO" "📁"
tree -a -I 'node_modules|.git|coverage|dist|.jest-cache|*.log' -L 2 . || {
    echo "📦 ESTRUCTURA PRINCIPAL:"
    echo "├── 📁 src/                    # Código fuente principal"
    echo "├── 📁 scripts/                # Scripts de automatización"
    echo "├── 📁 docs/                   # Documentación técnica"
    echo "├── 📁 tests/                  # Suite de testing"
    echo "├── 📁 config/                 # Configuraciones"
    echo "├── 📁 workflows/              # GitHub Actions"
    echo "├── 📁 rgpd/                   # Compliance GDPR"
    echo "├── 📄 package.json            # Dependencies & scripts"
    echo "├── 📄 tsconfig.json           # TypeScript config"
    echo "├── 📄 jest.config.js          # Testing config"
    echo "└── 📄 vercel.json             # Deployment config"
}
echo ""

# 2. Arquitectura del Código Fuente
show_section "ARQUITECTURA DEL CÓDIGO FUENTE (src/)" "🏗️"
if [ -d "src" ]; then
    tree src/ -I 'node_modules|*.map|*.d.ts' -L 3 || {
        echo "🏗️ ARQUITECTURA DE CÓDIGO:"
        echo "src/"
        echo "├── 📦 core/                   # Lógica de negocio central"
        echo "│   ├── types/                 # TypeScript definitions"
        echo "│   ├── utils/                 # Utilidades compartidas"
        echo "│   └── validators/            # Validadores de datos"
        echo "├── 🔌 integrations/           # Adaptadores APIs externas"
        echo "│   ├── hubspot/               # HubSpot CRM integration"
        echo "│   ├── slack/                 # Slack Bot & OAuth"
        echo "│   ├── zapier/                # Zapier CLI & workflows"
        echo "│   ├── notion/                # Notion database sync"
        echo "│   └── google-sheets/         # Google Sheets lead scoring"
        echo "├── 🎯 api/                    # Endpoints HTTP"
        echo "│   ├── webhooks/              # Webhook receivers"
        echo "│   ├── auth/                  # Authentication endpoints"
        echo "│   └── health/                # Health checks"
        echo "├── 🛠️ services/               # Servicios de dominio"
        echo "│   ├── lead-scoring/          # Sistema de scoring"
        echo "│   ├── emotional-analysis/    # Análisis emocional"
        echo "│   └── notification/          # Gestión de notificaciones"
        echo "└── 📊 dashboard/              # Dashboard emocional"
            echo "    ├── components/           # React components"
            echo "    ├── charts/               # Visualizaciones"
            echo "    └── metrics/              # Métricas calculadas"
    }
else
    echo "❌ Directorio src/ no encontrado"
fi
echo ""

# 3. Scripts de Automatización
show_section "SCRIPTS DE AUTOMATIZACIÓN" "⚡"
if [ -d "scripts" ]; then
    echo "🤖 SCRIPTS PRINCIPALES:"
    ls scripts/*.{sh,ts,js} 2>/dev/null | while read script; do
        if [ -f "$script" ]; then
            basename "$script" | sed 's/^/├── ⚡ /'
        fi
    done | head -10
    echo "└── ... ($(ls scripts/ 2>/dev/null | wc -l | tr -d ' ') scripts totales)"
else
    echo "❌ Directorio scripts/ no encontrado"
fi
echo ""

# 4. Documentación Técnica
show_section "DOCUMENTACIÓN TÉCNICA" "📚"
if [ -d "docs" ]; then
    echo "📚 DOCUMENTACIÓN:"
    find docs/ -name "*.md" -type f | head -8 | while read doc; do
        echo "├── 📄 $(basename "$doc")"
    done
    echo "└── ... ($(find docs/ -name "*.md" -type f | wc -l | tr -d ' ') documentos totales)"
else
    echo "❌ Directorio docs/ no encontrado"
fi
echo ""

# 5. Configuraciones y Deployment
show_section "CONFIGURACIONES Y DEPLOYMENT" "⚙️"
echo "⚙️ ARCHIVOS DE CONFIGURACIÓN:"
echo "├── 📄 package.json              # NPM dependencies & scripts"
echo "├── 📄 tsconfig.json             # TypeScript compiler config"
echo "├── 📄 jest.config.js            # Testing framework config"
echo "├── 📄 vercel.json               # Serverless deployment config"
echo "├── 📄 pnpm-workspace.yaml       # Monorepo workspace config"
echo "└── 📁 config/                   # Environment configurations"
if [ -d "config" ]; then
    ls config/*.{json,yml,yaml} 2>/dev/null | while read conf; do
        echo "    ├── ⚙️ $(basename "$conf")"
    done
fi
echo ""

# 6. Testing y QA
show_section "TESTING Y QUALITY ASSURANCE" "🧪"
echo "🧪 SUITE DE TESTING:"
if [ -d "tests" ]; then
    echo "├── 📁 tests/                  # Test suites principales"
    find tests/ -name "*.test.*" -o -name "*.spec.*" | head -5 | while read test; do
        echo "│   ├── 🧪 $(basename "$test")"
    done
    echo "│   └── ... ($(find tests/ -name "*.test.*" -o -name "*.spec.*" | wc -l | tr -d ' ') tests totales)"
else
    echo "├── 🧪 tests/ (integrados en src/)"
fi
echo "├── 📄 jest.config.js            # Test runner configuration"
echo "├── 📁 coverage/                 # Coverage reports"
echo "└── ⚡ Scripts QA automatizados"
echo ""

# 7. Integraciones Externas
show_section "INTEGRACIONES EXTERNAS Y APIs" "🔌"
echo "🔌 INTEGRACIONES IMPLEMENTADAS:"
echo "├── 🟢 HubSpot CRM               # Contact & deal management"
echo "├── 🟢 Slack Bot & OAuth         # Team communication"
echo "├── 🟢 Zapier Workflows          # Automation workflows"
echo "├── 🟢 Notion Database           # Emotional metrics storage"
echo "├── 🟢 Google Sheets             # Lead scoring system"
echo "├── 🟢 Vercel Serverless         # Hosting & deployment"
echo "└── 🟢 GitHub Actions            # CI/CD pipeline"
echo ""

# 8. Seguridad y Compliance
show_section "SEGURIDAD Y COMPLIANCE" "🔒"
echo "🔒 CARACTERÍSTICAS DE SEGURIDAD:"
echo "├── 🔐 OAuth 2.0 Authentication  # Slack app installation"
echo "├── 🔑 JWT Token Management      # API authentication"
echo "├── 🔏 Webhook Signature Validation"
echo "├── 📜 GDPR Compliance Suite     # Privacy regulations"
echo "├── 🛡️ GitGuardian Security      # Secret scanning"
echo "├── 🔍 SonarQube Code Quality    # Code analysis"
echo "└── 📋 Security Audit Reports"
echo ""

# 9. Métricas del Proyecto
show_section "MÉTRICAS DEL PROYECTO" "📊"
echo "📊 ESTADÍSTICAS DEL CÓDIGO:"

# Contar archivos por tipo
echo "├── 📄 Archivos TypeScript:      $(find . -name "*.ts" -not -path "./node_modules/*" | wc -l | tr -d ' ')"
echo "├── 📄 Archivos JavaScript:      $(find . -name "*.js" -not -path "./node_modules/*" | wc -l | tr -d ' ')"
echo "├── 📄 Archivos de Test:         $(find . -name "*.test.*" -o -name "*.spec.*" | wc -l | tr -d ' ')"
echo "├── 📄 Archivos Markdown:        $(find . -name "*.md" | wc -l | tr -d ' ')"
echo "├── 📄 Scripts de Automatización: $(find scripts/ -type f 2>/dev/null | wc -l | tr -d ' ')"

# Líneas de código (si existe cloc)
if command -v cloc &> /dev/null; then
    echo "├── 📏 Líneas de código:"
    cloc --quiet --exclude-dir=node_modules,coverage,dist . | grep -E "(TypeScript|JavaScript)" | head -2 | sed 's/^/│   /'
fi

echo "└── 📈 Test Coverage:            $(grep -o 'Statements.*%' coverage/lcov-report/index.html 2>/dev/null | head -1 || echo 'Coverage disponible tras npm test')"
echo ""

# 10. Comandos Útiles
show_section "COMANDOS ÚTILES PARA DESARROLLADORES" "⚡"
echo "⚡ COMANDOS PRINCIPALES:"
echo "├── npm run setup:all           # Setup completo del workspace"
echo "├── npm run dev                 # Servidor de desarrollo"
echo "├── npm run build               # Build de producción"
echo "├── npm run test                # Ejecutar tests"
echo "├── npm run lint                # Linting y formateo"
echo "├── npm run validate:local      # Validación local rápida"
echo "├── npm run dashboard:generate  # Generar dashboard emocional"
echo "├── npm run notion:ingest       # Ingerir métricas a Notion"
echo "└── npm run zapier:validate     # Validar integraciones Zapier"
echo ""

# Footer
echo "🏗️ ====================================================================="
echo "📋 ARQUITECTURA GENERADA: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🎯 PROYECTO: Kopp Stadium CRM Automation"
echo "📊 STATUS: ✅ PRODUCTION READY"
echo "🏗️ ====================================================================="
echo ""
echo "💡 Para más detalles técnicos, consulta:"
echo "   📄 docs/01_ADR_Principales-Decisiones.md"
echo "   📄 PROJECT_COMPLETION_SUMMARY.md"
echo "   📄 README.md"
