#!/bin/bash

# Script para desarrollo local - Evita usar GitHub Actions
# Ejecuta todas las validaciones localmente para ahorrar minutos

echo "🚀 Kopp CRM - Validación Local Ultra-Rápida"
echo "==========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

start_time=$(date +%s)

# Función para medir tiempo
measure_time() {
    local start=$1
    local end=$(date +%s)
    local duration=$((end - start))
    echo -e "${GREEN}⏱️  Completado en ${duration}s${NC}"
}

# Quick lint check
echo -e "\n${YELLOW}🔍 Quick Lint Check${NC}"
lint_start=$(date +%s)
npm run lint:check --silent > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lint OK${NC}"
else
    echo -e "${RED}❌ Lint Issues${NC}"
fi
measure_time $lint_start

# Fast test run
echo -e "\n${YELLOW}🧪 Fast Test Run${NC}"
test_start=$(date +%s)
npm test --silent --bail --testTimeout=5000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tests OK${NC}"
else
    echo -e "${RED}❌ Test Issues${NC}"
fi
measure_time $test_start

# Quick build
echo -e "\n${YELLOW}🏗️  Quick Build${NC}"
build_start=$(date +%s)
npm run build --silent > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build OK${NC}"
else
    echo -e "${RED}❌ Build Issues${NC}"
fi
measure_time $build_start

# Total time
end_time=$(date +%s)
total_duration=$((end_time - start_time))

echo -e "\n${GREEN}🎯 Validación local completada en ${total_duration}s${NC}"
echo -e "${YELLOW}💡 Tip: Usa este script para validar antes de hacer push${NC}"
echo -e "${YELLOW}💰 Ahorra minutos de GitHub Actions ejecutando localmente${NC}"

# Verificar si hay cambios sin commitear
if ! git diff --quiet; then
    echo -e "\n${YELLOW}⚠️  Tienes cambios sin commitear${NC}"
    echo -e "${YELLOW}🔧 Ejecuta: git add . && git commit -m 'tu mensaje'${NC}"
fi

# Mostrar el estado del repositorio
echo -e "\n${YELLOW}📊 Estado del repo:${NC}"
git status --porcelain | head -5

echo -e "\n${GREEN}✨ Listo para desarrollo eficiente${NC}"
