#!/usr/bin/env node

/**
 * 🧪 Script de prueba para Hot Leads Detection
 *
 * Este script demuestra cómo funciona la integración de Hot Leads:
 * 1. Configura las credenciales de prueba
 * 2. Simula un trigger de HubSpot
 * 3. Ejecuta el handler principal
 * 4. Muestra los resultados
 *
 * USO:
 * node scripts/test-hot-leads.js
 */

const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function testHotLeads() {
  console.log('🚨 Iniciando test de Hot Leads Detection...\n');

  try {
    // Importar el handler compilado
    const { hotLeadsHandler } = require('../dist/zaps/hot-leads/handler');

    // Configuración de prueba
    const testConfig = {
      hubspotApiKey: process.env.HUBSPOT_API_KEY || 'test-key',
      slackBotToken: process.env.SLACK_BOT_TOKEN || 'test-token',
      slackSigningSecret: process.env.SLACK_SIGNING_SECRET || 'test-secret',
      slackChannel: '#hot-leads',
      hotLeadThreshold: parseInt(process.env.HOT_LEAD_THRESHOLD || '40'),
      isEnabled: true,
    };

    // Datos de prueba del trigger
    const mockTriggerData = {
      contactId: 'test-contact-12345',
      email: 'juan.perez@example.com',
      leadInfluenceScore: 45,
      previousScore: 35,
      timestamp: new Date().toISOString(),
      hubspotPortalId: 'test-portal-123',
    };

    console.log('📊 Configuración:');
    console.log(
      '- HubSpot API Key:',
      testConfig.hubspotApiKey ? '✅ Configurado' : '❌ Faltante'
    );
    console.log(
      '- Slack Bot Token:',
      testConfig.slackBotToken ? '✅ Configurado' : '❌ Faltante'
    );
    console.log('- Canal Slack:', testConfig.slackChannel);
    console.log('- Threshold:', testConfig.hotLeadThreshold);
    console.log('- Habilitado:', testConfig.isEnabled ? '✅ Sí' : '❌ No');
    console.log();

    console.log('📋 Datos del trigger:');
    console.log('- Contact ID:', mockTriggerData.contactId);
    console.log('- Email:', mockTriggerData.email);
    console.log('- Score actual:', mockTriggerData.leadInfluenceScore);
    console.log('- Score anterior:', mockTriggerData.previousScore);
    console.log(
      '- Cambio:',
      `${mockTriggerData.previousScore} → ${mockTriggerData.leadInfluenceScore}`
    );
    console.log();

    if (!testConfig.hubspotApiKey || testConfig.hubspotApiKey === 'test-key') {
      console.log(
        '⚠️  NOTA: Usando credenciales de prueba. Para probar con datos reales,'
      );
      console.log(
        '   configure las variables HUBSPOT_API_KEY y SLACK_BOT_TOKEN en .env'
      );
      console.log();
    }

    // Ejecutar el handler
    console.log('🚀 Ejecutando Hot Leads Handler...');
    const startTime = Date.now();

    const result = await hotLeadsHandler(testConfig, mockTriggerData);

    const executionTime = Date.now() - startTime;

    // Mostrar resultados
    console.log('\n📈 Resultados de la ejecución:');
    console.log('- ID de ejecución:', result.id);
    console.log('- Timestamp:', result.timestamp);
    console.log('- Contact ID:', result.contactId);
    console.log('- Email:', result.email);
    console.log('- Score anterior:', result.previousScore);
    console.log('- Score nuevo:', result.newScore);
    console.log(
      '- Status actualizado:',
      result.statusUpdated ? '✅ Sí' : '❌ No'
    );
    console.log(
      '- Mensaje Slack enviado:',
      result.slackMessageSent ? '✅ Sí' : '❌ No'
    );
    console.log('- Tiempo de ejecución:', `${executionTime}ms`);
    console.log('- Tiempo reportado:', `${result.executionTimeMs}ms`);

    if (result.error) {
      console.log('❌ Error:', result.error);
    }

    console.log('\n🎯 Interpretación:');
    if (result.statusUpdated && result.slackMessageSent) {
      console.log('✅ Hot Lead procesado exitosamente');
      console.log('   - Lead marcado como "Hot Lead" en HubSpot');
      console.log('   - Equipo de ventas notificado en Slack');
      console.log('   - Seguimiento inmediato recomendado');
    } else if (result.statusUpdated && !result.slackMessageSent) {
      console.log('⚠️  Lead actualizado pero fallo en notificación');
      console.log('   - HubSpot actualizado correctamente');
      console.log('   - Revisar configuración de Slack');
    } else if (!result.statusUpdated && result.slackMessageSent) {
      console.log('⚠️  Notificación enviada pero fallo en actualización');
      console.log('   - Slack notificado correctamente');
      console.log('   - Revisar configuración de HubSpot');
    } else {
      console.log('❌ Fallo en ambas operaciones');
      console.log('   - Revisar logs para detalles');
    }

    console.log('\n✅ Test de Hot Leads completado!');
  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testHotLeads().catch(console.error);
}

module.exports = { testHotLeads };
