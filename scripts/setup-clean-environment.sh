#!/bin/bash

# =========================================
# 🧹 LIMPIEZA Y SETUP COMPLETO - KOPP CRM
# =========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo "🧹 Iniciando limpieza y setup completo del entorno Kopp CRM..."

# Paso 1: Limpiar archivos temporales y lockfiles
log_info "Paso 1: Limpiando archivos temporales..."
rm -rf logs/ 2>/dev/null || true
rm -rf coverage/ 2>/dev/null || true
rm -f package-lock.json yarn.lock 2>/dev/null || true
log_success "Archivos temporales limpiados"

# Paso 2: Regenerar lockfile
log_info "Paso 2: Regenerando package-lock.json..."
npm install
log_success "Dependencies reinstaladas"

# Paso 3: Verificar estructura .gitignore
log_info "Paso 3: Verificando .gitignore..."
if ! grep -q "logs/" .gitignore; then
    echo "logs/" >> .gitignore
    log_warning "Agregado logs/ a .gitignore"
fi

if ! grep -q "coverage/" .gitignore; then
    echo "coverage/" >> .gitignore
    log_warning "Agregado coverage/ a .gitignore"
fi
log_success ".gitignore verificado"

# Paso 4: Configurar hooks pre-commit
log_info "Paso 4: Configurando hooks pre-commit..."
if [ -f ".husky/pre-commit" ]; then
    chmod +x .husky/pre-commit
    log_success "Hook pre-commit configurado"
else
    log_warning "Hook pre-commit no encontrado, ejecutar setup completo"
fi

# Paso 5: Verificar configuración de VSCode
log_info "Paso 5: Verificando configuración VSCode..."
if [ ! -d ".vscode" ]; then
    mkdir -p .vscode
    log_warning "Directorio .vscode creado"
fi

if [ ! -f ".vscode/settings.json" ]; then
    log_warning "settings.json no encontrado"
fi

if [ ! -f ".vscode/extensions.json" ]; then
    log_warning "extensions.json no encontrado"
fi

# Paso 6: Validar configuración de Copilot
log_info "Paso 6: Verificando configuración Copilot..."
if [ ! -f ".copilot.setup" ]; then
    log_warning ".copilot.setup no encontrado"
fi

if [ ! -f ".vscode/copilot.settings.json" ]; then
    log_warning "copilot.settings.json no encontrado"
fi

# Paso 7: Ejecutar validaciones
log_info "Paso 7: Ejecutando validaciones finales..."

# Lint check
if npm run lint:check; then
    log_success "Lint check pasado"
else
    log_warning "Lint check falló, ejecutando fix..."
    npm run lint
fi

# Verificar que el build funciona
if npm run build; then
    log_success "Build exitoso"
else
    log_error "Build falló"
    exit 1
fi

# Paso 8: Mostrar resumen del estado
echo ""
log_info "📊 Resumen del estado del proyecto:"
echo "  ├── 📦 Dependencies: $(npm list --depth=0 2>/dev/null | grep -c '├\|└' || echo 'N/A')"
echo "  ├── 🧪 Test files: $(find tests/ -name '*.test.*' | wc -l | tr -d ' ')"
echo "  ├── 📁 Source files: $(find src/ -name '*.ts' | wc -l | tr -d ' ')"
echo "  ├── 📄 Documentation: $(find docs/ -name '*.md' | wc -l | tr -d ' ')"
echo "  └── ⚙️  Scripts: $(find scripts/ -name '*.sh' | wc -l | tr -d ' ')"

echo ""
log_success "🎉 ¡Limpieza y setup completados exitosamente!"

echo ""
log_info "📋 Próximos pasos recomendados:"
echo "  1. Ejecutar: npm run setup:vscode (instalar extensiones VSCode)"
echo "  2. Ejecutar: npm run setup:all (configurar integraciones)"
echo "  3. Verificar: npm run validate:local"
echo "  4. Probar: npm run test"

echo ""
log_info "🔗 Para más información:"
echo "  - docs/INTEGRATIONS_COMPLETE_GUIDE.md"
echo "  - docs/COST_OPTIMIZATION_STRATEGY.md"
echo "  - .vscode/extensions.json"

log_success "🚀 Entorno listo para desarrollo!"
