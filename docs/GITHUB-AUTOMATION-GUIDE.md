# 🚀 Scripts de Automatización GitHub - Kopp CRM

Esta documentación describe los scripts de automatización para la configuración de GitHub Secrets y workflows de CI/CD.

## 📋 **Scripts Disponibles**

### **1. Setup GitHub Secrets (`scripts/setup-secrets.sh`)**

Script principal para configurar automáticamente los secrets de GitHub necesarios para el proyecto.

#### **Uso:**

```bash
# Configurar todos los secrets desde .env
npm run github:setup-secrets
# o directamente:
bash scripts/setup-secrets.sh

# Verificar secrets existentes
npm run github:verify-secrets
# o:
bash scripts/setup-secrets.sh --verify

# Listar secrets actuales
npm run github:list-secrets
# o:
bash scripts/setup-secrets.sh --list

# Mostrar ayuda
bash scripts/setup-secrets.sh --help
```

#### **Prerrequisitos:**

1. **GitHub CLI instalado y autenticado:**

   ```bash
   # macOS
   brew install gh

   # Ubuntu/Debian
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg

   # Autenticar
   gh auth login
   ```

2. **Archivo `.env` configurado:**
   ```bash
   cp .env.example .env
   # Editar .env con valores reales
   ```

#### **Secrets Configurados:**

**🔑 Secrets Obligatorios:**

- `HUBSPOT_API_KEY` - API key de Hubspot
- `SLACK_WEBHOOK_URL` - Webhook URL de Slack

**🔑 Secrets Opcionales:**

- `SLACK_BOT_TOKEN` - Token del bot de Slack
- `SLACK_SIGNING_SECRET` - Secret de verificación de Slack
- `ZAPIER_WEBHOOK_URL` - URL de webhook de Zapier
- `VERCEL_TOKEN` - Token de Vercel para deployment
- `VERCEL_ORG_ID` - ID de organización de Vercel
- `VERCEL_PROJECT_ID` - ID del proyecto en Vercel

**📱 Canales de Slack:**

- `SLACK_TEST_CHANNEL` (default: `#kopp-crm-tests`)
- `SLACK_QA_CHANNEL` (default: `#kopp-crm-qa`)
- `SLACK_RELEASE_CHANNEL` (default: `#anuncios-kopp`)
- `SLACK_DEV_CHANNEL` (default: `#equipo-dev`)

---

### **2. Coverage Badge Generator (`scripts/generate-coverage-badge.sh`)**

Script para generar badge de cobertura de código y actualizar el README.md automáticamente.

#### **Uso:**

```bash
# Generar badge de cobertura
npm run coverage:badge
# o directamente:
bash scripts/generate-coverage-badge.sh

# Ver reporte de cobertura en navegador
npm run coverage:open
```

#### **Funcionalidades:**

- ✅ Ejecuta tests con cobertura si no existe reporte
- ✅ Extrae porcentaje de cobertura del reporte Jest
- ✅ Genera badge con color dinámico basado en porcentaje:
  - 90%+ → Verde brillante
  - 80-89% → Verde
  - 70-79% → Amarillo
  - 60-69% → Naranja
  - <60% → Rojo
- ✅ Actualiza README.md automáticamente
- ✅ Proporciona markdown y HTML del badge

---

## 🔄 **Workflow CI (`/.github/workflows/ci.yml`)**

Workflow completo de Integración Continua configurado para ejecutar automáticamente en:

- ✅ Push a branches `main` y `develop`
- ✅ Pull requests hacia `main` y `develop`
- ✅ Ejecución manual (workflow_dispatch)

### **Jobs Configurados:**

#### **🧪 Test Suite**

- Ejecuta en Node.js 18.x y 20.x
- Instala dependencias con `npm ci`
- Ejecuta linting con `npm run lint:check`
- Ejecuta tests con cobertura `npm run test:coverage`
- Sube cobertura a Codecov
- Agrega comentario de cobertura en PRs
- Envía reporte a Slack

