#!/bin/bash

# Script para gestionar extensiones de VSCode que afectan el rendimiento
# Uso: ./manage-vscode-performance.sh [enable|disable|status]

HEAVY_EXTENSIONS=(
    "eamodio.gitlens"                           # GitLens - Git supercharged
    "snyk-security.snyk-vulnerability-scanner"  # Snyk Security Scanner
    "sonarsource.sonarlint-vscode"             # SonarLint
    "wallabyjs.console-ninja"                  # Console Ninja
    "usernamehw.errorlens"                     # Error Lens
    "datadog.datadog-vscode"                   # Datadog
    "ms-azuretools.vscode-containers"          # Azure Containers
    "gruntfuggly.todo-tree"                    # TODO Tree
    "streetsidesoftware.code-spell-checker"    # Code Spell Checker
)

MODERATE_EXTENSIONS=(
    "bradlc.vscode-tailwindcss"               # Tailwind CSS IntelliSense
    "hashicorp.terraform"                     # Terraform
    "ms-azuretools.vscode-docker"             # Docker
    "redhat.vscode-xml"                       # XML
    "redhat.vscode-yaml"                      # YAML
)

function disable_heavy_extensions() {
    echo "🔴 Deshabilitando extensiones pesadas para mejorar rendimiento..."
    
    for extension in "${HEAVY_EXTENSIONS[@]}"; do
        echo "  → Deshabilitando $extension"
        code --disable-extension "$extension" 2>/dev/null
    done
    
    echo "✅ Extensiones pesadas deshabilitadas"
    echo "💡 Reinicia VSCode para que los cambios tengan efecto completo"
}

function disable_moderate_extensions() {
    echo "🟡 Deshabilitando extensiones moderadas para mayor rendimiento..."
    
    for extension in "${MODERATE_EXTENSIONS[@]}"; do
        echo "  → Deshabilitando $extension"
        code --disable-extension "$extension" 2>/dev/null
    done
    
    echo "✅ Extensiones moderadas deshabilitadas"
}

function enable_heavy_extensions() {
    echo "🟢 Habilitando extensiones pesadas..."
    
    for extension in "${HEAVY_EXTENSIONS[@]}"; do
        echo "  → Habilitando $extension"
        code --enable-extension "$extension" 2>/dev/null
    done
    
    echo "✅ Extensiones pesadas habilitadas"
    echo "💡 Reinicia VSCode para que los cambios tengan efecto completo"
}

function enable_moderate_extensions() {
    echo "🟢 Habilitando extensiones moderadas..."
    
    for extension in "${MODERATE_EXTENSIONS[@]}"; do
        echo "  → Habilitando $extension"
        code --enable-extension "$extension" 2>/dev/null
    done
    
    echo "✅ Extensiones moderadas habilitadas"
}

function show_status() {
    echo "📊 Estado de extensiones que afectan el rendimiento"
    echo ""
    
    echo "🔴 Extensiones PESADAS:"
    for extension in "${HEAVY_EXTENSIONS[@]}"; do
        if code --list-extensions | grep -q "^$extension$"; then
            echo "  ✅ $extension (habilitada)"
        else
            echo "  ❌ $extension (deshabilitada o no instalada)"
        fi
    done
    
    echo ""
    echo "🟡 Extensiones MODERADAS:"
    for extension in "${MODERATE_EXTENSIONS[@]}"; do
        if code --list-extensions | grep -q "^$extension$"; then
            echo "  ✅ $extension (habilitada)"
        else
            echo "  ❌ $extension (deshabilitada o no instalada)"
        fi
    done
}

function show_performance_tips() {
    echo ""
    echo "🚀 CONSEJOS ADICIONALES PARA MEJORAR RENDIMIENTO:"
    echo ""
    echo "1. 📁 Excluir directorios innecesarios del watcher:"
    echo "   Añadir a settings.json:"
    echo '   "files.watcherExclude": {'
    echo '     "**/node_modules/**": true,'
    echo '     "**/dist/**": true,'
    echo '     "**/coverage/**": true,'
    echo '     "**/.git/**": true'
    echo '   }'
    echo ""
    echo "2. 🔍 Limitar búsquedas:"
    echo '   "search.exclude": {'
    echo '     "**/node_modules": true,'
    echo '     "**/coverage": true,'
    echo '     "**/dist": true'
    echo '   }'
    echo ""
    echo "3. ⚡ TypeScript optimizations:"
    echo '   "typescript.preferences.includePackageJsonAutoImports": "off",'
    echo '   "typescript.suggest.autoImports": false'
    echo ""
    echo "4. 🎨 Reducir decoraciones visuales:"
    echo '   "editor.renderIndentGuides": false,'
    echo '   "editor.renderLineHighlight": "none"'
    echo ""
    echo "5. 🔄 Configurar auto-save moderado:"
    echo '   "files.autoSave": "onFocusChange"'
}

function apply_performance_settings() {
    echo "⚙️ Aplicando configuraciones de rendimiento a VSCode..."
    
    SETTINGS_FILE="$HOME/Library/Application Support/Code/User/settings.json"
    
    # Crear backup
    if [ -f "$SETTINGS_FILE" ]; then
        cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        echo "📋 Backup creado: $SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Aplicar configuraciones de rendimiento
    cat > "/tmp/performance_settings.json" << 'EOF'
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/coverage/**": true,
    "**/build/**": true,
    "**/.git/**": true,
    "**/tmp/**": true,
    "**/temp/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/dist": true,
    "**/build": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,
  "editor.renderIndentGuides": false,
  "editor.renderLineHighlight": "none",
  "files.autoSave": "onFocusChange",
  "extensions.autoUpdate": false,
  "telemetry.telemetryLevel": "off",
  "update.enableWindowsBackgroundUpdates": false
}
EOF
    
    echo "✅ Configuraciones de rendimiento preparadas en /tmp/performance_settings.json"
    echo "💡 Copia manualmente las configuraciones que desees a tu settings.json"
}

case "$1" in
    "disable")
        disable_heavy_extensions
        ;;
    "disable-all")
        disable_heavy_extensions
        disable_moderate_extensions
        ;;
    "enable")
        enable_heavy_extensions
        ;;
    "enable-all")
        enable_heavy_extensions
        enable_moderate_extensions
        ;;
    "status")
        show_status
        ;;
    "tips")
        show_performance_tips
        ;;
    "settings")
        apply_performance_settings
        ;;
    *)
        echo "🎛️  VSCode Performance Manager"
        echo ""
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponibles:"
        echo "  disable      - Deshabilita extensiones pesadas"
        echo "  disable-all  - Deshabilita extensiones pesadas y moderadas"
        echo "  enable       - Habilita extensiones pesadas"
        echo "  enable-all   - Habilita todas las extensiones"
        echo "  status       - Muestra estado de las extensiones"
        echo "  tips         - Muestra consejos de rendimiento"
        echo "  settings     - Genera configuraciones de rendimiento"
        echo ""
        echo "Ejemplos:"
        echo "  $0 disable     # Para trabajo normal"
        echo "  $0 enable      # Para desarrollo completo"
        echo "  $0 status      # Ver qué está habilitado"
        ;;
esac
