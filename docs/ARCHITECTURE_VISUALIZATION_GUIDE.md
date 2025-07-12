# 🏗️ Comandos de Visualización de Arquitectura

## Descripción

Este documento describe los comandos disponibles para visualizar la arquitectura general del proyecto **Kopp Stadium CRM Automation**.

## Comandos Disponibles

### 1. Script Directo

```bash
./scripts/show-architecture-tree.sh
```

### 2. Comandos NPM

```bash
# Opción completa
npm run architecture:show

# Opción corta
npm run architecture:tree

# Opción más corta (alias)
npm run arch
```

### 3. Desde VS Code

- Usar el **Command Palette** (`Cmd+Shift+P`)
- Buscar "Tasks: Run Task"
- Seleccionar "🏗️ Mostrar Arquitectura del Proyecto"

## ¿Qué Muestra el Script?

El script `show-architecture-tree.sh` genera una visualización completa que incluye:

### 📁 Estructura Principal del Proyecto

- Árbol de directorios y archivos principales
- Configuraciones y archivos de deployment

### 🏗️ Arquitectura del Código Fuente

- Estructura detallada del directorio `src/`
- Organización modular por funcionalidades
- Integraciones y servicios

### ⚡ Scripts de Automatización

- Lista de todos los scripts disponibles
- Scripts de build, test, deployment, etc.

### 📚 Documentación Técnica

- Documentos de arquitectura (ADRs)
- Guías de integración
- Documentación de APIs

### ⚙️ Configuraciones y Deployment

- Archivos de configuración
- Setup de entornos
- Configuración de CI/CD

### 🧪 Testing y Quality Assurance

- Suite de tests
- Coverage reports
- Scripts de QA

### 🔌 Integraciones Externas

- HubSpot CRM
- Slack Bot & OAuth
- Zapier Workflows
- Notion Database
- Google Sheets
- Vercel Serverless

## 📋 Inventario Completo de Scripts

### Scripts de Automatización (`scripts/`)

```
scripts/
├── README-slack-test.md              # Documentación de tests Slack
├── bootstrapSlack.ts                 # Inicialización de Slack
├── build-and-deploy.sh              # Build y deploy
├── cleanExtensions.js               # Limpieza de extensiones
├── configureExtensions.js           # Configuración de extensiones
├── deploy-production.sh             # Deploy a producción
├── deploy-zapier.sh                 # Deploy de Zapier
├── generate-coverage-badge.sh       # Generación de badges de coverage
├── generateEmotionalDashboard.ts    # Dashboard emocional
├── githubSlackNotifier.js           # Notificaciones GitHub-Slack
├── local-validation.sh              # Validación local
├── manage-vscode-performance.sh     # Gestión de rendimiento VSCode
├── notionEmotionalMetrics.ts        # Métricas emocionales Notion
├── open-swagger.js                  # Apertura de Swagger UI
├── qaReport.js                      # Reportes de QA
├── releaseManager.js                # Gestión de releases
├── security-audit.js               # Auditoría de seguridad
├── setup-clean-environment.sh      # Setup ambiente limpio
├── setup-hubspot.sh                # Configuración HubSpot
├── setup-integrations.sh           # Configuración integraciones
├── setup-notion.sh                 # Configuración Notion
├── setup-phase1-complete.sh        # Completar Fase 1
├── setup-secrets.sh                # Configuración de secretos
├── setup-slack.sh                  # Configuración Slack
├── setup-vercel-env.sh             # Variables Vercel
├── setup-vscode-extensions.sh      # Extensiones VSCode
├── setup-vscode.sh                 # Configuración VSCode
├── setup-zapier.sh                 # Configuración Zapier
├── show-architecture-tree.sh       # Mostrar árbol de arquitectura
├── slack-test.js                   # Tests de Slack
├── slackTestReport.js              # Reportes de tests Slack
├── test-dropout-positivo.js        # Test dropout positivo
├── test-hot-leads.js               # Test hot leads
├── test-recompensas-escasez.js     # Test recompensas y escasez
├── test-reputometro.js             # Test reputómetro
└── validate-cookies-policy.js      # Validación política cookies
```

