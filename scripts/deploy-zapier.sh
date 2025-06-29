#!/bin/bash

# Zapier Deployment Script
# Este script automatiza el proceso de deployment a Zapier Platform

set -e

echo "🚀 Iniciando deployment de Zapier Integration..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar que Zapier CLI está instalado
if ! command -v zapier &> /dev/null; then
    echo "❌ Zapier CLI no está instalado. Instalando..."
    npm install -g zapier-platform-cli
fi

# Verificar autenticación con Zapier
echo "🔐 Verificando autenticación con Zapier..."
if ! zapier login --check; then
    echo "❌ No autenticado con Zapier. Ejecutar: zapier login"
    exit 1
fi

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -rf node_modules/.zapier-build/

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test

# Ejecutar lint
echo "🔍 Ejecutando linter..."
npm run lint

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Validar la aplicación Zapier
echo "✅ Validando aplicación Zapier..."
zapier validate

# Hacer push a Zapier
echo "🚀 Haciendo push a Zapier..."
zapier push

# Obtener la versión actual
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Versión actual: $CURRENT_VERSION"

# Preguntar si se quiere promover a producción
read -p "¿Deseas promover la versión $CURRENT_VERSION a producción? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🎉 Promoviendo a producción..."
    zapier promote $CURRENT_VERSION
    echo "✅ ¡Deployment completado exitosamente!"
else
    echo "⏸️ Deployment completado. Versión $CURRENT_VERSION disponible para testing."
    echo "💡 Para promover más tarde, ejecutar: zapier promote $CURRENT_VERSION"
fi

echo "🏁 Proceso completado."
echo "📚 Documentación: https://zapier.com/developer/documentation/"
echo "🔗 Panel de control: https://zapier.com/app/developer/"
