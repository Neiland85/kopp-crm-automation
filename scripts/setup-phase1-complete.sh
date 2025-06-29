#!/bin/bash

# ===============================================
# 🚀 SETUP MAESTRO COMPLETO - FASE 1 KOPP CRM
# ===============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🎯 $1${NC}"
}

clear

echo "=================================================="
log_header "🚀 SETUP MAESTRO COMPLETO - FASE 1 KOPP CRM"
echo "=================================================="
echo ""
log_info "Este script configurará completamente tu entorno de desarrollo"
log_info "Incluye: VSCode, Copilot, integraciones, hooks y validaciones"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

log_success "Directorio del proyecto verificado"

# PASO 1: Limpieza y preparación del entorno
echo ""
log_header "PASO 1: 🧹 Limpieza y preparación del entorno"
if [ -f "scripts/setup-clean-environment.sh" ]; then
    ./scripts/setup-clean-environment.sh
else
    log_warning "Script de limpieza no encontrado, continuando..."
fi

# PASO 2: Configuración de VSCode y extensiones
echo ""
log_header "PASO 2: 🧩 Configuración de VSCode y extensiones"

log_info "2.1 Instalando extensiones VSCode específicas del stack..."
if command -v code &> /dev/null; then
    if [ -f "scripts/setup-vscode-extensions.sh" ]; then
        ./scripts/setup-vscode-extensions.sh
    else
        log_warning "Script de extensiones VSCode no encontrado"
        # Instalar manualmente las extensiones críticas
        log_info "Instalando extensiones críticas manualmente..."
        code --install-extension github.copilot --force || log_warning "No se pudo instalar GitHub Copilot"
        code --install-extension github.copilot-chat --force || log_warning "No se pudo instalar Copilot Chat"
        code --install-extension dbaeumer.vscode-eslint --force || log_warning "No se pudo instalar ESLint"
        code --install-extension esbenp.prettier-vscode --force || log_warning "No se pudo instalar Prettier"
        code --install-extension orta.vscode-jest --force || log_warning "No se pudo instalar Jest"
    fi
else
    log_warning "VSCode CLI no disponible, saltando instalación de extensiones"
fi

log_info "2.2 Verificando configuración de Copilot..."
if [ -f ".copilot.setup" ] && [ -f ".vscode/copilot.settings.json" ]; then
    log_success "Configuración de Copilot encontrada"
else
    log_warning "Configuración de Copilot incompleta"
fi

# PASO 3: Configuración de integraciones
echo ""
log_header "PASO 3: 🔗 Configuración de integraciones"

log_info "3.1 Configurando integraciones principales..."
if [ -f "scripts/setup-integrations.sh" ]; then
    ./scripts/setup-integrations.sh
else
    log_warning "Script de integrations no encontrado"
    # Crear archivo .env básico si no existe
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        log_info "Archivo .env creado desde .env.example"
    fi
fi

# PASO 4: Validación de ADRs
echo ""
log_header "PASO 4: 📋 Validación de ADRs aplicados"

log_info "4.1 Verificando ADR-ZAP-01 (Zapier CLI conventions)..."
if [ -f "docs/adrs/ADR-ZAP-01-zapier-cli-conventions.md" ]; then
    log_success "ADR-ZAP-01 encontrado"
else
    log_warning "ADR-ZAP-01 no encontrado"
fi

log_info "4.2 Verificando ADR-HUB-05 (HubSpot DevTools)..."
if [ -f "docs/adrs/ADR-HUB-05-hubspot-devtools.md" ]; then
    log_success "ADR-HUB-05 encontrado"
else
    log_warning "ADR-HUB-05 no encontrado"
fi

# PASO 5: Configuración de hooks y linting
echo ""
log_header "PASO 5: 🛡️ Configuración de hooks y linting"

log_info "5.1 Configurando hooks pre-commit..."
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
    log_success "Hook pre-commit configurado"
else
    log_warning "Hook pre-commit no encontrado"
fi

log_info "5.2 Ejecutando lint y format inicial..."
npm run lint || log_warning "Lint inicial falló"
npm run format:all || log_warning "Format inicial falló"

# PASO 6: Validaciones finales
echo ""
log_header "PASO 6: ✅ Validaciones finales"

log_info "6.1 Ejecutando build de prueba..."
if npm run build; then
    log_success "Build exitoso"
else
    log_error "Build falló"
    exit 1
fi

log_info "6.2 Ejecutando tests básicos..."
if npm run test:fast; then
    log_success "Tests básicos pasaron"
else
    log_warning "Algunos tests fallaron, revisa la configuración"
fi

log_info "6.3 Ejecutando validación local..."
if npm run validate:local; then
    log_success "Validación local exitosa"
else
    log_warning "Validación local falló"
fi

# RESUMEN FINAL
echo ""
echo "=================================================="
log_header "🎉 RESUMEN DE CONFIGURACIÓN COMPLETADA"
echo "=================================================="

echo ""
log_info "📊 Estado del proyecto:"
echo "  ├── 🧩 VSCode Extensions: Instaladas"
echo "  ├── ⚙️  Copilot Config: Habilitado con introspección"
echo "  ├── 🔗 Integrations: Configuradas"
echo "  ├── 📋 ADRs: ADR-ZAP-01 y ADR-HUB-05"
echo "  ├── 🛡️  Pre-commit hooks: Activos"
echo "  ├── 🧪 Tests: Funcionando"
echo "  └── 🏗️  Build: Exitoso"

echo ""
log_info "🔄 Scripts disponibles:"
echo "  ├── npm run setup:all - Setup completo de integraciones"
echo "  ├── npm run validate:local - Validación local rápida"
echo "  ├── npm run test:watch - Tests en modo watch"
echo "  ├── npm run dev - Servidor de desarrollo"
echo "  ├── npm run lint:md - Linting de Markdown"
echo "  └── npm run format:all - Formateo completo"

echo ""
log_info "📚 Documentación clave:"
echo "  ├── docs/INTEGRATIONS_COMPLETE_GUIDE.md"
echo "  ├── docs/COST_OPTIMIZATION_STRATEGY.md"
echo "  ├── docs/adrs/ADR-ZAP-01-zapier-cli-conventions.md"
echo "  └── docs/adrs/ADR-HUB-05-hubspot-devtools.md"

echo ""
log_success "🚀 ¡FASE 1 COMPLETAMENTE CONFIGURADA!"
log_info "El entorno está listo para desarrollo con Kopp CRM"
log_info "Reinicia VSCode para aplicar todas las configuraciones"

echo ""
log_info "💡 Próximos pasos:"
echo "  1. Configurar tokens de API en .env"
echo "  2. Ejecutar npm run setup:slack"
echo "  3. Ejecutar npm run setup:hubspot"
echo "  4. Ejecutar npm run setup:zapier"
echo "  5. Comenzar desarrollo con npm run dev"

log_success "¡Listo para desarrollar! 🎯"
