#!/usr/bin/env node

/**
 * 🧪 Script de prueba para Dropout Positivo
 *
 * Este script demuestra cómo funciona la integración de Dropout Positivo:
 * 1. Configura las credenciales de prueba
 * 2. Simula un contact con engagement bajo
 * 3. Ejecuta el handler principal
 * 4. Muestra los resultados
 *
 * USO:
 * node scripts/test-dropout-positivo.js
 */

const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function testDropoutPositivo() {
  console.log('💫 Iniciando test de Dropout Positivo...\n');

  try {
    const {
      dropoutPositivoHandler,
    } = require('../dist/zaps/dropout-positivo/handler');
    const testConfig = getTestConfig();
    const mockContactData = getMockContactData(testConfig);

    logTestConfig(testConfig);
    logMockContactData(mockContactData);

    if (!testConfig.hubspotApiKey || testConfig.hubspotApiKey === 'test-key') {
      logDemoModeWarning();
    }

    console.log('🚀 Ejecutando Dropout Positivo Handler...\n');
    await executeHandler(dropoutPositivoHandler, mockContactData, testConfig);
  } catch (error) {
    handleCriticalError(error);
  }
}

function getTestConfig() {
  return {
    hubspotApiKey: process.env.HUBSPOT_API_KEY || 'test-key',
    slackBotToken: process.env.SLACK_BOT_TOKEN || 'test-token',
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET || 'test-secret',
    slackChannel: '#auditoria-sagrada',
    thresholdDays: parseInt(process.env.DROPOUT_THRESHOLD_DAYS || '7'),
    scoreBoost: parseInt(process.env.DROPOUT_SCORE_BOOST || '30'),
    isEnabled: true,
  };
}

function getMockContactData(testConfig) {
  return {
    contactId: 'test-contact-dropout-12345',
    email: 'dropout.usuario@example.com',
    lastEngagementDate: '2025-06-15T00:00:00.000Z', // Hace 14 días
    hubspotApiKey: testConfig.hubspotApiKey,
    slackBotToken: testConfig.slackBotToken,
    slackChannel: testConfig.slackChannel,
    scoreBoost: testConfig.scoreBoost,
    thresholdDays: testConfig.thresholdDays,
  };
}

function logTestConfig(testConfig) {
  console.log('📊 Configuración:');
  console.log(
    '- HubSpot API Key:',
    testConfig.hubspotApiKey !== 'test-key'
      ? '✅ Configurado'
      : '❌ Faltante'
  );
  console.log(
    '- Slack Bot Token:',
    testConfig.slackBotToken !== 'test-token'
      ? '✅ Configurado'
      : '❌ Faltante'
  );
  console.log('- Canal Slack:', testConfig.slackChannel);
  console.log('- Threshold Días:', testConfig.thresholdDays);
  console.log('- Score Boost:', testConfig.scoreBoost);
  console.log('- Habilitado:', testConfig.isEnabled ? '✅ Sí' : '❌ No');
  console.log();
}

function logMockContactData(mockContactData) {
  console.log('📋 Datos del contact con dropout:');
  console.log('- Contact ID:', mockContactData.contactId);
  console.log('- Email:', mockContactData.email);
  console.log('- Último engagement:', mockContactData.lastEngagementDate);
  console.log(
    '- Días desde engagement:',
    calculateDaysSinceEngagement(mockContactData.lastEngagementDate)
  );
  console.log();
}

function logDemoModeWarning() {
  console.log('⚠️  MODO DEMO: Usando credenciales de prueba');
  console.log(
    '   Para testing real, configura las variables de entorno en .env'
  );
  console.log();
}

async function executeHandler(handler, mockContactData, testConfig) {
  const startTime = Date.now();
  try {
    const result = await handler(mockContactData);
    const duration = Date.now() - startTime;
    logHandlerResult(result, duration, testConfig);
  } catch (handlerError) {
    const duration = Date.now() - startTime;
    logHandlerError(handlerError, duration);
  }
}

function logHandlerResult(result, duration, testConfig) {
  console.log('✅ RESULTADO DEL PROCESAMIENTO:');
  console.log('================================');
  console.log('- ID de Ejecución:', result.id);
  console.log('- Contact ID:', result.contactId);
  console.log('- Email:', result.email);
  console.log('- Días sin engagement:', result.daysSinceEngagement);
  console.log('- Score anterior:', result.previousScore);
  console.log('- Score nuevo:', result.newScore);
  console.log('- Boost aplicado:', result.newScore - result.previousScore);
  console.log('- Mensaje Slack ID:', result.slackMessageId || 'N/A');
  console.log(
    '- Procesado exitosamente:',
    result.success ? '✅ Sí' : '❌ No'
  );
  console.log('- Procesado en:', result.processedAt);
  console.log('- Duración:', `${duration}ms`);
  console.log();

  if (result.success) {
    console.log('🎉 ¡Dropout Positivo ejecutado exitosamente!');
    console.log();
    console.log('📊 Métricas:');
    console.log(`- Tiempo de respuesta: ${duration}ms`);
    console.log(
      `- Boost de score: +${result.newScore - result.previousScore} puntos`
    );
    console.log(
      `- Usuario reactivado después de ${result.daysSinceEngagement} días`
    );
    console.log();

    if (result.slackMessageId) {
      console.log('💬 Mensaje enviado a Slack:', testConfig.slackChannel);
    }
  } else {
    console.log('⏭️ Procesamiento saltado - No cumple threshold');
    console.log(`- Días sin engagement: ${result.daysSinceEngagement}`);
    console.log(`- Threshold requerido: ${testConfig.thresholdDays}`);
  }
}

function logHandlerError(handlerError, duration) {
  console.log('❌ ERROR EN EL HANDLER:');
  console.log('=======================');
  console.log('- Error:', handlerError.message);
  console.log('- Duración hasta error:', `${duration}ms`);
  console.log();

  if (handlerError.message.includes('Authentication')) {
    console.log('💡 SUGERENCIA: Verifica tus credenciales de API');
    console.log('   - HubSpot API Key en HUBSPOT_API_KEY');
    console.log('   - Slack Bot Token en SLACK_BOT_TOKEN');
  } else if (
    handlerError.message.includes('network') ||
    handlerError.message.includes('timeout')
  ) {
    console.log('💡 SUGERENCIA: Problema de conectividad');
    console.log('   - Verifica tu conexión a internet');
    console.log(
      '   - Los servicios de HubSpot/Slack podrían estar temporalmente no disponibles'
    );
  }

  console.log();
  console.log('🔍 Para más detalles, revisa los logs:');
  console.log('   tail -f logs/dropout.log');
}

function handleCriticalError(error) {
  console.error('❌ Error crítico en el script:', error.message);
  console.log();
  console.log('🔧 SOLUCIONES POSIBLES:');
  console.log(
    '1. Asegúrate de que el proyecto esté compilado: npm run build'
  );
  console.log('2. Verifica que existan los archivos de handler compilados');
  console.log('3. Revisa la configuración de TypeScript');
  process.exit(1);
}

/**
 * Calcular días desde el último engagement
 */
function calculateDaysSinceEngagement(lastEngagementDate) {
  if (!lastEngagementDate) {
    return 999;
  }

  const lastDate = new Date(lastEngagementDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Ejecutar el test
if (require.main === module) {
  testDropoutPositivo().catch(console.error);
}

module.exports = { testDropoutPositivo };
