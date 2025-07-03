# 🏟️ Kopp CRM Automation with GDPR Compliance

![CI](https://github.com/kopp-stadium/kopp-crm-automation/workflows/CI%20-%20Continuous%20Integration/badge.svg)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=flat-square&logo=jest)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)
![pnpm](https://img.shields.io/badge/pnpm-9.x-orange?style=flat-square&logo=pnpm)
![GDPR](https://img.shields.io/badge/GDPR-Compliant-blue?style=flat-square&logo=shield)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**Automatización estratégica de Slack y HubSpot para Kopp Stadium** con **cumplimiento RGPD
integral**, **GitHub Copilot-Agent avanzado** y arquitectura modular con **pnpm**.

## 🆕 **NUEVAS FUNCIONALIDADES (Julio 2025)**

### 🔒 **Cumplimiento GDPR Integral**

- **Política de cookies exhaustiva** con consentimiento granular
- **Procedimientos de respuesta a incidentes** conforme RGPD
- **Documentación legal completa** (DPIA, DPA, términos)
- **Validación automática** de compliance en tiempo real

### 🤖 **GitHub Copilot-Agent Especializado**

- **Configuración GDPR-aware** para generación de código conforme
- **Prompts especializados** para desarrollo de privacidad
- **Restricciones automáticas** para prevenir vulnerabilidades
- **Templates predefinidos** para componentes de protección de datos

### 📦 **Arquitectura Modular con pnpm**

- **~50% más rápido** en instalación de dependencias
- **Workspace modular** para mejor organización
- **Seguridad mejorada** con validación estricta
- **Eficiencia de almacenamiento** con shared store

📖 **Documentación técnica completa**:
[ADR-005-copilot-agent-gdpr-configuration.md](./docs/adrs/ADR-005-copilot-agent-gdpr-configuration.md)

## � Inicio Rápido con pnpm

### 📋 Prerequisitos

```bash
# Instalar pnpm globalmente (si no está instalado)
npm install -g pnpm

# Verificar instalación
pnpm --version
```

### ⚡ Setup Automático Completo

```bash
# Clonar y configurar con pnpm
git clone [tu-repo]
cd kopp-crm-automation

# Instalación modular con pnpm
pnpm install

# Setup completo del workspace (incluye GDPR)
pnpm run setup:all
```

### �️ Validación GDPR y Seguridad

```bash
# Validación completa de compliance
pnpm run gdpr:validate

# Escaneo de seguridad con Snyk
pnpm run security:scan

# Auditoría de dependencias
pnpm audit --audit-level moderate
```

## 🔗 Configuración de Integraciones + GDPR

### ⚡ Setup Automático (Recomendado)

````bash
```bash
# Configurar todas las integraciones de una vez (incluye GDPR)
pnpm run setup:all

# O configurar individualmente
pnpm run setup:slack     # Slack channels y bot
pnpm run setup:zapier    # Zapier CLI y app
pnpm run setup:hubspot   # HubSpot API y propiedades
pnpm run setup:notion    # Notion templates (opcional)
pnpm run gdpr:setup      # Configuración GDPR completa
````

````

### 🎯 Integraciones Incluidas

- **Slack**: Canales `#automations-alerts` y `#scoring-leads`
- **Zapier**: 4 triggers + 6 actions configuradas
- **HubSpot**: Propiedades custom y workflows **con compliance GDPR**
- **Google Sheets**: Lead scoring automation **con pseudoanonimización**
- **Notion**: Templates de documentación **+ métricas GDPR**
- **🆕 GDPR Suite**: Cookies, consentimientos, auditoría y compliance

### 📋 Variables de Entorno Actualizadas

```bash
# Integraciones básicas
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
HUBSPOT_API_KEY=...
ZAPIER_WEBHOOK_URL=...
NOTION_TOKEN=... (opcional)

# 🆕 Variables GDPR (ver gdpr/.env.example para lista completa)
COOKIE_SECRET=your-secure-cookie-secret
ENCRYPTION_KEY=your-256-bit-encryption-key
DPO_EMAIL=dpo@kopp-stadium.com
CONSENT_VERSION=1.0.0
DATA_RETENTION_DAYS=730

# 🆕 Seguridad y auditoría
SNYK_TOKEN=your-snyk-token
AUDIT_TRAIL_ENABLED=true
SECURITY_SCANNER_ENABLED=true
````

📖 **Guía completa**: Ver [docs/INTEGRATIONS_COMPLETE_GUIDE.md](./docs/INTEGRATIONS_COMPLETE_GUIDE.md)  
📖 **Variables GDPR**: Ver [gdpr/.env.example](./gdpr/.env.example)

## 🚨 Resolución de GitHub Actions (Importante)

Si ves el error: `"The job was not started because recent account payments have
failed or your spending limit needs to be increased"`, necesitas:

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

## 📁 Estructura del Proyecto (Actualizada)

```
kopp-crm-automation/
├── 📄 kopp-stadium.code-workspace         # Configuración del workspace VS Code
├── 📄 pnpm-workspace.yaml                 # 🆕 Configuración workspace pnpm
├── 📄 WORKFLOW.md                          # Guía paso a paso de configuración
├── 📦 package.json                         # Dependencias y scripts (pnpm)
├── ⚙️ tsconfig.json                        # Configuración TypeScript
├── 🔧 .eslintrc.js                         # 🆕 ESLint + reglas de seguridad
├── 🎨 .prettierrc                          # Configuración Prettier
├── 🔒 .env.example                         # Variables de entorno básicas
├── 🛠️ setup.sh                            # Script de configuración automática
├── 📂 .vscode/                             # 🆕 Configuración VS Code avanzada
│   ├── 🤖 copilot-agent.json              # 🆕 Configuración Copilot-Agent GDPR
│   ├── 🔧 settings.json                    # 🆕 Settings para pnpm + seguridad
│   ├── 📋 tasks.json                       # 🆕 Tareas pnpm + validaciones GDPR
│   └── 🧩 extensions.json                  # 🆕 Extensiones GDPR recomendadas
├── 📂 gdpr/                                # 🆕 Suite completa GDPR
│   ├── 🍪 cookies/                         # Gestión de cookies y consentimiento
│   ├── 📋 procedures/                      # Procedimientos compliance
│   ├── 🛡️ security/                       # Seguridad y auditoría
│   ├── 📄 templates/                       # Templates legales (DPIA, DPA)
│   ├── 👤 dpo.md                           # Perfil y responsabilidades DPO
│   ├── 📜 terms.md                         # Términos y condiciones
│   └── 🔒 .env.example                     # Variables GDPR específicas
├── 📂 docs/                                # Documentación técnica
│   └── 📂 adrs/                            # Architecture Decision Records
│       └── 📄 ADR-005-copilot-agent-gdpr-configuration.md
├── 📂 src/                                 # Código fuente principal
│   └── 📄 index.ts                         # Punto de entrada de la aplicación
└── 📂 scripts/                             # Scripts de automatización
    └── 📄 bootstrapSlack.ts                # Bootstrap de configuración Slack
```

## 🛠️ Scripts Disponibles (Actualizados con pnpm)

### **Desarrollo y Testing**

```bash
# Desarrollo con pnpm (más rápido)
pnpm run dev                          # Iniciar desarrollo con hot-reload
pnpm run dev:pnpm                     # 🆕 Desarrollo específico pnpm
pnpm run build                        # Compilar TypeScript
pnpm run build:pnpm                   # 🆕 Build optimizado con pnpm

# Testing mejorado
pnpm run test                         # Ejecutar todos los tests
pnpm run test:pnpm                    # 🆕 Tests con pnpm exec
pnpm run test:watch                   # Tests en modo watch
pnpm run test:coverage                # Tests con reporte de cobertura
pnpm run gdpr:test                    # 🆕 Tests específicos GDPR

# Linting y calidad
pnpm run lint                         # Linting y autofix (con reglas seguridad)
pnpm run lint:check                   # Solo verificar linting
```

### **🆕 GDPR y Compliance**

```bash
# Validación GDPR completa
pnpm run gdpr:validate                # Validar compliance completo
pnpm run gdpr:audit                   # Generar reporte de auditoría
pnpm run gdpr:generate-report         # Reporte ejecutivo GDPR

# Gestión de cookies
pnpm run cookies:validate             # Validar política de cookies
pnpm run cookies:test                 # Test de consentimientos
```

### **🛡️ Seguridad y Auditoría**

```bash
# Escaneos de seguridad
pnpm run security:scan                # Audit + Snyk scan completo
pnpm run security:fix                 # Fix automático vulnerabilidades
pnpm run security:report              # Reporte de seguridad

# Auditoría de dependencias
pnpm audit --audit-level moderate     # Auditoría pnpm nativa
pnpm outdated --recursive             # Dependencias obsoletas
```

### **📦 Gestión de Workspace**

```bash
# Gestión del workspace pnpm
pnpm run workspace:install            # Instalar todas las dependencias
pnpm run workspace:clean              # Limpiar node_modules + store
pnpm run workspace:outdated           # Ver dependencias obsoletas
pnpm run workspace:update             # Actualizar dependencias

# Utilidades workspace
pnpm list --depth=0                   # Ver dependencias instaladas
pnpm why [package]                    # Por qué está instalado un paquete
```

### **QA y Release (Mejorados)**

```bash
pnpm run qa:local                     # QA completo local + GDPR
pnpm run qa:staging                   # QA en staging
pnpm run qa:report                    # Reporte QA a Slack
pnpm run release:patch                # Release patch (1.0.0 → 1.0.1)
pnpm run release:minor                # Release minor (1.0.0 → 1.1.0)
pnpm run release:major                # Release major (1.0.0 → 2.0.0)
```

## 🏗️ Arquitectura de Desarrollo (Actualizada)

### **Stack Tecnológico Modernizado:**

- **🏃‍♂️ Runtime**: Node.js 20.x
- **📦 Package Manager**: pnpm 9.x (workspace modular)
- **🔧 Build Tool**: TypeScript 5.8.x
- **🧪 Testing**: Jest + Supertest
- **🎨 Code Quality**: ESLint + Prettier + SonarLint
- **🛡️ Security**: Snyk + Security ESLint rules
- **🤖 AI Assistant**: GitHub Copilot-Agent (GDPR-configured)
- **🔒 Compliance**: GDPR/RGPD suite completa

### **Flujo de Desarrollo Optimizado:**

```bash
# 1. Setup inicial (una sola vez)
pnpm install                          # Instalación modular
pnpm run setup:all                    # Configuración completa

# 2. Desarrollo día a día
pnpm run dev                          # Desarrollo con hot-reload
pnpm run gdpr:validate                # Validación compliance
pnpm run security:scan                # Escaneo seguridad

# 3. Antes de commit
pnpm run qa:local                     # QA completo local
pnpm run test:coverage                # Tests con cobertura

# 4. Deploy
pnpm run build                        # Build optimizado
pnpm run release:patch                # Release automático
```

---

## 📚 Documentación Completa

### **🆕 Nuevos Documentos (Julio 2025):**

- **[ADR-005: Copilot-Agent GDPR Configuration](./docs/adrs/ADR-005-copilot-agent-gdpr-configuration.md)** -
  Configuración técnica avanzada
- **[GDPR Procedures](./gdpr/procedures/)** - Procedimientos de compliance
- **[Security Dependencies](./gdpr/security/security_dependencies.md)** -
  Análisis de dependencias
- **[Cookie Policy](./gdpr/POLITICA_COOKIES_EXHAUSTIVA.md)** -
  Política exhaustiva de cookies

### **📖 Documentación Existente:**

- **[WORKFLOW.md](./WORKFLOW.md)** - Guía paso a paso completa
- **[GitHub Automation Guide](./docs/GITHUB-AUTOMATION-GUIDE.md)** -
  Automatización GitHub
- **[Integrations Guide](./docs/INTEGRATIONS_COMPLETE_GUIDE.md)** -
  Configuración integraciones
- **[Cost Optimization Strategy](./docs/COST_OPTIMIZATION_STRATEGY.md)** -
  Optimización costos

---

## 🚀 Próximos Pasos Recomendados

### **Para Desarrolladores Nuevos:**

1. **Instalar pnpm**: `npm install -g pnpm`
2. **Clonar proyecto**: `git clone [repo]`
3. **Setup automático**: `pnpm run setup:all`
4. **Instalar extensiones VS Code** (automático al abrir workspace)
5. **Ejecutar validación**: `pnpm run gdpr:validate`

### **Para el Equipo Existente:**

1. **Migrar a pnpm**: Seguir [ADR-005](./docs/adrs/ADR-005-copilot-agent-gdpr-configuration.md)
2. **Configurar Copilot-Agent**: Automático con workspace
3. **Actualizar workflows**: Usar nuevos scripts pnpm
4. **Training GDPR**: Revisar documentación compliance

### **Para Deployment:**

1. **Verificar compliance**: `pnpm run gdpr:validate`
2. **Scan seguridad**: `pnpm run security:scan`
3. **Build optimizado**: `pnpm run build:production`
4. **Deploy automatizado**: Usar GitHub Actions

---

## 🎯 Métricas de Éxito

### **Performance (con pnpm):**

- ✅ **~50% más rápido** en instalación de dependencias
- ✅ **~30% reducción** en tamaño de node_modules
- ✅ **Tiempo de build mantenido** sin degradación

### **Compliance (GDPR):**

- ✅ **100% validación automática** de políticas cookies
- ✅ **Documentación legal completa** (DPIA, DPA, términos)
- ✅ **Procedimientos respuesta incidentes** implementados
- ✅ **Auditoría automática** 24/7 activa

### **Seguridad:**

- ✅ **0 vulnerabilidades críticas** detectadas
- ✅ **15 reglas ESLint security** activas
- ✅ **Escaneo automático** con Snyk integrado

---

## 🤝 Contribución

### **Flujo de Contribución Actualizado:**

1. **Fork del proyecto** y configurar pnpm
2. **Instalar dependencias**: `pnpm install`
3. **Configurar environment**: `cp gdpr/.env.example .env`
4. **Validar setup**: `pnpm run gdpr:validate`
5. **Desarrollar con compliance**: Copilot-Agent guiará automáticamente
6. **Testing completo**: `pnpm run qa:local`
7. **Crear Pull Request** con validaciones pasadas

### **Estándares de Código:**

- **GDPR by design**: Todo código debe cumplir RGPD
- **Security first**: Validación automática de vulnerabilidades
- **Documentation**: ADRs para decisiones técnicas importantes
- **Testing**: Cobertura >95% obligatoria

---

## 📞 Soporte y Contacto

### **🆕 Contactos GDPR:**

- **DPO (Data Protection Officer)**: [dpo@kopp-stadium.com](mailto:dpo@kopp-stadium.com)
- **Security Team**: [security@kopp-stadium.com](mailto:security@kopp-stadium.com)
- **Compliance Questions**: [compliance@kopp-stadium.com](mailto:compliance@kopp-stadium.com)

### **Contactos Técnicos:**

- **Technical Lead**: [tech-lead@kopp-stadium.com](mailto:tech-lead@kopp-stadium.com)
- **DevOps Team**: [devops@kopp-stadium.com](mailto:devops@kopp-stadium.com)
- **GitHub Issues**: Para bugs y feature requests

### **Recursos Útiles:**

- **🔗 AEPD**: [https://sedeagpd.gob.es/sede-electronica-web/](https://sedeagpd.gob.es/sede-electronica-web/)
- **🔗 RGPD Official**: [https://gdpr.eu/](https://gdpr.eu/)
- **🔗 pnpm Docs**: [https://pnpm.io/](https://pnpm.io/)
- **🔗 GitHub Copilot**: [https://github.com/features/copilot](https://github.com/features/copilot)

---

**📝 Última actualización**: 4 de julio de 2025  
**🚀 Versión**: 2.0.0 (pnpm + GDPR + Copilot-Agent)  
**🏟️ Developed with ❤️ for Kopp Stadium**

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

## 📚 Documentación API Oficial - Swagger/OpenAPI

### 🎯 FASE 1 COMPLETADA: Documentación Swagger Oficial

**✅ Documentación completa y gratuita implementada exitosamente**

| Formato             | URL              | Descripción                              |
| ------------------- | ---------------- | ---------------------------------------- |
| **🌐 Swagger UI**   | `/api-docs`      | Interfaz interactiva con pruebas en vivo |
| **📄 OpenAPI JSON** | `/api-docs.json` | Especificación exportable JSON           |
| **📝 OpenAPI YAML** | `/api-docs.yaml` | Especificación exportable YAML           |

### 🚀 Acceso Rápido

```bash
# Iniciar servidor con documentación
npm run dev

# Probar endpoints de Swagger
npm run docs:swagger

# Abrir Swagger UI automáticamente
npm run docs:open

# Validar documentación completa
npm run docs:validate
```

### 📊 12 Endpoints Completamente Documentados

- ✅ **Health & System** (3/3) - Health checks y versión
- ✅ **Slack Integration** (3/3) - Notificaciones y webhooks
- ✅ **HubSpot CRM** (3/3) - Contactos y lead scoring
- ✅ **Zapier Automation** (3/3) - Webhooks y automatización

### 🔒 Autenticación Documentada

- **JWT Bearer** - APIs principales
- **API Key** - Webhooks externos
- **Slack Signature** - Webhooks Slack
- **HubSpot Token** - API HubSpot

**📖 Documentación completa**: [SWAGGER_API_DOCUMENTATION.md](./docs/SWAGGER_API_DOCUMENTATION.md)

---

## 🚀 VS Code Tasks (Nuevas)

```bash
# Desde VS Code (Ctrl+Shift+P → Tasks: Run Task)
🔒 GDPR: Validación Completa          # Validación compliance integral
🛡️ Security: Snyk Scan               # Escaneo seguridad automático
📦 pnpm: Install Workspace            # Instalación workspace completa
🧹 pnpm: Clean Workspace              # Limpieza profunda workspace
📊 pnpm: Workspace Status             # Estado del workspace
🔍 pnpm: Audit Security               # Auditoría de seguridad
```

---

## 🤖 GitHub Copilot-Agent GDPR-Aware

### **Configuración Especializada**

El proyecto incluye configuración avanzada de **GitHub Copilot-Agent** específicamente
diseñada para desarrollo conforme al **RGPD**:

#### ✅ **Características Activas:**

- **Prompts especializados** para generación de código GDPR-compliant
- **Validación automática** de consentimientos antes de procesar datos
- **Patrones obligatorios** de pseudoanonimización y auditoría
- **Restricciones incorporadas** para prevenir hardcodeo de datos personales
- **Templates predefinidos** para componentes de privacidad

#### 🔧 **Configuración Aplicada:**

```json
{
  "copilot.agent.context": {
    "project_type": "crm_gdpr",
    "compliance_framework": ["RGPD", "LOPD-GDD", "ePrivacy"],
    "data_categories": ["personal", "behavioral", "technical"],
    "legal_bases": ["consent", "contract", "legitimate_interest"]
  },
  "copilot.agent.rules": {
    "data_minimization": "always",
    "purpose_limitation": "strict",
    "retention_limits": "enforce",
    "security_by_design": "mandatory"
  }
}
```

#### 🎯 **Ejemplos de Uso:**

```typescript
// Copilot generará automáticamente:
// 1. Validación de consentimiento
if (!(await ConsentManager.hasValidConsent(userId, purpose))) {
  throw new ConsentRequiredError();
}

// 2. Pseudoanonimización automática
const anonymizedId = pseudonymize(userId);

// 3. Logging de auditoría
await AuditLogger.log({
  action: 'data_processing',
  userId: anonymizedId,
  purpose,
  legalBasis,
  timestamp: new Date(),
});
```

📖 **Documentación completa**: [ADR-005](./docs/adrs/ADR-005-copilot-agent-gdpr-configuration.md)

---

## 🔐 Extensiones VS Code Recomendadas

### **Instalación Automática**

Las siguientes extensiones se instalarán automáticamente al abrir el workspace:

#### **🛡️ Seguridad y GDPR:**

- **Snyk Security**: Escaneo de vulnerabilidades en tiempo real
- **SonarLint**: Análisis de calidad de código y seguridad
- **Security Code Scan**: Detección de patrones inseguros
- **SecureCodeWarrior**: Educación en desarrollo seguro

#### **📦 pnpm Support:**

- **pnpm**: Integración nativa con pnpm
- **Zipfs**: Soporte para dependencias comprimidas

#### **🔍 Análisis y Debugging:**

- **Console Ninja**: Debugging avanzado
- **DataDog**: Monitorización de performance
- **Elastic APM**: Trazabilidad de requests

#### **📝 Productividad:**

- **Auto Rename Tag**: Productividad en desarrollo
- **Code Spell Checker**: Corrección ortográfica
- **Path Intellisense**: Autocompletado de rutas

---