**Total de scripts:** 35 archivos

### Documentación Técnica (`docs/`)

```
docs/
├── 01_ADR_Principales-Decisiones.md       # ADR principal para CTO
├── ADR-004-copilot-precommit-configuration.md
├── API.md                                 # Documentación API
├── ARCHITECTURE_EXECUTIVE_SUMMARY.md     # Resumen ejecutivo
├── ARCHITECTURE_VISUALIZATION_GUIDE.md   # Esta guía
├── COST_OPTIMIZATION_STRATEGY.md         # Estrategia optimización costos
├── GITHUB-AUTOMATION-GUIDE.md            # Guía automatización GitHub
├── GITHUB_ACTIONS_SETUP.md               # Setup GitHub Actions
├── GOOGLE_SHEETS_LEAD_SCORING_INTEGRATION.md
├── INSTALLATION.md                       # Guía instalación
├── INTEGRATIONS_COMPLETE_GUIDE.md        # Guía completa integraciones
├── LEAD_SCORING_INTEGRATION.md           # Integración lead scoring
├── POLITICA_COOKIES_EXHAUSTIVA.md        # Política cookies GDPR
├── QA-TESTING-RELEASES-GUIDE.md          # Guía QA y releases
├── SLACK_BOLT_SETUP.md                   # Setup Slack Bolt
├── SWAGGER_API_DOCUMENTATION.md          # Documentación Swagger
├── ZAPIER_INTEGRATION.md                 # Integración Zapier
├── adrs/                                 # ADRs específicos
│   ├── ADR-005-copilot-agent-gdpr-configuration.md
│   ├── ADR-HUB-05-hubspot-devtools.md
│   └── ADR-ZAP-01-zapier-cli-conventions.md
└── decisions/                            # Decisiones arquitecturales
    ├── ADR-001-integraciones-arquitectura.md
    ├── ADR-002-testing-qa-policies.md
    └── ADR-003-copilot-configuration.md
```

**Total de documentos:** 17 archivos principales + 6 ADRs específicos = 23 documentos

### 🔒 Seguridad y Compliance

- OAuth 2.0 Authentication
- JWT Token Management
- GDPR Compliance
- Security audits

### 📊 Métricas del Proyecto

- Estadísticas de código
- Lines of code por tecnología
- Test coverage
- Número de archivos por tipo

### ⚡ Comandos Útiles

- Lista de comandos npm principales
- Scripts de desarrollo y producción

## Ejemplo de Uso

```bash
# Cambiar al directorio del proyecto
cd /path/to/kopp-crm-automation

# Ejecutar visualización de arquitectura
npm run arch
```

## Requisitos

- **tree** (opcional): Para mejorar la visualización de directorios
- **cloc** (opcional): Para estadísticas detalladas de líneas de código
- Permisos de ejecución en el script

## Instalación de Herramientas Opcionales

```bash
# macOS con Homebrew
brew install tree cloc

# Ubuntu/Debian
sudo apt-get install tree cloc

# CentOS/RHEL
sudo yum install tree cloc
```

## Output de Ejemplo

```
🏗️ =====================================================================
🎯 KOPP STADIUM CRM AUTOMATION - ÁRBOL DE ARQUITECTURA GENERAL
🏗️ =====================================================================

📁 ESTRUCTURA PRINCIPAL DEL PROYECTO
──────────────────────────────────────────────────
[Árbol de directorios y archivos]

🏗️ ARQUITECTURA DEL CÓDIGO FUENTE (src/)
──────────────────────────────────────────────────
[Estructura detallada del código fuente]

⚡ SCRIPTS DE AUTOMATIZACIÓN
──────────────────────────────────────────────────
[Lista de scripts disponibles]

[... y más secciones]
```

## Documentos Relacionados

- 📄 `docs/01_ADR_Principales-Decisiones.md` - Decisiones arquitecturales
- 📄 `PROJECT_COMPLETION_SUMMARY.md` - Resumen completo del proyecto
- 📄 `README.md` - Documentación principal del proyecto

---

**Última actualización**: Julio 6, 2025  
**Autor**: Kopp Stadium Development Team
