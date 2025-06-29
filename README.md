# 🏟️ Kopp CRM Automation

![CI](https://github.com/kopp-stadium/kopp-crm-automation/workflows/CI%20-%20Continuous%20Integration/badge.svg)
![Coverage](<https://img.shields.io/badge/Coverage-9.56%25-red?style=flat-square![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=flat-square&logo=jest)logo=jest>)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

Automatización estratégica de Slack y HubSpot para Kopp Stadium con integración futura a Firebase, reemplazo progresivo de Zapier y despliegue en Vercel.

## 💰 Desarrollo Eficiente (Ahorro de Costos)

**IMPORTANTE**: Para minimizar costos de GitHub Actions hasta el acuerdo con Kopp:

### 🏠 Validación Local Prioritaria

```bash
# Valida TODO localmente antes de hacer push
npm run validate:local

# Test rápido durante desarrollo
npm run test:fast

# QA completo local (reemplaza CI)
npm run qa:minimal
```

### 🚀 Workflow Optimizado

1. **Desarrolla localmente** con `npm run dev`
2. **Valida localmente** con `npm run validate:local`
3. **Solo push cuando esté listo** (evita CI innecesario)
4. **PR solo para features completas**

### 📊 Workflows Minimizados

- **CI**: Solo main branch, 4 min máximo
- **Deploy**: Solo tags v\*, 6 min máximo
- **Ahorro**: ~80% menos consumo de minutos

📖 **Estrategia completa**: Ver [docs/COST_OPTIMIZATION_STRATEGY.md](./docs/COST_OPTIMIZATION_STRATEGY.md)

## 🚨 Resolución de GitHub Actions (Importante)

Si ves el error: `"The job was not started because recent account payments have failed or your spending limit needs to be increased"`, necesitas:

1. **Resolver facturación:** Ve a GitHub Settings → Billing and plans
2. **Aumentar límite:** Configura un límite de gastos apropiado
3. **Probar resolución:** Ejecuta el workflow manual "Test Billing Fix"

📖 **Documentación completa:** Ver [docs/GITHUB_ACTIONS_SETUP.md](./docs/GITHUB_ACTIONS_SETUP.md)

## 🚀 Inicio Rápido

### Configuración Automática

```bash
# Clonar y configurar
git clone [tu-repo]
cd kopp-crm-automation
./setup.sh
```

### Configuración Manual del Workspace

1. **Abrir Workspace:**

   ```bash
   # En VS Code: File → Open Workspace → kopp-stadium.code-workspace
   ```

2. **Seguir el workflow completo:**
   Ver [WORKFLOW.md](./WORKFLOW.md) para instrucciones detalladas paso a paso.

## 📁 Estructura del Proyecto

```
kopp-crm-automation/
├── 📄 kopp-stadium.code-workspace    # Configuración del workspace VS Code
├── 📄 WORKFLOW.md                    # Guía paso a paso de configuración
├── 📦 package.json                   # Dependencias y scripts npm
├── ⚙️ tsconfig.json                  # Configuración TypeScript
├── 🔧 .eslintrc.js                   # Configuración ESLint
├── 🎨 .prettierrc                    # Configuración Prettier
├── 🔒 .env.example                   # Variables de entorno de ejemplo
├── 🛠️ setup.sh                      # Script de configuración automática
├── 📂 src/                           # Código fuente principal
│   └── 📄 index.ts                   # Punto de entrada de la aplicación
└── 📂 scripts/                       # Scripts de automatización
    └── 📄 bootstrapSlack.ts          # Bootstrap de configuración Slack
```

## 🛠️ Scripts Disponibles

### **Desarrollo y Testing**

```bash
npm run dev                   # Iniciar desarrollo con hot-reload
npm run build                 # Compilar TypeScript
npm run test                  # Ejecutar todos los tests
npm run test:watch            # Tests en modo watch
npm run test:coverage         # Tests con reporte de cobertura
npm run lint                  # Linting y autofix
npm run lint:check            # Solo verificar linting
```

### **QA y Release**

```bash
npm run qa:local              # QA completo local
npm run qa:staging            # QA en staging
npm run qa:report             # Reporte QA a Slack
npm run release:patch         # Release patch (1.0.0 → 1.0.1)
npm run release:minor         # Release minor (1.0.0 → 1.1.0)
npm run release:major         # Release major (1.0.0 → 2.0.0)
```

### **GitHub Automation**

```bash
npm run github:setup-secrets  # 🔑 Configurar GitHub Secrets automáticamente
npm run github:verify-secrets # ✅ Verificar secrets configurados
npm run github:list-secrets   # 📋 Listar secrets actuales
npm run coverage:badge        # 🏆 Generar badge de cobertura
npm run coverage:open         # 📊 Abrir reporte de cobertura
```

## � GitHub Automation Setup

### **Quick Start - Configuración Completa:**

```bash
# 1. Instalar GitHub CLI
brew install gh  # macOS
gh auth login     # Autenticar

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con valores reales

# 3. Configurar GitHub Secrets automáticamente
npm run github:setup-secrets

# 4. Verificar configuración
npm run github:verify-secrets

# 5. Generar badge de cobertura
npm run test:coverage
npm run coverage:badge
```

### **Funcionalidades Automatizadas:**

- ✅ **CI/CD Pipeline:** Tests, build y deploy automático
- ✅ **GitHub Secrets:** Configuración automática desde `.env`
- ✅ **Coverage Badge:** Generación automática en README
- ✅ **Slack Notifications:** Reportes automáticos de CI/QA
- ✅ **Multi-Node Testing:** Node.js 18.x y 20.x
- ✅ **Security Audit:** Análisis automático de vulnerabilidades

Ver documentación completa: [📚 GitHub Automation Guide](./docs/GITHUB-AUTOMATION-GUIDE.md)

## �🔧 Extensiones VS Code Requeridas

- ✅ **GitHub Copilot Chat** - Asistente de código IA
- ✅ **ESLint** - Linting de código
- ✅ **Prettier** - Formateo de código
- ✅ **YAML** - Soporte para archivos YAML
- ✅ **Docker** - Soporte para containerización
- ✅ **Slack API** - Desarrollo de aplicaciones Slack
- ✅ **Zapier CLI** - Integración con Zapier

## 🔗 Integraciones Planificadas

- **Slack** → Automatización de eventos y notificaciones
- **HubSpot** → Sincronización de datos CRM
- **Zapier** → Migración gradual de workflows existentes
- **Firebase** → Base de datos y autenticación
- **Vercel** → Despliegue y hosting

## 🔧 Integraciones Zapier Implementadas

### 1. Form Submission → HubSpot → Slack

- **Trigger**: New Form Submission en HubSpot
- **Action**: Crear/actualizar contacto + notificación Slack #automations-alerts
- **Características**: Mapeo inteligente, Block Kit, reintentos exponenciales

### 2. Lead Scoring Automation 🎯

- **Trigger**: Updated Contact Property (lead_score) en HubSpot
- **Actions**:
  - Actualizar `last_score_update` timestamp
  - Enviar notificación a #scoring-leads (solo si score ≥ 50)
- **Características**: Filtrado inteligente, notificaciones contextuales

Ver documentación completa:

- [📋 Zapier Integration](./docs/ZAPIER_INTEGRATION.md)
- [🎯 Lead Scoring Integration](./docs/LEAD_SCORING_INTEGRATION.md)

## 📋 Workflow de Desarrollo

1. **Configuración inicial:** Seguir [WORKFLOW.md](./WORKFLOW.md)
2. **Desarrollo:** Usar VS Code con configuración optimizada
3. **Linting:** Automático al guardar con Prettier + ESLint
4. **Testing:** TDD con configuración de tasks integrada
5. **Deployment:** Pipeline automático a Vercel

## 🔐 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

## 🤖 Copilot Configuration

El workspace está optimizado para GitHub Copilot:

- ✅ Introspección desactivada (mejor rendimiento)
- ✅ Chat integrado para consultas contextuales
- ✅ Sugerencias de código específicas para Slack/HubSpot APIs

## 📞 Soporte

Para problemas con la configuración del workspace, consulta [WORKFLOW.md](./WORKFLOW.md) o revisa la configuración en `kopp-stadium.code-workspace`.

---

**Desarrollado para Kopp Stadium** 🏟️
