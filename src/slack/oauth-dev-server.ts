#!/usr/bin/env node
/**
 * Servidor de desarrollo OAuth para comandos Slack con Bolt.js + ExpressReceiver
 * Este servidor incluye OAuth 2.0 flow completo para desarrollo local con ngrok
 */

import { startSlackOAuthApp } from './oauth-app-simple';
import { Logger } from '../utils/Logger';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const logger = new Logger('SlackOAuthDevServer');

/**
 * Función principal para iniciar el servidor OAuth de desarrollo
 */
async function main() {
  try {
    logger.info('🚀 Iniciando servidor OAuth de desarrollo para Slack Bolt...');

    // Validar variables de entorno requeridas para OAuth
    const requiredEnvVars = [
      'SLACK_BOT_TOKEN',
      'SLACK_SIGNING_SECRET',
      'SLACK_CLIENT_ID',
      'SLACK_CLIENT_SECRET',
      'SLACK_STATE_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error('Variables de entorno OAuth faltantes:', { missing: missingVars });
      console.error('❌ Variables de entorno OAuth requeridas:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\n📋 Actualiza tu archivo .env con todas las variables OAuth necesarias.');

      if (missingVars.includes('SLACK_CLIENT_SECRET')) {
        console.error('\n🔑 Para obtener SLACK_CLIENT_SECRET:');
        console.error('   1. Ve a https://api.slack.com/apps');
        console.error('   2. Selecciona tu app');
        console.error('   3. Ve a "Basic Information"');
        console.error('   4. En "App Credentials" → copia "Client Secret"');
      }

      process.exit(1);
    }

    // Iniciar la app OAuth Bolt
    await startSlackOAuthApp();

    const port = process.env.PORT || 3000;
    logger.info(`✅ Servidor OAuth de desarrollo iniciado en puerto ${port}`);

    console.log(`
🎉 ¡Servidor OAuth Slack Bolt iniciado correctamente!

📋 Comandos OAuth disponibles:
   • /kop-test        - Test OAuth básico
   • /kop-status      - Estado del sistema OAuth
   • /kop-oauth-info  - Ver configuración OAuth
   • /kop-help        - Ayuda y comandos

🔐 Configuración OAuth:
   • Client ID: ${process.env.SLACK_CLIENT_ID}
   • Install URL: http://localhost:${port}/slack/install
   • OAuth Redirect: http://localhost:${port}/slack/oauth_redirect
   • Slack Events: http://localhost:${port}/slack/events

🌐 Próximos pasos con ngrok:
   1. En otra terminal, ejecuta: ngrok http ${port}
   2. Copia la URL ngrok (ej: https://abc123.ngrok.io)
   3. Ve a https://api.slack.com/apps → tu app
   4. En "OAuth & Permissions":
      ✅ Redirect URLs → Añade: https://abc123.ngrok.io/slack/oauth_redirect
   5. En "Slash Commands":
      ✅ Request URL → Actualiza: https://abc123.ngrok.io/slack/events
   6. Para instalar:
      ✅ URL completa: https://abc123.ngrok.io/slack/install

⚡ OAuth 2.0 flow listo para desarrollo!
    `);

    // Manejar señales de cierre
    process.on('SIGINT', () => {
      logger.info('🛑 Cerrando servidor OAuth...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('🛑 Cerrando servidor OAuth...');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error crítico en servidor OAuth:', { error: (error as Error).message });
    console.error('❌ Error al iniciar servidor OAuth:', (error as Error).message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}
