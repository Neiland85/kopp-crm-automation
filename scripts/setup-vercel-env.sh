#!/bin/bash

# 🔧 Kopp CRM - Vercel Environment Setup Script
# ==============================================

echo "🔧 Configurando variables de entorno en Vercel..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production no encontrado. Creando template..."
    cp .env.example .env.production
fi

print_status "🌐 Configurando proyecto en Vercel..."

# Set project settings
vercel project add kopp-crm-automation --yes

print_status "📝 Leyendo variables de .env.production..."

# Read environment variables from .env.production and set them in Vercel
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        continue
    fi
    
    # Extract key=value
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remove quotes if present
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        # Skip placeholder values
        if [[ "$value" == "tu_"* ]] || [[ "$value" == "your_"* ]] || [[ -z "$value" ]]; then
            print_warning "⚠️ Saltando $key (valor placeholder o vacío)"
            continue
        fi
        
        print_status "➕ Configurando $key..."
        vercel env add "$key" production <<< "$value"
        
        if [ $? -eq 0 ]; then
            print_success "✅ $key configurado"
        else
            print_warning "⚠️ Error configurando $key"
        fi
    fi
done < .env.production

print_status "🔍 Listando variables configuradas..."
vercel env ls

echo ""
echo "=========================================="
echo "🎯 CONFIGURACIÓN DE ENTORNO COMPLETADA"
echo "=========================================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. ✅ Verificar variables en Vercel Dashboard"
echo "2. 🔧 Ajustar valores placeholder si es necesario"
echo "3. 🚀 Ejecutar deployment: ./scripts/deploy-production.sh"
echo ""
print_success "¡Variables de entorno listas para producción! 🚀"
