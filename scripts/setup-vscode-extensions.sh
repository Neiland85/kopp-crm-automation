#!/bin/bash

# ================================================
# 🧩 INSTALADOR DE EXTENSIONES VSCODE - KOPP CRM
# ================================================

set -e

echo "🚀 Iniciando instalación de extensiones VSCode para Kopp CRM..."

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

# Verificar que code está disponible
if ! command -v code &> /dev/null; then
    log_error "VSCode CLI 'code' no está disponible. Asegúrate de tener VSCode instalado y el comando 'code' en tu PATH."
    exit 1
fi

log_info "VSCode CLI detectado correctamente"

# Array de extensiones esenciales del stack Kopp
declare -a KOPP_EXTENSIONS=(
    # GitHub Copilot (esencial)
    "github.copilot"
    "github.copilot-chat"
    
    # Extensiones específicas del stack Kopp
    "slackapi.vscode-slack"
    "zapier.vscode-zapier"
    "hubspot.vscode-devtools"
    
    # Core desarrollo
    "orta.vscode-jest"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "ms-vscode.vscode-typescript-next"
    
    # Utilidades esenciales
    "redhat.vscode-yaml"
    "ms-vscode.vscode-json"
    "mikestead.dotenv"
    "humao.rest-client"
    "eamodio.gitlens"
    "christian-kohler.path-intellisense"
)

# Array de extensiones a desinstalar (previene conflictos)
declare -a EXTENSIONS_TO_REMOVE=(
    "ms-vscode.vscode-typescript"
    "hookyqr.beautify"
    "ms-vscode.typescript-javascript-grammar"
)

# Función para instalar extensión
install_extension() {
    local ext=$1
    log_info "Instalando $ext..."
    
    if code --install-extension "$ext" --force; then
        log_success "$ext instalada correctamente"
    else
        log_warning "No se pudo instalar $ext (puede que ya esté instalada)"
    fi
}

# Función para desinstalar extensión
uninstall_extension() {
    local ext=$1
    log_info "Desinstalando $ext (prevención de conflictos)..."
    
    if code --uninstall-extension "$ext" 2>/dev/null; then
        log_success "$ext desinstalada correctamente"
    else
        log_info "$ext no estaba instalada"
    fi
}

echo
log_info "🧹 Paso 1: Limpiando extensiones conflictivas..."
for ext in "${EXTENSIONS_TO_REMOVE[@]}"; do
    uninstall_extension "$ext"
done

echo
log_info "📦 Paso 2: Instalando extensiones esenciales de Kopp CRM..."
for ext in "${KOPP_EXTENSIONS[@]}"; do
    install_extension "$ext"
done

echo
log_info "🔧 Paso 3: Configurando workspace específico..."

# Crear configuraciones específicas si no existen
if [ ! -f ".vscode/settings.json" ]; then
    log_warning "settings.json no encontrado, usando configuración por defecto"
fi

if [ ! -f ".vscode/extensions.json" ]; then
    log_warning "extensions.json no encontrado, usando configuración por defecto"
fi

echo
log_success "🎉 ¡Instalación de extensiones completada!"
log_info "Resumen de extensiones instaladas:"
printf "%s\n" "${KOPP_EXTENSIONS[@]}" | sed 's/^/  - /'

echo
log_info "📋 Próximos pasos recomendados:"
echo "  1. Reinicia VSCode para aplicar todas las configuraciones"
echo "  2. Ejecuta 'npm run setup:all' para configurar integraciones"
echo "  3. Verifica que Copilot esté habilitado y funcionando"
echo "  4. Configura tokens de API según la documentación"

echo
log_info "Para más información, consulta:"
echo "  - docs/INTEGRATIONS_COMPLETE_GUIDE.md"
echo "  - .vscode/extensions.json"
echo "  - .copilot.setup"

log_success "🚀 Entorno VSCode listo para desarrollo de Kopp CRM!"
