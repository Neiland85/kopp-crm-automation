#!/bin/bash

# Script para automatizar la configuración del workspace Kopp Stadium CRM

echo "🏟️ Configurando Workspace Kopp Stadium CRM Automation..."
echo "======================================================="

# 1. Instalar dependencias
echo "📦 Instalando dependencias npm..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# 2. Ejecutar linting inicial
echo ""
echo "🔍 Ejecutando linting inicial..."
npm run lint

# 3. Compilar TypeScript
echo ""
echo "🔨 Compilando TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
else
    echo "⚠️  Advertencia: Error en compilación (normal si faltan dependencias)"
fi

echo ""
echo "🎉 Configuración básica completada!"
echo ""
echo "📋 Próximos pasos manuales:"
echo "1. Abrir kopp-stadium.code-workspace en VS Code"
echo "2. Instalar extensiones recomendadas"
echo "3. Configurar variables de entorno (.env basado en .env.example)"
echo "4. Seguir el workflow en WORKFLOW.md"
echo ""
echo "🚀 ¡Tu workspace está listo para desarrollo!"
