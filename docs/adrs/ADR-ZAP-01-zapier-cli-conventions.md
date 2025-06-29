# ADR-ZAP-01: Zapier CLI Naming, Triggers y Error-Handling

## Status

✅ **Accepted** - Implementado en Fase 1

## Context

Kopp Stadium CRM requiere integración robusta con Zapier CLI 1.3+ para automatización de workflows entre Google Sheets, HubSpot y Slack. Se necesita establecer convenciones de naming, manejo de triggers y estrategias de error-handling optimizadas para costos.

## Decision

### 1. Naming Conventions

#### Triggers

- **Formato**: `new{Source}{Entity}{Action}`
- **Ejemplos**:
  - `newGoogleSheetsLeadScoring`
  - `newFormSubmission`
  - `pageView`
  - `updatedContactProperty`

#### Actions (Creates)

- **Formato**: `{action}{Target}{Entity}` o `{verb}{Noun}`
- **Ejemplos**:
  - `updateHubSpotExternalScore`
  - `sendHighScoreSlackAlert`
  - `hubspotContact`
  - `slackNotification`

#### Files Structure

```
src/zapier/
├── triggers/
│   ├── newGoogleSheetsLeadScoring.ts
│   ├── newFormSubmission.ts
│   ├── pageView.ts
│   └── updatedContactProperty.ts
├── creates/
│   ├── hubspotContact.ts
│   ├── slackNotification.ts
│   ├── updateHubSpotExternalScore.ts
│   ├── sendHighScoreSlackAlert.ts
│   ├── sendScoringNotification.ts
│   └── updateScoreTimestamp.ts
├── utils/
│   └── common.ts
├── types.ts
└── index.ts
```

### 2. Trigger Configuration

#### Polling Strategy

- **Frecuencia**: 15 minutos (cost-optimized)
- **Timeout**: 30 segundos máximo
- **Retry Logic**: Exponential backoff (3 intentos máximo)

#### Sample Data Structure

```typescript
interface TriggerSample {
  id: string;
  timestamp: string;
  data: Record<string, any>;
  source: string;
}
```

### 3. Error-Handling Strategy

#### Hierarchical Error Handling

1. **API Level**: Catch y log errores de API
2. **Action Level**: Retry con backoff exponencial
3. **Workflow Level**: Graceful degradation
4. **System Level**: Alert en Slack para errores críticos

#### Error Types

```typescript
enum ErrorType {
  API_LIMIT = 'api_limit',
  NETWORK = 'network',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown',
}
```

#### Retry Configuration

```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  exponentialBase: 2,
};
```

### 4. Introspection Requirements

- **Enable introspection**: `true` (requerido para debugging)
- **Log level**: `info` en desarrollo, `error` en producción
- **Metrics tracking**: Latencia, success rate, error rate

### 5. TypeScript Integration

#### Strict Types

```typescript
interface ZapierBundle {
  authData: AuthData;
  inputData: Record<string, any>;
  meta: BundleMeta;
  subscribeData?: SubscribeData;
}

interface ZapierResponse<T = any> {
  data: T;
  status: number;
  error?: string;
}
```

#### Validation

- Usar `zod` para validación de schemas
- Input validation en todos los endpoints
- Output validation para responses críticos

## Consequences

### ✅ Positive

- **Consistencia**: Naming conventions claras y predecibles
- **Debugging**: Introspection habilitada facilita troubleshooting
- **Reliability**: Error handling robusto reduce fallos
- **Cost Optimization**: Retry logic inteligente minimiza re-ejecuciones
- **Maintainability**: Estructura clara y tipado estricto

### ⚠️ Negative

- **Complexity**: Mayor overhead de configuración inicial
- **Performance**: Introspection puede agregar latencia mínima
- **Learning Curve**: Equipo debe aprender convenciones específicas

### 🔄 Mitigation

- Documentación exhaustiva de convenciones
- Examples y templates para nuevos triggers/actions
- Automated linting para enforcing naming conventions
- Performance monitoring para detectar impacto de introspection

## Implementation

### Phase 1: Core Structure ✅

- [x] Implementar estructura de carpetas
- [x] Crear triggers básicos
- [x] Configurar error handling base
- [x] Setup TypeScript types

### Phase 2: Advanced Features 🔧

- [ ] Implement comprehensive retry logic
- [ ] Add metrics and monitoring
- [ ] Create automated testing framework
- [ ] Optimize performance based on usage data

## References

- [Zapier CLI Documentation](https://zapier.com/developer/documentation/)
- [TypeScript Error Handling Best Practices](https://typescript-eslint.io/)
- [Google Sheets API Rate Limits](https://developers.google.com/sheets/api/limits)
- [HubSpot API Rate Limits](https://developers.hubspot.com/docs/api/usage-details)

---

**Date**: 2025-06-29  
**Author**: Kopp CRM Team  
**Review**: Quarterly
