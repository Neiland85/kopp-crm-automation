# ADR-HUB-05: HubSpot DevTools y Propiedades Personalizadas

## Status

✅ **Accepted** - Implementado en Fase 1

## Context

Kopp Stadium CRM necesita integración profunda con HubSpot para automatización de lead scoring y gestión de contactos. Se requiere configuración de propiedades personalizadas, workflows automáticos y uso eficiente de HubSpot DevTools para desarrollo y debugging.

## Decision

### 1. HubSpot DevTools Configuration

#### Development Setup

- **HubSpot CLI**: Instalación obligatoria para desarrollo
- **VSCode Extension**: `hubspot.vscode-devtools` como extensión requerida
- **API Access**: Private App con scopes específicos y limitados
- **Local Development**: Usar HubSpot local development server para testing

#### DevTools Integration

```bash
# Instalación y configuración
npm install -g @hubspot/cli
hs init --access-token $HUBSPOT_API_KEY
hs create function lead-scoring-automation
```

### 2. Propiedades Personalizadas Requeridas

#### Core Properties

| Propiedad                   | Tipo        | Propósito                      | Requerido   |
| --------------------------- | ----------- | ------------------------------ | ----------- |
| `lead_score`                | Number      | Puntuación interna del lead    | ✅          |
| `external_score`            | Number      | Puntuación desde Google Sheets | ✅          |
| `last_score_update`         | DateTime    | Timestamp última actualización | ✅          |
| `scoring_source`            | String      | Fuente de la puntuación        | ⚠️ Opcional |
| `lead_qualification_status` | Enumeration | Estado de calificación         | ⚠️ Opcional |

#### Property Configuration

```json
{
  "lead_score": {
    "label": "Lead Score",
    "type": "number",
    "fieldType": "number",
    "groupName": "kopp_scoring",
    "description": "Puntuación interna del lead basada en comportamiento",
    "options": [],
    "displayOrder": 1
  },
  "external_score": {
    "label": "External Score",
    "type": "number",
    "fieldType": "number",
    "groupName": "kopp_scoring",
    "description": "Puntuación externa del lead desde Google Sheets",
    "options": [],
    "displayOrder": 2
  },
  "last_score_update": {
    "label": "Last Score Update",
    "type": "datetime",
    "fieldType": "date",
    "groupName": "kopp_scoring",
    "description": "Timestamp de la última actualización de puntuación",
    "options": [],
    "displayOrder": 3
  }
}
```

### 3. Workflows Automation

#### Primary Workflow: Score Update

- **Trigger**: Contact property `lead_score` changes
- **Condition**: Score > 0
- **Actions**:
  1. Set `last_score_update` = current timestamp
  2. If score > 50: Create task for sales team
  3. If score > 75: Send internal notification

#### Secondary Workflow: External Score Integration

- **Trigger**: Contact property `external_score` changes
- **Condition**: External score differs from internal score
- **Actions**:
  1. Update `lead_score` with calculated average
  2. Log scoring discrepancy
  3. Trigger Slack notification if significant difference

### 4. API Integration Strategy

#### Authentication

```typescript
interface HubSpotConfig {
  apiKey: string;
  baseURL: 'https://api.hubapi.com';
  timeout: 30000; // 30 seconds
  retries: 3;
  rateLimit: {
    daily: 40000;
    burst: 100;
  };
}
```

#### Contact Operations

```typescript
interface ContactOperations {
  create(properties: ContactProperties): Promise<Contact>;
  update(id: string, properties: Partial<ContactProperties>): Promise<Contact>;
  search(filters: SearchFilters): Promise<Contact[]>;
  getByEmail(email: string): Promise<Contact | null>;
}
```

#### Rate Limiting Strategy

- **Daily Limit**: 40,000 requests/day (monitored)
- **Burst Limit**: 100 requests/10 seconds
- **Retry Logic**: Exponential backoff on 429 responses
- **Circuit Breaker**: Temporary disable on persistent failures

### 5. Development Workflow

#### Local Development

1. **Setup**: `hs init` con personal access token
2. **Development**: Local HubSpot functions para testing
3. **Testing**: Sandbox portal para validation
4. **Deployment**: Production deployment via DevTools

#### Testing Strategy

```typescript
// Mock para testing
const mockHubSpotClient = {
  contacts: {
    create: jest.fn(),
    update: jest.fn(),
    search: jest.fn(),
  },
};
```

### 6. Property Groups y Organization

#### Custom Property Group: "Kopp Scoring"

- **Name**: `kopp_scoring`
- **Label**: "Kopp Lead Scoring"
- **Display Order**: Alto priority
- **Properties**: Todas las propiedades de scoring

#### Field Validation

```typescript
const validateLeadScore = (score: number): boolean => {
  return score >= 0 && score <= 100 && Number.isInteger(score);
};

const validateExternalScore = (score: number): boolean => {
  return score >= 0 && score <= 100;
};
```

## Consequences

### ✅ Positive

- **Standardization**: Propiedades consistentes y bien organizadas
- **Automation**: Workflows automáticos reducen trabajo manual
- **Developer Experience**: DevTools mejora productividad
- **Data Quality**: Validación y constraints aseguran integridad
- **Monitoring**: Tracking de cambios y updates automático

### ⚠️ Negative

- **Complexity**: Setup inicial requiere configuración manual
- **Rate Limits**: Restricciones de API pueden limitar operaciones
- **Dependency**: Fuerte dependencia en HubSpot uptime
- **Cost**: Llamadas API consumen límites diarios

### 🔄 Mitigation

- Scripts automatizados para setup de propiedades
- Rate limiting inteligente con retry logic
- Fallback strategies para HubSpot downtime
- Monitoring de API usage para optimización

## Implementation

### Phase 1: Core Properties ✅

- [x] Crear propiedades personalizadas
- [x] Configurar property group
- [x] Implementar validation logic
- [x] Setup basic workflows

### Phase 2: Advanced Automation 🔧

- [ ] Implement complex scoring algorithms
- [ ] Add advanced workflow triggers
- [ ] Create custom HubSpot functions
- [ ] Optimize API usage patterns

### Phase 3: Analytics & Reporting 📊

- [ ] Custom reporting dashboard
- [ ] Lead scoring analytics
- [ ] Performance metrics tracking
- [ ] ROI measurement tools

## Technical Implementation

### Property Creation Script

```bash
# Script automatizado para crear propiedades
#!/bin/bash
curl -X POST "https://api.hubapi.com/properties/v1/contacts/properties" \
  -H "Authorization: Bearer $HUBSPOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d @hubspot-properties.json
```

### DevTools Configuration

```json
{
  "hubspot.devtools.enable": true,
  "hubspot.devtools.apiKey": "${env:HUBSPOT_API_KEY}",
  "hubspot.devtools.portalId": "${env:HUBSPOT_PORTAL_ID}",
  "hubspot.devtools.sandbox": true
}
```

## References

- [HubSpot DevTools Documentation](https://developers.hubspot.com/docs/cms/developer-tools)
- [HubSpot Properties API](https://developers.hubspot.com/docs/api/crm/properties)
- [HubSpot Workflows API](https://developers.hubspot.com/docs/api/automation/workflows)
- [Rate Limiting Best Practices](https://developers.hubspot.com/docs/api/usage-details)

---

**Date**: 2025-06-29  
**Author**: Kopp CRM Team  
**Review**: Quarterly  
**Related ADRs**: ADR-ZAP-01, ADR-COST-01
