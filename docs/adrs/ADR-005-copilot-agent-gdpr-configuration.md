# ADR-005: Configuración Avanzada de GitHub Copilot-Agent para GDPR y Desarrollo Ético

**Estado:** ACEPTADO  
**Fecha:** 4 de julio de 2025  
**Autores:** Development Team + DPO  
**Contexto:** Fase GDPR y cumplimiento normativo

---

## 1. RESUMEN EJECUTIVO

Este ADR establece la configuración avanzada de GitHub Copilot-Agent específicamente adaptada para el desarrollo de funcionalidades GDPR, gestión ética de datos personales y cumplimiento normativo automatizado.

## 2. CONTEXTO Y ANTECEDENTES

### 2.1 Situación Actual

- **Proyecto:** Kopp Stadium CRM con funcionalidades GDPR avanzadas
- **Herramientas IA:** GitHub Copilot-Agent en uso básico
- **Necesidad:** Configuración específica para cumplimiento normativo
- **Objetivo:** Automatización ética y generación de código conforme RGPD

### 2.2 Drivers de Decisión

- **Compliance:** Necesidad de código que cumpla RGPD automáticamente
- **Eficiencia:** Generación automática de documentación legal
- **Consistencia:** Patrones de código estandarizados para privacidad
- **Auditoría:** Trazabilidad completa de decisiones de IA

---

## 3. DECISIÓN

### 3.1 Configuración de Copilot-Agent

#### 3.1.1 Configuración Base (.copilot-agent.yml)

```yaml
# .copilot-agent.yml - Configuración GDPR específica
version: 1.0
name: 'kopp-gdpr-copilot-agent'
description: 'GitHub Copilot Agent especializado en GDPR y cumplimiento normativo'

# Configuración de contexto específico
context:
  privacy_first: true
  gdpr_compliance: mandatory
  data_minimization: enforce
  consent_management: explicit

# Patrones de código preferidos
code_patterns:
  data_handling:
    - 'sempre pseudoanonimizar IDs'
    - 'validar consentimiento antes de procesar'
    - 'implementar retención automática'
    - 'logging de auditoría obligatorio'

  security:
    - 'cifrado AES-256 por defecto'
    - 'TLS 1.3 para comunicaciones'
    - 'validación input estricta'
    - 'sanitización SQL automática'

# Restricciones específicas
restrictions:
  - 'no hardcodear datos personales'
  - 'no logs con información sensible'
  - 'no transferencias sin validación'
  - 'no procesamientos sin base legal'

# Documentación automática
auto_documentation:
  privacy_notices: true
  dpia_updates: true
  consent_flows: true
  audit_trails: true
```

#### 3.1.2 Configuración de Workspace (.vscode/copilot-agent.json)

```json
{
  "copilot.agent.mode": "gdpr-compliance",
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
  },
  "copilot.agent.templates": {
    "privacy_class": "gdpr/templates/privacy-class.template",
    "consent_component": "gdpr/templates/consent-component.template",
    "audit_service": "gdpr/templates/audit-service.template",
    "dpo_report": "gdpr/templates/dpo-report.template"
  }
}
```

### 3.2 Prompts Especializados

#### 3.2.1 Prompt para Gestión de Datos

````markdown
# GDPR Data Handling Prompt

Cuando generes código para manejo de datos personales:

1. **SIEMPRE** implementar:
   - Validación de consentimiento previa
   - Pseudoanonimización de identificadores
   - Logging de auditoría con timestamp
   - Validación de base legal (Art. 6 RGPD)

2. **NUNCA** incluir:
   - Datos personales hardcodeados
   - Logs con información sensible
   - Transferencias sin validación de adequacy
   - Procesamientos sin documentar finalidad

3. **PATRONES OBLIGATORIOS:**

   ```typescript
   // Validación de consentimiento
   if (!(await ConsentManager.hasValidConsent(userId, purpose))) {
     throw new ConsentRequiredError();
   }

   // Auditoría obligatoria
   await AuditLogger.log({
     action: 'data_processing',
     userId: pseudonymize(userId),
     purpose,
     legalBasis,
     timestamp: new Date(),
   });
   ```
````

````

