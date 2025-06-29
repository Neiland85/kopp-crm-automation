#!/bin/bash

# 🧩 VSCode Extensions Setup - Kopp CRM
# Instalación automática de extensiones específicas para el proyecto

set -e

echo "🧩 Configurando Extensiones de VSCode..."

# Verificar que VSCode esté instalado
if ! command -v code >/dev/null 2>&1; then
    echo "❌ VSCode CLI no disponible"
    echo "💡 Instala VSCode y asegúrate de que 'code' esté en PATH"
    exit 1
fi

echo "✅ VSCode CLI disponible"

# Extensiones requeridas para Kopp CRM
REQUIRED_EXTENSIONS=(
    "slackapi.vscode-slack"
    "zapier.vscode-zapier" 
    "hubspot.vscode-devtools"
    "Orta.vscode-jest"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "ms-vscode.vscode-typescript-next"
    "bradlc.vscode-tailwindcss"
    "GitHub.copilot"
    "GitHub.copilot-chat"
)

# Extensiones opcionales recomendadas
OPTIONAL_EXTENSIONS=(
    "ms-vscode.vscode-json"
    "redhat.vscode-yaml"
    "formulahendry.auto-rename-tag"
    "christian-kohler.path-intellisense"
    "ms-vscode.vscode-markdown"
    "yzhang.markdown-all-in-one"
)

echo "📦 Instalando extensiones requeridas..."

INSTALLED_COUNT=0
FAILED_COUNT=0

for extension in "${REQUIRED_EXTENSIONS[@]}"; do
    echo "🔧 Instalando $extension..."
    
    if code --install-extension "$extension" --force; then
        echo "✅ $extension instalado"
        ((INSTALLED_COUNT++))
    else
        echo "❌ Error instalando $extension"
        ((FAILED_COUNT++))
    fi
done

echo "📎 Instalando extensiones opcionales..."

for extension in "${OPTIONAL_EXTENSIONS[@]}"; do
    echo "🔧 Instalando $extension (opcional)..."
    
    if code --install-extension "$extension" --force 2>/dev/null; then
        echo "✅ $extension instalado"
        ((INSTALLED_COUNT++))
    else
        echo "⚠️  $extension no disponible (opcional)"
    fi
done

# Desinstalar extensiones conflictivas o innecesarias
CONFLICTING_EXTENSIONS=(
    "ms-vscode.vscode-typescript"
    "vscode.typescript-language-features"
)

echo "🧹 Removiendo extensiones conflictivas..."

for extension in "${CONFLICTING_EXTENSIONS[@]}"; do
    if code --list-extensions | grep -q "$extension"; then
        echo "🗑️  Desinstalando $extension..."
        code --uninstall-extension "$extension" || echo "⚠️  No se pudo desinstalar $extension"
    fi
done

# Crear configuración workspace-specific
echo "⚙️  Creando configuración de workspace..."

mkdir -p .vscode

# Settings específicos del workspace
cat > .vscode/settings.json << 'EOF'
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "markdown": true,
    "typescript": true,
    "javascript": true,
    "json": true
  },
  "copilot.experimental.inlineSuggest.enable": true,
  "copilot.experimental.introspection.enable": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "typescript", 
    "yaml",
    "json"
  ],
  "hubspot.devtools.enable": true,
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-src-file"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.associations": {
    "*.zapierapprc": "json",
    ".copilot.setup": "yaml"
  },
  "yaml.schemas": {
    "https://json.schemastore.org/github-workflow.json": ".github/workflows/*.yml"
  },
  "prettier.configPath": ".prettierrc",
  "slack.workspaceToken": "${env:SLACK_BOT_TOKEN}",
  "zapier.apiKey": "${env:ZAPIER_API_KEY}",
  "hubspot.apiKey": "${env:HUBSPOT_API_KEY}"
}
EOF

# Extensions recomendadas para el workspace
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "slackapi.vscode-slack",
    "zapier.vscode-zapier",
    "hubspot.vscode-devtools", 
    "Orta.vscode-jest",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ],
  "unwantedRecommendations": [
    "ms-vscode.vscode-typescript"
  ]
}
EOF

# Tasks específicas para Kopp CRM
cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🧪 Test Fast",
      "type": "shell", 
      "command": "npm run test:fast",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "⚡ Validate Local",
      "type": "shell",
      "command": "npm run validate:local", 
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "🔗 Setup Integrations",
      "type": "shell",
      "command": "npm run setup:all",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always", 
        "focus": true,
        "panel": "shared"
      }
    },
    {
      "label": "🚀 Deploy Zapier",
      "type": "shell",
      "command": "zapier deploy",
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "shared"
      },
      "problemMatcher": []
    }
  ]
}
EOF

# Launch configurations para debugging
cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🐛 Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      }
    },
    {
      "name": "🚀 Debug App",
      "type": "node", 
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "🔗 Debug Zapier",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/zapier",
      "args": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
EOF

echo "📊 Resumen de instalación:"
echo "✅ Extensiones instaladas: $INSTALLED_COUNT"
echo "❌ Errores: $FAILED_COUNT"
echo "⚙️  Configuración de workspace creada"

# Verificar extensiones críticas
echo "🔍 Verificando extensiones críticas..."

CRITICAL_EXTENSIONS=("GitHub.copilot" "dbaeumer.vscode-eslint" "esbenp.prettier-vscode")
MISSING_CRITICAL=()

for extension in "${CRITICAL_EXTENSIONS[@]}"; do
    if ! code --list-extensions | grep -q "$extension"; then
        MISSING_CRITICAL+=("$extension")
    fi
done

if [ ${#MISSING_CRITICAL[@]} -ne 0 ]; then
    echo "❌ Extensiones críticas faltantes:"
    for ext in "${MISSING_CRITICAL[@]}"; do
        echo "   - $ext"
    done
    echo "💡 Instala manualmente desde VSCode Marketplace"
else
    echo "✅ Todas las extensiones críticas instaladas"
fi

echo "🔄 Reinicia VSCode para aplicar cambios"
echo "🎉 Configuración de VSCode completada!"
