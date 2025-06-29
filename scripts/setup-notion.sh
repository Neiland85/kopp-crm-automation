#!/bin/bash

# 📝 Notion Integration Setup
# Configuración de documentación en Notion

set -e

echo "📝 Configurando Integración de Notion..."

# Verificar token (opcional)
if [ -z "$NOTION_TOKEN" ]; then
    echo "⚠️  NOTION_TOKEN no configurado (opcional)"
    echo "💡 Para integración completa, añade NOTION_TOKEN a tu .env"
    echo "🌐 Obtén token en: https://www.notion.so/my-integrations"
else
    echo "✅ NOTION_TOKEN configurado"
fi

# Crear estructura de documentación local
echo "📋 Creando estructura de documentación..."

mkdir -p docs/notion_templates

# Template para página principal
cat > docs/notion_templates/fase_1_core_integration.md << 'EOF'
# Fase 1 - Integración Core | Kopp Stadium CRM

## 🎯 Objetivo
Implementar integración completa entre Google Sheets, HubSpot, Slack y Zapier para automatización de lead scoring.

## ✅ Estado de Integración

### 🔧 Slack Integration
- **Estado**: ✅ Configurada
- **Canales**: #automations-alerts, #scoring-leads  
- **Bot**: Activo y configurado
- **Webhooks**: Funcionando

### 🔗 Zapier Integration  
- **Estado**: 🔧 En configuración
- **App**: kopp_crm_integration
- **Triggers**: 4 configurados
- **Actions**: 6 configuradas

### 🌐 HubSpot Integration
- **Estado**: ✅ API conectada
- **Propiedades**: lead_score, external_score, last_score_update
- **Workflows**: Contact-based configurado

### 📊 Google Sheets Integration
- **Estado**: 🔧 En desarrollo  
- **Sheet**: Lead Scoring
- **Trigger**: Polling cada 15 minutos
- **Campos**: email, external_score, name, company, source

## 🏗️ Arquitectura Técnica

### Flujo de Datos
1. **Google Sheets** → Nuevo lead con scoring
2. **Zapier Trigger** → Detecta nueva fila
3. **HubSpot Action** → Actualiza external_score
4. **Slack Action** → Alerta si score > 50

### Componentes Clave
- **Triggers**: newGoogleSheetsLeadScoring, newFormSubmission, pageView, updatedContactProperty
- **Actions**: hubspotContact, slackNotification, updateHubSpotExternalScore, sendHighScoreSlackAlert

## 📋 Configuración Completada

### Variables de Entorno
```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
HUBSPOT_API_KEY=...
ZAPIER_WEBHOOK_URL=...
NOTION_TOKEN=... (opcional)
```

### Archivos de Configuración
- `config/slack_setup.json` - Configuración Slack
- `config/hubspot_setup.json` - Configuración HubSpot  
- `zapier_deployment_config.json` - Configuración Zapier
- `config/workspace_integration_config.json` - Config general

## 🧪 Testing y Validación

### Tests Locales
```bash
npm run validate:local    # Validación completa local
npm run test:fast        # Tests rápidos
npm run qa:minimal       # QA optimizado
```

### Tests de Integración
- ✅ Slack: Envío de mensajes
- ✅ HubSpot: CRUD de contactos
- 🔧 Zapier: Triggers y actions
- 🔧 Google Sheets: Polling y parsing

## 🚀 Despliegue

### GitHub Actions Optimizado
- **CI**: 4 minutos máximo, solo main branch
- **Deploy**: 6 minutos máximo, solo tags v*
- **Ahorro**: 84% reducción en minutos

### Estrategia de Costos
- Desarrollo local prioritario
- Workflows minimalistas
- Timeouts agresivos
- Solo ejecución en branches críticos

## 📈 Próximos Pasos

### Inmediatos
1. Completar configuración Zapier
2. Probar flujo end-to-end
3. Validar scoring automation
4. Documentar casos de uso

### Escalabilidad Post-Acuerdo
1. Workflows completos CI/CD
2. Matrix builds (Node 18.x, 20.x)
3. Coverage reporting completo
4. Notificaciones Slack automáticas
5. Deployment automático a producción

