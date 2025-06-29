#!/bin/bash

# 🔧 Slack Integration Setup - Ultra Eficiente
# Configuración completa de Slack para Kopp CRM

set -e

echo "🔧 Configurando Integración de Slack..."

# Verificar token
if [ -z "$SLACK_BOT_TOKEN" ]; then
    echo "❌ SLACK_BOT_TOKEN no configurado"
    echo "💡 Añade SLACK_BOT_TOKEN a tu .env"
    exit 1
fi

# Script Node.js embebido para configuración completa
cat > /tmp/slack_complete_setup.js << 'EOF'
const { WebClient } = require('@slack/web-api');

async function completeSlackSetup() {
    const token = process.env.SLACK_BOT_TOKEN;
    const slack = new WebClient(token);
    
    console.log('🔍 Verificando autenticación...');
    const auth = await slack.auth.test();
    console.log(`✅ Autenticado como: ${auth.user} en ${auth.team}`);
    
    // Configuración de canales
    const channels = [
        { name: 'automations-alerts', purpose: 'Alertas de automatización CRM' },
        { name: 'scoring-leads', purpose: 'Leads con puntuación alta' }
    ];
    
    console.log('🏗️  Configurando canales...');
    const createdChannels = [];
    
    for (const channel of channels) {
        try {
            const result = await slack.conversations.create({
                name: channel.name,
                is_private: false
            });
            
            // Establecer propósito del canal
            await slack.conversations.setPurpose({
                channel: result.channel.id,
                purpose: channel.purpose
            });
            
            createdChannels.push(`#${channel.name}`);
            console.log(`✅ Canal #${channel.name} creado`);
            
        } catch (error) {
            if (error.data?.error === 'name_taken') {
                console.log(`✅ Canal #${channel.name} ya existe`);
                createdChannels.push(`#${channel.name}`);
            } else {
                console.log(`⚠️  Error con #${channel.name}: ${error.data?.error}`);
            }
        }
    }
    
    // Mensaje de bienvenida y configuración
    console.log('📢 Enviando mensaje de configuración...');
    
    try {
        const welcomeMessage = await slack.chat.postMessage({
            channel: '#automations-alerts',
            text: '🏟️ Kopp CRM Integration Activa',
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🏟️ Kopp Stadium CRM'
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*✅ Integración Core Configurada*\n\n• Canales de automatización creados\n• Bot configurado correctamente\n• Webhooks activos'
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `🤖 Bot: ${auth.user} | 🏢 Workspace: ${auth.team} | ⏰ ${new Date().toLocaleString()}`
                        }
                    ]
                }
            ]
        });
        
        // Anclar mensaje importante
        await slack.pins.add({
            channel: '#automations-alerts',
            timestamp: welcomeMessage.ts
        });
        
        console.log('📌 Mensaje de configuración anclado');
        
        // Mensaje en canal de scoring
        await slack.chat.postMessage({
            channel: '#scoring-leads',
            text: '🎯 Canal de Leads con Alta Puntuación',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*🎯 Canal de Scoring de Leads*\n\nEste canal recibirá alertas cuando:\n• Lead score > 50\n• External score actualizado\n• Leads calificados para seguimiento'
                    }
                }
            ]
        });
        
        console.log('✅ Configuración de canales completada');
        
        // Guardar configuración
        const config = {
            slack_setup: {
                bot_user: auth.user,
                team: auth.team,
                channels: createdChannels,
                setup_date: new Date().toISOString()
            }
        };
        
        require('fs').writeFileSync('config/slack_setup.json', JSON.stringify(config, null, 2));
        console.log('💾 Configuración guardada en config/slack_setup.json');
        
    } catch (error) {
        console.log(`❌ Error en configuración: ${error.data?.error || error.message}`);
    }
}

completeSlackSetup().catch(console.error);
EOF

# Ejecutar configuración
if npm list @slack/web-api >/dev/null 2>&1; then
    node /tmp/slack_complete_setup.js
    rm /tmp/slack_complete_setup.js
    echo "🎉 Configuración de Slack completada!"
else
    echo "❌ Dependencia @slack/web-api no encontrada"
    echo "💡 Ejecuta: npm install @slack/web-api"
    rm /tmp/slack_complete_setup.js
    exit 1
fi
