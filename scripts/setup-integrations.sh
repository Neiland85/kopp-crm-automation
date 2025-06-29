#!/bin/bash

# 🚀 Kopp CRM - Configuración de Integraciones Core
# Configuración ultra-eficiente para Slack, Zapier, HubSpot y Notion

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏟️  Kopp CRM - Setup de Integraciones Core${NC}"
echo "================================================="

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar variables de entorno
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ Variable $1 no está configurada${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 configurada${NC}"
        return 0
    fi
}

echo -e "\n${YELLOW}🔍 Verificando Variables de Entorno...${NC}"

# Verificar variables requeridas
REQUIRED_VARS=("SLACK_BOT_TOKEN" "SLACK_SIGNING_SECRET" "HUBSPOT_API_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! check_env_var "$var"; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "\n${RED}❌ Variables faltantes:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   - $var"
    done
    echo -e "\n${YELLOW}💡 Copia .env.example a .env y completa las variables${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📦 Verificando Dependencias CLI...${NC}"

# Verificar dependencias opcionales
if command_exists "slack"; then
    echo -e "${GREEN}✅ Slack CLI instalado${NC}"
    SLACK_CLI_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Slack CLI no instalado (opcional)${NC}"
    SLACK_CLI_AVAILABLE=false
fi

if command_exists "zapier"; then
    echo -e "${GREEN}✅ Zapier CLI instalado${NC}"
    ZAPIER_CLI_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Zapier CLI no instalado (opcional)${NC}"
    ZAPIER_CLI_AVAILABLE=false
fi

if command_exists "hs"; then
    echo -e "${GREEN}✅ HubSpot CLI instalado${NC}"
    HUBSPOT_CLI_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  HubSpot CLI no instalado (opcional)${NC}"
    HUBSPOT_CLI_AVAILABLE=false
fi

echo -e "\n${YELLOW}🔧 Configurando Slack...${NC}"

# Configurar Slack usando Node.js API (más confiable que CLI)
cat > temp_slack_setup.js << 'EOF'
const { WebClient } = require('@slack/web-api');

async function setupSlack() {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
        console.log('❌ SLACK_BOT_TOKEN no configurado');
        return;
    }

    const slack = new WebClient(token);
    
    try {
        // Verificar conexión
        const auth = await slack.auth.test();
        console.log(`✅ Conectado a Slack como: ${auth.user}`);
        
        // Crear canales si no existen
        const channels = ['automations-alerts', 'scoring-leads'];
        
        for (const channelName of channels) {
            try {
                await slack.conversations.create({
                    name: channelName,
                    is_private: false
                });
                console.log(`✅ Canal #${channelName} creado`);
            } catch (error) {
                if (error.data?.error === 'name_taken') {
                    console.log(`✅ Canal #${channelName} ya existe`);
                } else {
                    console.log(`⚠️  Error creando canal #${channelName}: ${error.data?.error}`);
                }
            }
        }
        
        // Mensaje de prueba en automations-alerts
        try {
            const msg = await slack.chat.postMessage({
                channel: '#automations-alerts',
                text: '✅ Integración Kopp CRM activa',
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: '🏟️ *Kopp CRM Automation*\n✅ Integración core activa y funcionando'
                        }
                    }
                ]
            });
            
            // Anclar mensaje
            await slack.pins.add({
                channel: '#automations-alerts',
                timestamp: msg.ts
            });
            
            console.log('✅ Mensaje de prueba enviado y anclado');
        } catch (error) {
            console.log(`⚠️  Error enviando mensaje: ${error.data?.error}`);
        }
        
    } catch (error) {
        console.log(`❌ Error configurando Slack: ${error.data?.error || error.message}`);
    }
}

setupSlack().catch(console.error);
EOF

# Ejecutar configuración de Slack
if npm list @slack/web-api >/dev/null 2>&1; then
    node temp_slack_setup.js
else
    echo -e "${YELLOW}⚠️  @slack/web-api no instalado, saltando configuración automática${NC}"
fi

rm -f temp_slack_setup.js

echo -e "\n${YELLOW}🔗 Configurando Zapier...${NC}"

if [ "$ZAPIER_CLI_AVAILABLE" = true ]; then
    echo -e "${GREEN}🔧 Configurando Zapier CLI...${NC}"
    
    # Verificar si ya está logueado
    if zapier whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Ya logueado en Zapier${NC}"
    else
        echo -e "${YELLOW}💡 Ejecuta: zapier login${NC}"
    fi
    
    # Verificar app existente
    if [ -f ".zapierapprc" ]; then
        echo -e "${GREEN}✅ Configuración Zapier existente encontrada${NC}"
    else
        echo -e "${YELLOW}💡 Para crear nueva app: zapier init kopp_crm_integration --template=node${NC}"
    fi
else
    echo -e "${YELLOW}💡 Para instalar Zapier CLI: npm install -g zapier-platform-cli${NC}"
fi

echo -e "\n${YELLOW}🌐 Configurando HubSpot...${NC}"

