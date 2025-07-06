#!/usr/bin/env node
/**
 * Servidor de desarrollo para comandos Slash de Slack con Bolt.js
 * Este servidor es específico para desarrollo local con ngrok
 */

import { startSlackBoltApp } from './commands';
import { Logger } from '../utils/Logger';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const logger = new Logger('SlackDevServer');

/**
 * Función principal para iniciar el servidor de desarrollo
 */
async function main() {
  try {
    logger.info('🚀 Iniciando servidor de desarrollo para Slack Bolt...');

    // Validar variables de entorno requeridas
    const requiredEnvVars = ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error('Variables de entorno faltantes:', { missing: missingVars });
      console.error('❌ Variables de entorno requeridas:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\n📋 Asegúrate de que tu archivo .env contiene todas las variables necesarias.');
      process.exit(1);
    }

    // Iniciar la app Bolt
    await startSlackBoltApp();

    const port = process.env.PORT || 3000;
    logger.info(`✅ Servidor de desarrollo iniciado en puerto ${port}`);

    console.log(`
🎉 ¡Servidor Slack Bolt iniciado correctamente!

📋 Comandos disponibles:
   • /kop-test     - Test de conectividad
   • /kop-status   - Estado del sistema  
   • /kop-leads    - Información de leads
   • /kop-help     - Ayuda y comandos

🌐 Para desarrollo local con ngrok:
   1. Instala ngrok: https://ngrok.com/download
   2. Ejecuta: ngrok http ${port}
   3. Copia la URL HTTPS que te da ngrok
   4. Ve a https://api.slack.com/apps
   5. Selecciona tu app Kopp Stadium
   6. Ve a "Slash Commands"
   7. Edita cada comando y actualiza el Request URL a:
      https://[tu-ngrok-url].ngrok.io/slack/events

🔧 Variables de entorno cargadas:
   • SLACK_BOT_TOKEN: ${process.env.SLACK_BOT_TOKEN ? '✅ Configurado' : '❌ No encontrado'}
   • SLACK_SIGNING_SECRET: ${process.env.SLACK_SIGNING_SECRET ? '✅ Configurado' : '❌ No encontrado'}

⚡ Servidor corriendo en: http://localhost:${port}
`);

  } catch (error) {
    logger.error('Error iniciando servidor de desarrollo', {
      error: error instanceof Error ? error.message : String(error)
    });
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT, cerrando servidor...');
  console.log('\n👋 Cerrando servidor de desarrollo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM, cerrando servidor...');
  console.log('\n👋 Cerrando servidor de desarrollo...');
  process.exit(0);
});

// Ejecutar servidor si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}
