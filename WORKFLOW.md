# 🏟️ Workflow de Configuración - Kopp Stadium CRM Automation

## 📋 Pasos UI para Configurar el Workspace

### 1. Abrir el Workspace
1. **Archivo** → **Abrir Workspace...** 
2. Selecciona `kopp-stadium.code-workspace`
3. VS Code reiniciará con la configuración del workspace

### 2. Panel de Extensiones
1. Presiona **⇧⌘X** (Mac) / **Ctrl+Shift+X** (Windows/Linux)
2. Ve a la pestaña **"Recommended"**
3. **Instala las extensiones recomendadas:**
   - ✅ GitHub Copilot Chat
   - ✅ ESLint
   - ✅ Prettier - Code formatter
   - ✅ YAML
   - ✅ Docker
   - ✅ Slack API (si está disponible)
   - ✅ Zapier CLI (si está disponible)

4. **Desinstala manualmente las extensiones no deseadas:**
   - ❌ Python
   - ❌ Pylance
   - ❌ C/C++
   - ❌ Debugger for Chrome
   - ❌ Jupyter

### 3. Configurar Settings UI
1. Presiona **⇧⌘P** → escribe **"Preferences: Open Workspace Settings"**
2. **Verifica estas configuraciones:**
   - ✅ **Editor: Format On Save** → Activado
   - ✅ **Editor: Default Formatter** → Prettier - Code formatter
   - ✅ **ESLint: Enable** → Activado
   - ✅ **Copilot: Experimental Introspection** → Desactivado

3. **En Text Editor → Formatting:**
   - Confirma que Prettier está seleccionado como formateador por defecto

4. **En Text Editor → Code Actions:**
   - Verifica que ESLint está activo para linting

### 4. Vista de Tareas
1. Presiona **⇧⌘P** → **"Tasks: Run Task"**
2. **Verás estas tareas disponibles:**
   - 📦 `npm: install` - Instalar dependencias
   - 🔍 `npm: lint` - Ejecutar linting
   - 🧪 `npm: test` - Ejecutar tests
   - 🚀 `Bootstrap Fase 0` - Configuración inicial

3. **Ejecuta primero:** `npm: install` para instalar dependencias

### 5. Copilot Panel
1. Presiona **⇧⌘P** → **"Copilot: Toggle Chat"**
2. **Verifica que Copilot Chat carga correctamente**
3. **Confirma que la introspección avanzada está desactivada** (más rápido y eficiente)

### 6. Terminal Integrado
1. Presiona **⌃`** para abrir el terminal
2. **Verifica:**
   - ✅ Terminal usa **zsh** (configurado para macOS)
   - ✅ Directorio actual es la raíz del proyecto
   - ✅ Variables de entorno en `.env.example` son visibles como referencia

## 🔍 Validación Rápida

### Extensiones
1. **⇧⌘P** → **"Extensions: Show Recommended Extensions"**
2. **Confirma que solo aparecen las extensiones necesarias**

### Tareas
1. **Ejecuta:** `npm: lint`
   - Debe ejecutarse sin errores críticos
2. **Ejecuta:** `npm: test` 
   - Debe mostrar mensaje de "No tests specified yet"

### Copilot
1. **Abre:** `src/index.ts`
2. **Pide a Copilot:** "Generate imports for @slack/web-api"
3. **Verifica que Copilot responde y sugiere código**

## 🛠️ Comandos de Terminal Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar linting
npm run lint

# Ejecutar bootstrap
npm run bootstrap:all

# Compilar TypeScript
npm run build
```

## 📁 Estructura del Proyecto

```
kopp-crm-automation/
├── 📄 kopp-stadium.code-workspace    # Configuración del workspace
├── 📦 package.json                   # Dependencias y scripts
├── ⚙️ tsconfig.json                  # Configuración TypeScript
├── 🔧 .eslintrc.js                   # Configuración ESLint
├── 🎨 .prettierrc                    # Configuración Prettier
├── 🔒 .env.example                   # Variables de entorno de ejemplo
├── 📂 src/                           # Código fuente
│   └── 📄 index.ts                   # Archivo principal
└── 📂 scripts/                       # Scripts de automatización
    └── 📄 bootstrapSlack.ts          # Bootstrap de Slack
```

## ✅ Checklist Final

- [ ] Workspace abierto correctamente
- [ ] Extensiones recomendadas instaladas
- [ ] Extensiones no deseadas desinstaladas
- [ ] Settings configurados (formateo, linting, Copilot)
- [ ] Tareas funcionando correctamente
- [ ] Copilot Chat activo y funcional
- [ ] Terminal configurado con zsh
- [ ] Dependencias instaladas (`npm install`)
- [ ] Linting ejecutándose sin errores
- [ ] Copilot respondiendo a peticiones de código

¡Tu workspace está listo para comenzar el desarrollo! 🚀