#### **🏗️ Build**

- Compila la aplicación con `npm run build`
- Genera artefactos de build
- Reporta tamaño del build

#### **🔍 Quality Check**

- Ejecuta auditoría de seguridad
- Verifica TypeScript sin errores
- Genera reporte QA completo

#### **🏆 Coverage Badge**

- Genera badge de cobertura actualizado
- Solo en branch `main`

#### **📱 Slack Notifications**

- Notifica éxito/fallo a canales Slack configurados
- Incluye información detallada del build

### **Variables de Entorno del Workflow:**

```yaml
NODE_VERSION: '20.x'  # Versión principal de Node.js

# Secrets requeridos (configurados por setup-secrets.sh):
SLACK_WEBHOOK_URL      # Notificaciones Slack
HUBSPOT_API_KEY        # Tests de integración
SLACK_BOT_TOKEN        # Tests Slack
CODECOV_TOKEN          # Cobertura (opcional)
```

---

## 📊 **Badges Disponibles**

Una vez configurado, tendrás estos badges disponibles:

```markdown
# CI Status

![CI](https://github.com/kopp-stadium/kopp-crm-automation/workflows/CI%20-%20Continuous%20Integration/badge.svg)

# Coverage (generado automáticamente)

![Coverage](https://img.shields.io/badge/Coverage-XX%25-green?style=flat-square&logo=jest)

# Node.js Version

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)

# License

![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
```

---

## 🚀 **Quick Start**

### **Configuración Inicial Completa:**

```bash
# 1. Instalar GitHub CLI y autenticar
brew install gh  # macOS
gh auth login

# 2. Configurar .env
cp .env.example .env
# Editar .env con valores reales

# 3. Configurar GitHub Secrets
npm run github:setup-secrets

# 4. Verificar configuración
npm run github:verify-secrets

# 5. Ejecutar tests y generar badge
npm run test:coverage
npm run coverage:badge

# 6. Commit y push para activar CI
git add .
git commit -m "feat: setup GitHub secrets and CI workflow"
git push origin main
```

### **Verificación del Setup:**

1. **GitHub Secrets:** https://github.com/kopp-stadium/kopp-crm-automation/settings/secrets/actions
2. **GitHub Actions:** https://github.com/kopp-stadium/kopp-crm-automation/actions
3. **Codecov Dashboard:** https://codecov.io/gh/kopp-stadium/kopp-crm-automation

---

## 🔧 **Troubleshooting**

### **Problemas Comunes:**

#### **1. Error: GitHub CLI no autenticado**

```bash
gh auth status  # Verificar estado
gh auth login   # Autenticar si es necesario
```

#### **2. Error: .env file not found**

```bash
cp .env.example .env
# Editar .env con valores reales
```

#### **3. Error: Secrets not accessible**

```bash
# Verificar permisos del repositorio
gh repo view kopp-stadium/kopp-crm-automation

# Verificar si tienes permisos de admin
gh api repos/kopp-stadium/kopp-crm-automation/collaborators/$(gh api user --jq .login) --jq .permission
```

#### **4. Error: Coverage file not found**

```bash
# Ejecutar tests primero
npm run test:coverage

# Verificar que se generó el archivo
ls -la coverage/coverage-summary.json
```

#### **5. Error: jq command not found**

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

---

## 📚 **Referencias**

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Jest Coverage Documentation](https://jestjs.io/docs/code-coverage)
- [Codecov Documentation](https://docs.codecov.com/)
- [Slack Webhooks Documentation](https://api.slack.com/messaging/webhooks)

---

## 🎯 **Próximos Pasos**

1. **Configurar Codecov Token** para mejores reportes de cobertura
2. **Configurar Branch Protection Rules** en GitHub
3. **Agregar más badges** al README.md
4. **Configurar dependabot** para actualizaciones automáticas
5. **Configurar semantic-release** para releases automáticos
