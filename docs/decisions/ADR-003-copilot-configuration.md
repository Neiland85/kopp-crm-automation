# ADR-003: Configuración GitHub Copilot - Scopes y Restricciones

**Fecha:** 2025-06-29  
**Estado:** Aceptado  
**Decidido por:** Equipo de Desarrollo Kopp Stadium CRM

## Contexto

El proyecto `kopp-crm-automation` requiere configuración específica para GitHub Copilot que balancee productividad de desarrollo con control sobre sugerencias automáticas, especialmente durante las fases tempranas del proyecto.

## Decisión

### Scopes Habilitados (Fase 0 - Implementación Base)

```yaml
scopes:
  - '**/*.ts' # TypeScript - core del proyecto
  - '**/*.js' # JavaScript - scripts auxiliares
  - '**/*.json' # Configuración de dependencias
  - '**/*.yaml' # Workflows CI/CD
  - '**/*.md' # Documentación
```

### Herramientas Integradas

- **ESLint:** Habilitado para mantener consistencia de código
- **Prettier:** Formateo automático al guardar
- **Jest:** Soporte para testing y sugerencias de pruebas
- **YAMLLint:** Validación de workflows y configuraciones

### Restricciones Implementadas

```yaml
enableIntrospection: false # Fase 0: sin decisiones estructurales complejas
skipPaths:
  - 'node_modules' # Dependencias externas
  - '.git' # Control de versiones
  - 'coverage' # Reportes de cobertura
  - 'dist' # Build artifacts
  - '*.log' # Archivos de log
```

## Rationale

### ✅ Por qué estos scopes:

1. **TypeScript/JavaScript:** Core del proyecto, máxima productividad
2. **JSON:** Configuraciones críticas (package.json, tsconfig.json)
3. **YAML:** Workflows GitHub Actions y configuraciones
4. **Markdown:** Documentación y ADRs

### ❌ Por qué NO otros tipos:

- **Archivos de configuración específicos** (.env, secrets): Seguridad
- **Archivos binarios**: No aplica
- **Código generado**: Mantener control manual

### 🚫 Introspección Deshabilitada (Fase 0)

- Evita sugerencias estructurales complejas
- Mantiene control sobre arquitectura inicial
- Se habilitará en fases posteriores según ADR-001

## Configuración Técnica

### Archivo: `.vscode/copilot.settings.json`

```json
{
  "github.copilot.enable": { "*": true },
  "copilot.experimental.inlineSuggest.enable": true,
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript", "typescript", "yaml", "json"],
  "files.exclude": {
    "**/logs": true,
    "**/dist": true,
    "**/node_modules": true,
    "**/coverage": true,
    "**/.git": true
  }
}
```

## Consequences

### Positivas ✅

- **Productividad aumentada** en desarrollo TypeScript/JavaScript
- **Consistencia de código** con ESLint + Prettier
- **Control sobre arquitectura** con introspección deshabilitada
- **Seguridad mantenida** excluyendo archivos sensibles

### Negativas ⚠️

- Sugerencias limitadas para otros tipos de archivo
- Requerirá actualización en fases posteriores
- Dependencia de configuración manual para archivos excluidos

## Revisión Programada

- **Fase 1 (Post-MVP):** Evaluar habilitación de introspección
- **Trimestral:** Revisar scopes basado en necesidades del equipo
- **Post-Release:** Evaluar inclusión de tipos adicionales

---

**Relacionado con:**

- ADR-001: Arquitectura de Integraciones
- ADR-002: Política de Testing y QA
