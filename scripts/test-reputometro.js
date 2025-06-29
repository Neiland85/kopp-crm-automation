#!/usr/bin/env node

/**
 * 🧪 Script de prueba para el Reputómetro Invisible
 *
 * Este script demuestra cómo funciona la integración del Reputómetro:
 * 1. Configura las credenciales de prueba
 * 2. Ejecuta el handler principal
 * 3. Muestra los resultados
 *
 * USO:
 * node scripts/test-reputometro.js
 */

const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function testReputometro() {
  console.log('🎯 Iniciando test del Reputómetro Invisible...\n');

  try {
    // Importar el handler compilado
    const { reputometroHandler } = require('../dist/zaps/reputometro/handler');

    // Configuración de prueba
    const testConfig = {
      hubspotApiKey: process.env.HUBSPOT_API_KEY || 'test-key',
      slackBotToken: process.env.SLACK_BOT_TOKEN || 'test-token',
      slackSigningSecret: process.env.SLACK_SIGNING_SECRET || 'test-secret',
      slackChannel: '#scoring-leads',
      isEnabled: true,
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
    console.log('- Habilitado:', testConfig.isEnabled ? '✅ Sí' : '❌ No');
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
    console.log('🚀 Ejecutando Reputómetro Handler...');
    const startTime = Date.now();

    const result = await reputometroHandler(testConfig);

    const executionTime = Date.now() - startTime;

    // Mostrar resultados
    console.log('\n📈 Resultados de la ejecución:');
    console.log('- ID de ejecución:', result.id);
    console.log('- Timestamp:', result.timestamp);
    console.log('- Total de leads:', result.totalLeads);
    console.log('- Score promedio:', result.avgScore.toFixed(2));
    console.log('- Top leads:', result.topLeads.length);
    console.log(
      '- Mensaje Slack enviado:',
      result.slackMessageSent ? '✅' : '❌'
    );
    console.log('- Actualizaciones HubSpot:', result.hubspotUpdates);
    console.log('- Tiempo de ejecución:', `${executionTime}ms`);

    if (result.topLeads.length > 0) {
      console.log('\n🏆 Top 3 Leads:');
      result.topLeads.slice(0, 3).forEach((lead, index) => {
        console.log(`  ${index + 1}. ${lead.email} - Score: ${lead.score}`);
      });
    }

    console.log('\n✅ Test completado exitosamente!');
  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testReputometro().catch(console.error);
}

module.exports = { testReputometro };
