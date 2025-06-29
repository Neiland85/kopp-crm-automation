#!/usr/bin/env node

/**
 * 🧪 Script de prueba para Recompensas por Escasez
 *
 * Este script demuestra cómo funciona la integración de Recompensas por Escasez:
 * 1. Configura las credenciales de prueba
 * 2. Simula un trigger de Google Sheets
 * 3. Ejecuta el handler principal
 * 4. Muestra los resultados
 *
 * USO:
 * node scripts/test-recompensas-escasez.js
 */

const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function testRecompensasEscasez() {
  console.log('🎁 Iniciando test de Recompensas por Escasez...\n');

  try {
    // Importar el handler compilado
    const {
      recompensasEscasezHandler,
    } = require('../dist/zaps/recompensas-escasez/handler');

    // Configuración de prueba
    const testConfig = {
      hubspotApiKey: process.env.HUBSPOT_API_KEY || 'test-key',
      slackBotToken: process.env.SLACK_BOT_TOKEN || 'test-token',
      slackSigningSecret: process.env.SLACK_SIGNING_SECRET || 'test-secret',
      googleSheetsApiKey:
        process.env.GOOGLE_SHEETS_API_KEY || 'test-sheets-key',
      googleSheetsId: process.env.GOOGLE_SHEETS_ID || 'test-sheets-id',
      slackChannel: '#scoring-leads',
      stockThreshold: parseInt(process.env.STOCK_THRESHOLD || '20'),
      isEnabled: true,
    };

    // Datos de prueba del trigger
    const mockTriggerData = {
      productId: 'JERSEY-KS-001',
      productName: 'Jersey Kopp Stadium Edición Limitada',
      stockRemaining: 15,
      previousStock: 35,
      email: 'fan@koppstadium.com',
      contactId: 'contact-456',
      sheetRowId: 'sheet-row-123',
      timestamp: new Date().toISOString(),
      urgencyLevel: 'high',
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
    console.log(
      '- Google Sheets Key:',
      testConfig.googleSheetsApiKey ? '✅ Configurado' : '❌ Faltante'
    );
    console.log('- Canal Slack:', testConfig.slackChannel);
    console.log('- Stock Threshold:', testConfig.stockThreshold);
    console.log('- Habilitado:', testConfig.isEnabled ? '✅ Sí' : '❌ No');
    console.log();

    console.log('📋 Datos del trigger:');
    console.log('- Product ID:', mockTriggerData.productId);
    console.log('- Producto:', mockTriggerData.productName);
    console.log('- Stock actual:', mockTriggerData.stockRemaining);
    console.log('- Stock anterior:', mockTriggerData.previousStock);
    console.log(
      '- Cambio de stock:',
      `${mockTriggerData.previousStock} → ${mockTriggerData.stockRemaining}`
    );
    console.log(
      '- Nivel de urgencia:',
      mockTriggerData.urgencyLevel.toUpperCase()
    );
    console.log('- Email (si aplica):', mockTriggerData.email);
    console.log();

    if (!testConfig.hubspotApiKey || testConfig.hubspotApiKey === 'test-key') {
      console.log(
        '⚠️  NOTA: Usando credenciales de prueba. Para probar con datos reales,'
      );
      console.log('   configure las variables de entorno necesarias en .env');
      console.log();
    }

    // Ejecutar el handler
    console.log('🚀 Ejecutando Recompensas por Escasez Handler...');
    const startTime = Date.now();

    const result = await recompensasEscasezHandler(testConfig, mockTriggerData);

    const executionTime = Date.now() - startTime;

    // Mostrar resultados
    console.log('\n📈 Resultados de la ejecución:');
    console.log('- ID de ejecución:', result.id);
    console.log('- Timestamp:', result.timestamp);
    console.log('- Product ID:', result.productId);
    console.log('- Producto:', result.productName);
    console.log('- Stock actual:', result.stockRemaining);
    console.log('- Stock anterior:', result.previousStock);
    console.log('- Nivel de urgencia:', result.urgencyLevel.toUpperCase());
    console.log(
      '- HubSpot actualizado:',
      result.hubspotUpdated ? '✅ Sí' : '❌ No'
    );
    console.log('- Contactos actualizados:', result.contactsUpdated || 0);
    console.log(
      '- Mensaje Slack enviado:',
      result.slackMessageSent ? '✅ Sí' : '❌ No'
    );
    console.log('- Código de cupón:', result.couponCode || 'N/A');
    console.log('- Tiempo de ejecución:', `${executionTime}ms`);
    console.log('- Tiempo reportado:', `${result.executionTimeMs}ms`);

    if (result.error) {
      console.log('❌ Error:', result.error);
    }

    console.log('\n🎯 Interpretación:');
    if (result.hubspotUpdated && result.slackMessageSent) {
      console.log('✅ Recompensa por Escasez procesada exitosamente');
      console.log('   - Recompensas emocionales activadas en HubSpot');
      console.log('   - Código de cupón generado:', result.couponCode);
      console.log('   - Equipo notificado en Slack para envío de cupones');
      console.log('   - Contactos actualizados:', result.contactsUpdated);
    } else if (result.hubspotUpdated && !result.slackMessageSent) {
      console.log('⚠️  HubSpot actualizado pero fallo en notificación');
      console.log('   - Recompensas activadas correctamente');
      console.log('   - Revisar configuración de Slack');
    } else if (!result.hubspotUpdated && result.slackMessageSent) {
      console.log('⚠️  Notificación enviada pero fallo en HubSpot');
      console.log('   - Slack notificado correctamente');
      console.log('   - Revisar configuración de HubSpot');
    } else {
      console.log('❌ Fallo en ambas operaciones');
      console.log('   - Revisar logs para detalles');
    }

    // Mostrar análisis de urgencia
    console.log('\n🚨 Análisis de urgencia:');
    const urgencyAnalysis = {
      critical: '🚨 CRÍTICO: Stock ≤ 5 unidades - Acción inmediata requerida',
      high: '⚠️  ALTO: Stock ≤ 10 unidades - Envío prioritario de cupones',
      medium: '💡 MEDIO: Stock ≤ 20 unidades - Oferta promocional estándar',
    };
    console.log(`- ${urgencyAnalysis[result.urgencyLevel]}`);

    // Mostrar descuento aplicable
    const discounts = {
      critical: '25% OFF - ¡ÚLTIMAS UNIDADES!',
      high: '20% OFF - STOCK LIMITADO',
      medium: '15% OFF - OFERTA ESPECIAL',
    };
    console.log(`- Descuento sugerido: ${discounts[result.urgencyLevel]}`);

    console.log('\n✅ Test de Recompensas por Escasez completado!');
  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testRecompensasEscasez().catch(console.error);
}

module.exports = { testRecompensasEscasez };