#### 3.2.2 Prompt para Componentes UI
```markdown
# GDPR UI Components Prompt
Para componentes de interfaz con datos personales:

1. **TRANSPARENCIA:** Información clara sobre procesamiento
2. **CONTROL:** Opciones de gestión de consentimiento
3. **ACCESIBILIDAD:** Compatible con lectores de pantalla
4. **MULTI-IDIOMA:** Soporte español/inglés mínimo

Incluir siempre:
- Enlaces a política de privacidad
- Opciones de ejercicio de derechos
- Información sobre transferencias internacionales
- Formularios de contacto DPO
````

### 3.3 Extensiones Recomendadas para Fase GDPR

#### 3.3.1 Extensiones de Seguridad y Compliance

```json
{
  "recommendations": [
    // GDPR y Privacidad
    "ms-vscode.privacy-policy-checker",
    "gdpr-compliance.gdpr-validator",
    "privacy-engineering.data-flow-analyzer",

    // Seguridad
    "snyk-security.snyk-vulnerability-scanner",
    "sonarqube.sonarlint",
    "ms-security.security-code-scan",
    "securecodewarrior.secure-code-warrior",

    // Auditoría y Logging
    "audit-trail.compliance-logger",
    "elasticsearch.elastic-apm",
    "datadog.datadog-vscode",

    // Documentación Legal
    "legal-docs.privacy-notice-generator",
    "compliance.dpia-assistant",
    "ms-legaltech.contract-analyzer",

    // Testing de Privacidad
    "privacy-testing.consent-flow-tester",
    "gdpr-testing.data-subject-rights-tester",
    "compliance-testing.automated-compliance-tests"
  ]
}
```

#### 3.3.2 Configuraciones Específicas por Extensión

**Snyk Security:**

```json
{
  "snyk.severity": "high",
  "snyk.scanOnSave": true,
  "snyk.additionalParams": "--severity-threshold=medium",
  "snyk.trustedFolders": ["gdpr/", "src/security/"]
}
```

**SonarLint:**

```json
{
  "sonarlint.rules": {
    "typescript:S3355": "error", // Datos sensibles en logs
    "typescript:S2068": "error", // Credenciales hardcodeadas
    "typescript:S5542": "error", // Cifrado débil
    "typescript:S4426": "error" // Criptografía insegura
  },
  "sonarlint.connectedMode.project": {
    "projectKey": "kopp-stadium-crm-gdpr"
  }
}
```

**GDPR Validator:**

```json
{
  "gdpr.enableRealTimeValidation": true,
  "gdpr.checkConsentImplementation": true,
  "gdpr.validateDataRetention": true,
  "gdpr.auditDataTransfers": true,
  "gdpr.complianceLevel": "strict"
}
```

---

## 4. MIGRACIÓN A PNPM

### 4.1 Justificación Técnica

#### 4.1.1 Ventajas de pnpm

- **Eficiencia:** Shared store, menor uso de disco
- **Velocidad:** Instalación ~2x más rápida que npm
- **Modularidad:** Mejor gestión de workspaces
- **Seguridad:** Hoist patterns más seguros
- **Compliance:** Mejor tracking de dependencias para auditorías

#### 4.1.2 Beneficios para GDPR

- **Auditoría:** Lockfile más detallado para compliance
- **Seguridad:** Validación estricta de dependencias
- **Transparencia:** Mejor visibilidad de la cadena de suministro
- **Eficiencia:** Menos overhead para CI/CD de compliance

### 4.2 Plan de Migración

#### 4.2.1 Fase 1: Instalación y Configuración

```bash
# 1. Instalar pnpm globalmente
npm install -g pnpm

# 2. Configurar workspace
echo "auto-install-peers=true
strict-peer-dependencies=false
save-workspace-protocol=rolling
prefer-workspace-packages=true
link-workspace-packages=true" > .npmrc

# 3. Crear pnpm-workspace.yaml
echo "packages:
  - 'packages/*'
  - 'gdpr/*'
  - 'src/*'
  - 'tests/*'" > pnpm-workspace.yaml
```

#### 4.2.2 Configuración pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  # Aplicación principal
  - '.'

  # Módulos GDPR especializados
  - 'gdpr/cookies'
  - 'gdpr/procedures'
  - 'gdpr/security'

  # Integraciones
  - 'src/integrations/*'
  - 'src/zaps/*'

  # Herramientas de testing
  - 'tests/*'

  # Scripts y utilidades
  - 'scripts/*'
```

### 4.3 Scripts Actualizados para pnpm

#### 4.3.1 package.json Principal

```json
{
  "scripts": {
    "dev": "pnpm exec ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "pnpm exec tsc && pnpm run copy-assets",
    "test": "pnpm exec jest",
    "test:coverage": "pnpm exec jest --coverage",
    "lint": "pnpm exec eslint \"src/**/*.{js,ts}\" --fix",
    "gdpr:validate": "pnpm --filter gdpr run validate",
    "gdpr:audit": "pnpm --filter gdpr run audit",
    "workspace:install": "pnpm install --recursive",
    "workspace:clean": "pnpm exec rimraf node_modules && pnpm store prune",
    "workspace:outdated": "pnpm outdated --recursive"
  }
}
```

---

## 5. CONFIGURACIÓN DE DESARROLLO GDPR

### 5.1 Settings.json Actualizado

