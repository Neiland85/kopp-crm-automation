#!/bin/bash

# 🌐 HubSpot Integration Setup
# Configuración completa de HubSpot API y propiedades

set -e

echo "🌐 Configurando Integración de HubSpot..."

# Verificar token
if [ -z "$HUBSPOT_API_KEY" ]; then
    echo "❌ HUBSPOT_API_KEY no configurado"
    echo "💡 Añade HUBSPOT_API_KEY a tu .env"
    exit 1
fi

# Script Node.js para configuración completa de HubSpot
cat > /tmp/hubspot_complete_setup.js << 'EOF'
const axios = require('axios');

async function setupHubSpot() {
    const apiKey = process.env.HUBSPOT_API_KEY;
    const baseURL = 'https://api.hubapi.com';
    const headers = { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    console.log('🔍 Verificando conexión a HubSpot...');
    
    try {
        // Verificar autenticación y obtener info de la cuenta
        const accountInfo = await axios.get(`${baseURL}/account-info/v3/details`, { headers });
        console.log(`✅ Conectado a HubSpot Portal: ${accountInfo.data.portalId}`);
        console.log(`🏢 Cuenta: ${accountInfo.data.accountName || 'N/A'}`);
        
        // Verificar límites de API
        const usage = await axios.get(`${baseURL}/integrations/v1/limit/daily`, { headers });
        console.log(`📊 Uso de API: ${usage.data.currentUsage}/${usage.data.dailyLimit}`);
        
        // Propiedades personalizadas requeridas
        const requiredProperties = [
            {
                name: 'lead_score',
                label: 'Lead Score',
                type: 'number',
                description: 'Puntuación interna del lead basada en comportamiento'
            },
            {
                name: 'external_score', 
                label: 'External Score',
                type: 'number',
                description: 'Puntuación externa del lead desde Google Sheets'
            },
            {
                name: 'last_score_update',
                label: 'Last Score Update',
                type: 'datetime',
                description: 'Última actualización de puntuación'
            }
        ];
        
        console.log('🔧 Verificando propiedades personalizadas...');
        const propertyStatus = [];
        
        for (const prop of requiredProperties) {
            try {
                const response = await axios.get(
                    `${baseURL}/properties/v1/contacts/properties/named/${prop.name}`, 
                    { headers }
                );
                console.log(`✅ Propiedad '${prop.name}' existe`);
                propertyStatus.push({ name: prop.name, exists: true });
                
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log(`⚠️  Propiedad '${prop.name}' no existe`);
                    propertyStatus.push({ 
                        name: prop.name, 
                        exists: false, 
                        config: prop 
                    });
                } else {
                    console.log(`❌ Error verificando '${prop.name}': ${error.response?.statusText}`);
                }
            }
        }
        
        // Mostrar instrucciones para crear propiedades faltantes
        const missingProperties = propertyStatus.filter(p => !p.exists);
        if (missingProperties.length > 0) {
            console.log('\n📋 PROPIEDADES FALTANTES - Crear manualmente en HubSpot:');
            console.log('🌐 Ve a: Settings → Properties → Contact Properties → Create Property');
            
            missingProperties.forEach(prop => {
                console.log(`\n📝 ${prop.config.name}:`);
                console.log(`   • Label: ${prop.config.label}`);
                console.log(`   • Type: ${prop.config.type}`);
                console.log(`   • Description: ${prop.config.description}`);
            });
        }
        
        // Verificar workflows existentes
        console.log('\n🔄 Verificando workflows...');
        try {
            const workflows = await axios.get(`${baseURL}/automation/v3/workflows`, { headers });
            const contactWorkflows = workflows.data.results.filter(w => w.type === 'CONTACT_BASED');
            
            console.log(`📊 Total workflows: ${workflows.data.results.length}`);
            console.log(`👤 Contact-based workflows: ${contactWorkflows.length}`);
            
            if (contactWorkflows.length === 0) {
                console.log('\n📋 WORKFLOW REQUERIDO - Crear manualmente:');
                console.log('🌐 Ve a: Automation → Workflows → Create Workflow');
                console.log('⚙️  Tipo: Contact-based workflow');
                console.log('🎯 Trigger: Contact property "lead_score" is updated');
                console.log('⚡ Action: Set property value "last_score_update" = now');
            }
            
        } catch (error) {
            console.log(`⚠️  No se pudieron verificar workflows: ${error.response?.statusText}`);
        }
        
        // Crear configuración de integración
        const config = {
            hubspot_integration: {
                portal_id: accountInfo.data.portalId,
                account_name: accountInfo.data.accountName,
                api_limit: usage.data.dailyLimit,
                properties: propertyStatus,
                setup_date: new Date().toISOString(),
                manual_steps_required: missingProperties.length > 0
            }
        };
        
        require('fs').writeFileSync('config/hubspot_setup.json', JSON.stringify(config, null, 2));
        console.log('💾 Configuración guardada en config/hubspot_setup.json');
        
        // Test de creación/actualización de contacto
        console.log('\n🧪 Probando operaciones de contacto...');
        try {
            const testContact = {
                properties: {
                    email: 'test@koppstadium.com',
                    firstname: 'Test',
                    lastname: 'Integration',
                    lead_score: '75',
                    external_score: '80'
                }
            };
            
            // Buscar contacto existente
            const searchResponse = await axios.post(
                `${baseURL}/crm/v3/objects/contacts/search`,
                {
                    filterGroups: [{
                        filters: [{
                            propertyName: 'email',
                            operator: 'EQ',
                            value: testContact.properties.email
                        }]
                    }]
                },
                { headers }
            );
            
            if (searchResponse.data.results.length > 0) {
                console.log('✅ Test de búsqueda de contacto exitoso');
            } else {
                console.log('📝 Test contact no encontrado (normal en primera ejecución)');
            }
            
        } catch (error) {
            console.log(`⚠️  Error en test de contacto: ${error.response?.statusText}`);
        }
        
        console.log('\n🎉 Configuración de HubSpot completada!');
        
    } catch (error) {
        console.log(`❌ Error configurando HubSpot: ${error.response?.data?.message || error.message}`);
        process.exit(1);
    }
}

setupHubSpot().catch(console.error);
EOF

# Ejecutar configuración
if npm list axios >/dev/null 2>&1; then
    node /tmp/hubspot_complete_setup.js
    rm /tmp/hubspot_complete_setup.js
    echo "✅ Configuración de HubSpot completada!"
else
    echo "❌ Dependencia axios no encontrada"
    echo "💡 Ejecuta: npm install axios"
    rm /tmp/hubspot_complete_setup.js
    exit 1
fi

echo ""
echo "📋 PRÓXIMOS PASOS MANUALES EN HUBSPOT:"
echo "1. 🏗️  Crear propiedades personalizadas faltantes"
echo "2. 🔄 Crear workflow contact-based para lead_score"
echo "3. 🎯 Configurar triggers automáticos"
echo "4. 🧪 Probar integración con contacto real"

echo "🎉 Setup de HubSpot base completado!"