## 🔗 Enlaces Útiles
- [Repositorio GitHub](https://github.com/tu-usuario/kopp-crm-automation)
- [Slack Workspace](https://kopp-stadium.slack.com)
- [HubSpot Dashboard](https://app.hubspot.com)
- [Zapier Dashboard](https://zapier.com/app/dashboard)

---
*Documentación generada automáticamente | Última actualización: $(date)*
EOF

# Template para checklist de configuración
cat > docs/notion_templates/setup_checklist.md << 'EOF'
# ✅ Setup Checklist - Kopp CRM Integration

## 🔧 Configuración Inicial

### Variables de Entorno
- [ ] SLACK_BOT_TOKEN configurado
- [ ] SLACK_SIGNING_SECRET configurado
- [ ] HUBSPOT_API_KEY configurado
- [ ] ZAPIER_WEBHOOK_URL configurado
- [ ] NOTION_TOKEN configurado (opcional)

### Dependencias
- [ ] Node.js 20.x instalado
- [ ] npm packages instalados
- [ ] Slack CLI instalado (opcional)
- [ ] Zapier CLI instalado
- [ ] HubSpot CLI instalado (opcional)

## 🔗 Integraciones

### Slack
- [ ] Bot creado en Slack App Dashboard
- [ ] Permisos configurados (chat:write, channels:read, channels:write)
- [ ] App instalada en workspace
- [ ] Canales #automations-alerts y #scoring-leads creados
- [ ] Mensaje de prueba enviado y anclado
- [ ] Webhooks configurados

### Zapier
- [ ] Cuenta Zapier configurada
- [ ] CLI autenticado (zapier login)
- [ ] App kopp_crm_integration creada
- [ ] Triggers implementados y probados
- [ ] Actions implementadas y probadas
- [ ] App pusheada a Zapier (zapier push)
- [ ] Tests locales pasando (zapier test)

### HubSpot
- [ ] API key obtenida
- [ ] Conexión API verificada
- [ ] Propiedades personalizadas creadas:
  - [ ] lead_score (Number)
  - [ ] external_score (Number)  
  - [ ] last_score_update (DateTime)
- [ ] Workflow contact-based creado
- [ ] Trigger configurado para lead_score updates
- [ ] Action configurada para last_score_update

### Google Sheets
- [ ] Sheet 'Lead Scoring' creada
- [ ] Columnas configuradas (email, external_score, name, company, source)
- [ ] Permisos de lectura configurados
- [ ] API credentials configuradas
- [ ] Zapier trigger conectado

## 🧪 Testing

### Local
- [ ] npm run validate:local ejecutado sin errores
- [ ] npm run test:fast pasando todos los tests
- [ ] npm run qa:minimal completado exitosamente
- [ ] Build local exitoso (npm run build)

### Integración
- [ ] Slack: Envío de mensaje de prueba
- [ ] HubSpot: Creación/actualización de contacto de prueba
- [ ] Zapier: Trigger manual probado
- [ ] Google Sheets: Detección de nueva fila probada
- [ ] Flujo completo end-to-end probado

## 🚀 Despliegue

### GitHub Actions
- [ ] Workflows optimizados configurados
- [ ] Secrets configurados en GitHub
- [ ] CI workflow probado en PR
- [ ] Deploy workflow probado con tag
- [ ] Notificaciones funcionando

### Producción
- [ ] Zapier app deployada (zapier deploy)
- [ ] Zaps configurados y activados
- [ ] Monitoreo configurado
- [ ] Alertas de errores configuradas
- [ ] Logs y métricas configuradas

## 📊 Validación Final

### Funcionalidad
- [ ] Nueva fila en Google Sheets detectada
- [ ] HubSpot contact actualizado correctamente
- [ ] Slack alert enviado para high score
- [ ] Timestamps actualizados correctamente
- [ ] Error handling funcionando

### Performance
- [ ] Triggers respondiendo en < 30 segundos
- [ ] API calls dentro de límites
- [ ] No errores en logs por 24 horas
- [ ] Webhooks estables

### Documentación
- [ ] README actualizado
- [ ] Documentación técnica completa
- [ ] Guías de troubleshooting
- [ ] Configuración post-setup documentada

---
*Checklist actualizado: $(date)*
EOF

# Script para crear páginas en Notion (si token está disponible)
if [ -n "$NOTION_TOKEN" ]; then
    cat > /tmp/notion_setup.js << 'EOF'
const { Client } = require('@notionhq/client');

async function setupNotion() {
    const notion = new Client({
        auth: process.env.NOTION_TOKEN,
    });
    
    console.log('🔍 Verificando conexión a Notion...');
    
    try {
        // Verificar autenticación
        const me = await notion.users.me();
        console.log(`✅ Conectado como: ${me.name || me.person?.email || 'Usuario'}`);
        
        // Buscar páginas o bases de datos existentes
        const search = await notion.search({
            query: 'Kopp Stadium',
            filter: {
                property: 'object',
                value: 'page'
            }
        });
        
        console.log(`📊 Páginas encontradas con 'Kopp Stadium': ${search.results.length}`);
        
        const config = {
            notion_integration: {
                user: me.name || me.person?.email,
                pages_found: search.results.length,
                setup_date: new Date().toISOString()
            }
        };
        
        require('fs').writeFileSync('config/notion_setup.json', JSON.stringify(config, null, 2));
        console.log('💾 Configuración guardada en config/notion_setup.json');
        
        console.log('\n📋 PASOS MANUALES EN NOTION:');
        console.log('1. 🏗️  Crear página "Fase 1 - Integración Core" en tu workspace');
        console.log('2. 📝 Copiar contenido desde docs/notion_templates/fase_1_core_integration.md');
        console.log('3. ✅ Crear página checklist desde docs/notion_templates/setup_checklist.md');
        console.log('4. 🔗 Compartir páginas con el integration token');
        
    } catch (error) {
        console.log(`❌ Error configurando Notion: ${error.message}`);
    }
}

setupNotion().catch(console.error);
EOF

    # Ejecutar solo si @notionhq/client está instalado
    if npm list @notionhq/client >/dev/null 2>&1; then
        node /tmp/notion_setup.js
        rm /tmp/notion_setup.js
    else
        echo "⚠️  @notionhq/client no instalado"
        echo "💡 Para integración completa: npm install @notionhq/client"
        rm /tmp/notion_setup.js
    fi
else
    echo "💾 Templates de documentación creados en docs/notion_templates/"
fi

echo ""
echo "📋 PASOS MANUALES PARA NOTION:"
echo "1. 🌐 Ve a notion.so/my-integrations y crea integración"
echo "2. 🏗️  Crea workspace 'Kopp Stadium' si no existe"
echo "3. 📄 Crea página 'Fase 1 - Integración Core'"
echo "4. 📝 Copia contenido desde docs/notion_templates/"
echo "5. 🔗 Comparte páginas con tu integration"

echo "✅ Templates de Notion creados en docs/notion_templates/"
echo "🎉 Setup base de Notion completado!"