```json
{
  // Configuración base existente...

  // Configuraciones GDPR específicas
  "copilot.chat.mode": "gdpr-compliance",
  "copilot.suggest.privacy": "strict",
  "copilot.enable.dataProtection": true,

  // Validación de privacidad en tiempo real
  "privacy.validator.enable": true,
  "privacy.validator.level": "strict",
  "privacy.validator.autoFix": false,

  // Auditoría de código
  "audit.trail.enable": true,
  "audit.trail.level": "verbose",
  "audit.trail.includeGitInfo": true,

  // Configuración de security scanning
  "security.scanner.enable": true,
  "security.scanner.onSave": true,
  "security.scanner.severity": "medium",

  // GDPR specific linting
  "eslint.rules.gdpr": {
    "no-hardcoded-personal-data": "error",
    "require-consent-validation": "error",
    "require-audit-logging": "warn",
    "validate-data-retention": "error"
  },

  // TypeScript específico para GDPR
  "typescript.preferences.gdpr": {
    "strictNullChecks": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitAny": true
  },

  // Configuración de workspace para pnpm
  "pnpm.enable": true,
  "pnpm.packageManager": "pnpm",
  "pnpm.workspace.enable": true,
  "pnpm.security.audit": true
}
```

### 5.2 Tasks.json para pnpm

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🔒 GDPR: Validación Completa",
      "type": "shell",
      "command": "pnpm",
      "args": ["run", "gdpr:validate"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "🛡️ Security: Audit Completo",
      "type": "shell",
      "command": "pnpm",
      "args": ["audit", "--audit-level", "moderate"],
      "group": "build"
    },
    {
      "label": "📊 pnpm: Workspace Status",
      "type": "shell",
      "command": "pnpm",
      "args": ["list", "--recursive", "--depth", "0"],
      "group": "build"
    },
    {
      "label": "🧹 pnpm: Clean Workspace",
      "type": "shell",
      "command": "pnpm",
      "args": ["run", "workspace:clean"],
      "group": "build"
    }
  ]
}
```

---

## 6. IMPLEMENTACIÓN

### 6.1 Cronograma de Implementación

#### Semana 1: Configuración Base

- [ ] Instalación y configuración de pnpm
- [ ] Migración de scripts de npm a pnpm
- [ ] Configuración de workspace

#### Semana 2: Extensiones GDPR

- [ ] Instalación de extensiones de compliance
- [ ] Configuración de security scanners
- [ ] Setup de audit logging

#### Semana 3: Copilot-Agent Avanzado

- [ ] Configuración de prompts especializados
- [ ] Templates para componentes GDPR
- [ ] Testing de generación automática

#### Semana 4: Validación y Documentación

- [ ] Testing completo del nuevo setup
- [ ] Documentación de workflows
- [ ] Training del equipo

### 6.2 Criterios de Éxito

✅ **Técnicos:**

- Reducción 50% en tiempo de instalación de dependencias
- 0 vulnerabilidades de seguridad de nivel alto
- Cobertura 100% de validaciones GDPR automáticas

✅ **Operacionales:**

- Documentación automática de compliance al 90%
- Tiempo de setup de nuevo desarrollador < 30 minutos
- Auditorías automatizadas funcionando 24/7

✅ **Legales:**

- 100% conformidad con RGPD en código generado
- Auditoría completa de dependencias para compliance
- Documentación automática de DPIA actualizada

---

## 7. RIESGOS Y MITIGACIONES

### 7.1 Riesgos Identificados

| Riesgo                           | Probabilidad | Impacto | Mitigación                         |
| -------------------------------- | ------------ | ------- | ---------------------------------- |
| **Incompatibilidad pnpm**        | Media        | Alto    | Testing exhaustivo + rollback plan |
| **Curva de aprendizaje**         | Alta         | Medio   | Training intensivo + documentación |
| **Overhead de compliance**       | Media        | Medio   | Automatización máxima              |
| **Falsos positivos en security** | Alta         | Bajo    | Fine-tuning de reglas              |

### 7.2 Plan de Rollback

```bash
# Rollback completo a npm
1. Desinstalar pnpm: npm uninstall -g pnpm
2. Restaurar package-lock.json desde backup
3. Reinstalar dependencias: npm install
4. Revertir scripts en package.json
5. Deshabilitar extensiones GDPR temporalmente
```

---

## 8. CONCLUSIONES

### 8.1 Decisión Final

**APROBADO** - Proceder con migración a pnpm + configuración avanzada de Copilot-Agent para GDPR

### 8.2 Próximos Pasos

1. **Inmediato:** Setup de pnpm y configuración básica
2. **Corto plazo:** Instalación de extensiones GDPR
3. **Medio plazo:** Configuración avanzada de Copilot-Agent
4. **Largo plazo:** Optimización y fine-tuning

### 8.3 Métricas de Seguimiento

- **Performance:** Tiempo de build/install
- **Security:** Número de vulnerabilidades detectadas
- **Compliance:** Porcentaje de código conforme GDPR
- **Developer Experience:** Satisfaction score del equipo

---

**Documento técnico de arquitectura**  
**Próxima revisión:** 4 de octubre de 2025  
**Versión:** 1.0  
**ID:** ADR-005

---

### APROBACIONES

- [ ] **Tech Lead:** _[Pendiente firma]_
- [ ] **DPO:** _[Pendiente firma]_
- [ ] **Security Officer:** _[Pendiente firma]_
- [ ] **Development Team:** _[Pendiente firma]_
