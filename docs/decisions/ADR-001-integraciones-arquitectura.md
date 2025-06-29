# ADR-001: Arquitectura de Integraciones Slack ↔ Zapier ↔ Hubspot

**Fecha:** 2025-06-29  
**Estado:** Propuesto  
**Decidido por:** Equipo de Desarrollo Kopp Stadium CRM

## Contexto

El sistema Kopp Stadium CRM requiere integración bidireccional entre múltiples plataformas:

- **Slack** para comunicación interna y notificaciones
- **Zapier** como middleware de automatización
- **Hubspot** como CRM principal

Se necesita automatizar flujos de datos específicos para mejorar la eficiencia operativa.

## Decisión

### Arquitectura Elegida: Hub and Spoke con Express.js como Orquestador

```
┌─────────────┐    webhook    ┌─────────────────┐    API calls    ┌─────────────┐
│   Zapier    │──────────────▶│  Express.js     │◀─────────────────│   Hubspot   │
│             │               │   (Orquestador) │                  │     CRM     │
└─────────────┘               │                 │                  └─────────────┘
                              │                 │
                              │                 │   Slack API
                              │                 │◀─────────────────┐
                              └─────────────────┘                  │
                                       ▲                           │
                                       │                           │
                                   webhooks                        │
                                       │                           │
                              ┌─────────────────┐                  │
                              │     Slack       │──────────────────┘
                              │   (Bot + App)   │
                              └─────────────────┘
```

### Flujos Implementados:

#### 1. **Zapier → Slack** (Notificaciones)

- **Trigger:** Cambios en Hubspot detectados por Zapier
- **Eventos:** `ritual_silencioso=true`, `usuario_imposible=true`
- **Canales destino:** `#rituales-silenciosos`, `#privado-retornos`
- **Formato:** Slack Blocks con botones de acción

#### 2. **Slack → Hubspot** (Sincronización)

- **Trigger:** Mensajes en canales monitoreados
- **Canales:** `#growth-marketing`, `#soporte-y-clientes`
- **Acción:** Crear/actualizar contactos + añadir notas de actividad

#### 3. **Hubspot → Slack** (Notificaciones de avance)

- **Trigger:** Cambios en `lifecyclestage` de contactos
- **Acción:** Notificar avances en el funnel de ventas
- **Personalización:** Mensajes específicos por etapa alcanzada

## Rationale

### Alternativas Consideradas:

1. **Zapier directo (sin orquestador)**
   - ❌ **Rechazado:** Limitaciones en lógica compleja, debugging difícil
   - ❌ **Rechazado:** Costos altos para flujos complejos

2. **Slack Apps nativas con Firebase Functions**
   - ❌ **Rechazado:** Vendor lock-in, complejidad de despliegue
   - ❌ **Rechazado:** Separación de lógica entre múltiples functions

3. **Arquitectura event-driven con queue (SQS/Redis)**
   - ❌ **Rechazado:** Over-engineering para el volumen actual
   - ❌ **Rechazado:** Complejidad operacional innecesaria

### Por qué Express.js como Orquestador:

- ✅ **Control total:** Lógica de negocio centralizada y debuggeable
- ✅ **Flexibility:** Fácil agregar nuevas integraciones
- ✅ **Cost-effective:** Una sola instancia maneja todos los flujos
- ✅ **Observability:** Logs centralizados, métricas unificadas
- ✅ **Testing:** Unit e integration tests más sencillos

## Consecuencias

### Positivas:

- **Mantenibilidad:** Código centralizado, fácil de debuggear
- **Escalabilidad:** Fácil agregar nuevas integraciones
- **Monitoreo:** Logs y métricas centralizadas
- **Testing:** Flujos testables end-to-end

### Negativas:

- **Single point of failure:** El servidor Express es crítico
- **Latencia adicional:** Un hop extra en comunicaciones
- **Operaciones:** Requiere monitoreo y deployment del orquestador

### Riesgos y Mitigaciones:

| Riesgo                  | Mitigación                             |
| ----------------------- | -------------------------------------- |
| Caída del orquestador   | Health checks + auto-restart + alertas |
| Rate limits de APIs     | Retry logic + exponential backoff      |
| Webhooks perdidos       | Webhook verification + idempotency     |
| Datos sensibles en logs | Log sanitization + encryption          |

## Implementación

### Fases:

1. **Fase 2a:** Zapier → Slack (notificaciones básicas)
2. **Fase 2b:** Slack → Hubspot (sincronización)
3. **Fase 2c:** Hubspot → Slack (notificaciones de avance)
4. **Fase 2d:** Optimización y monitoreo

### Métricas de Éxito:

- **Latencia:** < 2 segundos end-to-end
- **Disponibilidad:** > 99.5%
- **Accuracy:** 100% de mensajes entregados
- **Adoption:** > 80% de uso en canales target

---

## Referencias

- [Slack API Documentation](https://api.slack.com/)
- [Hubspot API v3](https://developers.hubspot.com/docs/api/overview)
- [Zapier Developer Platform](https://platform.zapier.com/)
