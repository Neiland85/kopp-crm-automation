# ADR-002: Política de Testing y QA

**Status:** Accepted  
**Date:** 2025-06-29  
**Deciders:** Kopp Stadium Development Team

## Context

El proyecto `kopp-crm-automation` necesita una estrategia sólida de testing y QA para garantizar la confiabilidad de las integraciones entre Slack, Hubspot y Zapier. Dado que se trata de un sistema crítico para automatización de CRM, es esencial establecer políticas claras de testing y procedimientos de QA.

## Decision

### Niveles de Testing

1. **Unit Tests (Pruebas Unitarias)**
   - Cobertura mínima del 80% para funciones críticas
   - Framework: Jest + TypeScript
   - Ubicación: `src/__tests__/unit/`
   - Ejecutar en: desarrollo local, CI/CD

2. **Integration Tests (Pruebas de Integración)**
   - Validar comunicación entre servicios internos
   - Mocks para APIs externas (Slack, Hubspot, Zapier)
   - Ubicación: `src/__tests__/integration/`
   - Ejecutar en: CI/CD, staging

3. **E2E Tests (Pruebas End-to-End)**
   - Validar workflows completos
   - Incluir health checks y endpoints críticos
   - Framework: Jest + Supertest
   - Ubicación: `src/__tests__/e2e/`
   - Ejecutar en: staging, pre-production

### Herramientas y Configuración

- **Testing Framework:** Jest con ts-jest preset
- **Coverage Tool:** Jest built-in coverage
- **API Testing:** Supertest para endpoints HTTP
- **Mocking:** Jest mocks para servicios externos
- **Linting:** ESLint con reglas específicas para tests

### Scripts NPM Definidos

```json
{
  "test": "jest",
  "test:unit": "jest --testPathPattern=__tests__/unit",
  "test:integration": "jest --testPathPattern=__tests__/integration",
  "test:e2e": "jest --testPathPattern=__tests__/e2e",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "npm run lint:check && npm run test:coverage"
}
```

### QA y Reporting

1. **Local QA:**
   - Ejecutar `npm run qa:local` antes de commits
   - Incluye: linting, unit tests, build verification

2. **Staging QA:**
   - Ejecutar `npm run qa:staging` en ambiente de staging
   - Incluye: integration tests, E2E tests, security audit

3. **Slack Reporting:**
   - Reportes automáticos en `#kopp-crm-tests` para resultados
   - Reportes de QA completos en `#kopp-crm-qa`
   - Scripts: `slackTestReport.js`, `qaReport.js`

### Criterios de Calidad

- **Coverage Mínimo:** 80% para líneas, 70% para branches
- **Performance:** Tiempo de respuesta < 2s para endpoints críticos
- **Security:** Audit automático con `npm audit`
- **Code Quality:** ESLint score sin errores

### Environments y Gates

1. **Development:**
   - Unit tests obligatorios
   - Linting automático

2. **Staging:**
   - All tests + coverage report
   - Security audit
   - Performance validation

3. **Production:**
   - Full QA suite passed
   - Manual approval after automated checks
   - Rollback plan documented

## Consequences

### Positive

- Mayor confiabilidad en integraciones críticas
- Detección temprana de errores
- Documentación viva del comportamiento esperado
- Reporting automático reduce overhead manual
- Consistency entre ambientes

### Negative

- Tiempo adicional en desarrollo inicial
- Configuración y mantenimiento de testing infrastructure
- Posible overhead en CI/CD pipelines
- Curva de aprendizaje para testing patterns

### Risks

- **Over-testing:** Balance entre cobertura y velocidad de desarrollo
- **Flaky tests:** Especialmente en E2E con APIs externas
- **Maintenance:** Tests desactualizados pueden generar falsos positivos

### Mitigation

- Revisión periódica de test suite relevance
- Mocking strategies para reducir dependencias externas
- Automated test maintenance en CI/CD
- Clear documentation de testing patterns

## Implementation Plan

1. **Phase 1:** Unit tests para servicios críticos ✅
2. **Phase 2:** Integration tests para flujos principales ✅
3. **Phase 3:** E2E tests para workflows completos ✅
4. **Phase 4:** Slack reporting automation ✅
5. **Phase 5:** Performance y security testing (Next)

## Related ADRs

- ADR-001: Arquitectura de Integraciones
- ADR-003: CI/CD Pipeline (Pending)
- ADR-004: Security Policies (Pending)