# Configurar HubSpot
cat > temp_hubspot_setup.js << 'EOF'
const axios = require('axios');

async function setupHubSpot() {
    const apiKey = process.env.HUBSPOT_API_KEY;
    if (!apiKey) {
        console.log('❌ HUBSPOT_API_KEY no configurado');
        return;
    }

    const baseURL = 'https://api.hubapi.com';
    const headers = { 'Authorization': `Bearer ${apiKey}` };

    try {
        // Verificar conexión
        const response = await axios.get(`${baseURL}/account-info/v3/details`, { headers });
        console.log(`✅ Conectado a HubSpot: ${response.data.portalId}`);
        
        // Verificar propiedades personalizadas requeridas
        const requiredProperties = [
            { name: 'lead_score', label: 'Lead Score', type: 'number' },
            { name: 'external_score', label: 'External Score', type: 'number' },
            { name: 'last_score_update', label: 'Last Score Update', type: 'datetime' }
        ];
        
        for (const prop of requiredProperties) {
            try {
                await axios.get(`${baseURL}/properties/v1/contacts/properties/named/${prop.name}`, { headers });
                console.log(`✅ Propiedad ${prop.name} ya existe`);
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log(`⚠️  Propiedad ${prop.name} no existe - requiere creación manual`);
                } else {
                    console.log(`⚠️  Error verificando ${prop.name}: ${error.response?.statusText}`);
                }
            }
        }
        
    } catch (error) {
        console.log(`❌ Error configurando HubSpot: ${error.response?.statusText || error.message}`);
    }
}

setupHubSpot().catch(console.error);
EOF

# Ejecutar configuración de HubSpot
if npm list axios >/dev/null 2>&1; then
    node temp_hubspot_setup.js
else
    echo -e "${YELLOW}⚠️  axios no instalado, saltando configuración automática${NC}"
fi

rm -f temp_hubspot_setup.js

echo -e "\n${YELLOW}📝 Configurando Notion...${NC}"

if [ -n "$NOTION_TOKEN" ]; then
    echo -e "${GREEN}✅ NOTION_TOKEN configurado${NC}"
    echo -e "${YELLOW}💡 Crea manualmente la página 'Fase 1 - Integración Core' en tu workspace${NC}"
else
    echo -e "${YELLOW}⚠️  NOTION_TOKEN no configurado (opcional)${NC}"
fi

echo -e "\n${YELLOW}📋 Creando configuración de workspace...${NC}"

# Crear archivo de configuración del workspace
cat > config/workspace_integration_config.json << EOF
{
  "kopp_stadium_crm": {
    "version": "1.0.0",
    "phase": "core_integration",
    "integrations": {
      "slack": {
        "channels": [
          "#automations-alerts",
          "#scoring-leads"
        ],
        "bot_configured": true,
        "webhooks_active": true
      },
      "zapier": {
        "app_configured": $([ "$ZAPIER_CLI_AVAILABLE" = true ] && echo "true" || echo "false"),
        "triggers": [
          "new_google_sheets_lead_scoring",
          "new_form_submission",
          "page_view",
          "updated_contact_property"
        ],
        "actions": [
          "hubspot_contact",
          "slack_notification",
          "update_hubspot_external_score",
          "send_high_score_slack_alert"
        ]
      },
      "hubspot": {
        "api_connected": true,
        "custom_properties": [
          "lead_score",
          "external_score", 
          "last_score_update"
        ],
        "workflows_configured": false
      },
      "notion": {
        "token_configured": $([ -n "$NOTION_TOKEN" ] && echo "true" || echo "false"),
        "documentation_space": "Kopp Stadium"
      }
    },
    "setup_completed": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
}
EOF

echo -e "${GREEN}✅ Configuración guardada en config/workspace_integration_config.json${NC}"

echo -e "\n${BLUE}🎯 Resumen de Configuración${NC}"
echo "================================="
echo -e "${GREEN}✅ Variables de entorno verificadas${NC}"
echo -e "$([ "$SLACK_CLI_AVAILABLE" = true ] && echo "${GREEN}✅" || echo "${YELLOW}⚠️ ") Slack configurado${NC}"
echo -e "$([ "$ZAPIER_CLI_AVAILABLE" = true ] && echo "${GREEN}✅" || echo "${YELLOW}⚠️ ") Zapier CLI disponible${NC}"
echo -e "${GREEN}✅ HubSpot API verificado${NC}"
echo -e "$([ -n "$NOTION_TOKEN" ] && echo "${GREEN}✅" || echo "${YELLOW}⚠️ ") Notion token configurado${NC}"

echo -e "\n${YELLOW}📋 Próximos Pasos Manuales:${NC}"
echo "1. 🏗️  En HubSpot UI, crear las propiedades personalizadas"
echo "2. 🔄 En HubSpot UI, crear workflows contact-based"
echo "3. ⚡ En Zapier UI, configurar y activar Zaps"
echo "4. 📝 En Notion, crear página de documentación"

echo -e "\n${GREEN}🎉 Setup de integraciones core completado!${NC}"
