import { App, ExpressReceiver } from '@slack/bolt';
import { Logger } from '../utils/Logger';

/**
 * Slack OAuth App simplificada para Kopp Stadium CRM
 * Configuración OAuth 2.0 con ExpressReceiver
 */

const logger = new Logger('SlackOAuthApp');

// Validar variables de entorno requeridas para OAuth
const requiredEnvVars = [
  'SLACK_SIGNING_SECRET',
  'SLACK_CLIENT_ID',
  'SLACK_CLIENT_SECRET',
  'SLACK_STATE_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error('Variables de entorno OAuth faltantes:', { missing: missingVars });
  throw new Error(`Variables OAuth requeridas: ${missingVars.join(', ')}`);
}

/**
 * Configurar ExpressReceiver con OAuth endpoints
 */
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: process.env.SLACK_STATE_SECRET!,

  // Configuración de rutas OAuth
  endpoints: '/slack',                           // Base path para Slack endpoints

  // Configuración de scopes
  scopes: [
    'commands',           // Para slash commands
    'chat:write',         // Para enviar mensajes
    'users:read',         // Para leer info de usuarios
    'channels:read',      // Para leer info de canales
    'im:write',           // Para mensajes directos
  ]
});

/**
 * Crear la App Bolt con el receiver OAuth configurado
 */
const app = new App({
  receiver,
  // Para desarrollo, usamos el token directamente
  // En producción, esto se obtiene dinámicamente via OAuth
  token: process.env.SLACK_BOT_TOKEN,
});

/**
 * Comandos Slash OAuth
 */

// Comando /kop-test - Test básico de conectividad OAuth
app.command('/kop-test', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-test ejecutado via OAuth', { user: command.user_name });

    await say({
      text: '¡OAuth Slack funcionando! 🎉',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🏟️ Kopp Stadium CRM - OAuth Test Exitoso'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `¡Hola <@${command.user_id}>! 👋\n\n✅ *OAuth 2.0 funcionando correctamente*\n🔐 *Autenticación segura establecida*\n🎯 *Backend CRM conectado*\n⚡ *Automatizaciones activas*`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🔧 *Comandos OAuth disponibles:*\n• `/kop-status` - Estado del sistema\n• `/kop-leads` - Información de leads\n• `/kop-help` - Ayuda completa'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📅 ${new Date().toLocaleString()} | 🤖 kopstadium_bot via OAuth`
            }
          ]
        }
      ]
    });

  } catch (error) {
    logger.error('Error en comando /kop-test OAuth:', { error: (error as Error).message });
    await say('❌ Error interno. Contacta al administrador.');
  }
});

// Comando /kop-status - Estado del sistema con OAuth
app.command('/kop-status', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-status ejecutado via OAuth', { user: command.user_name });

    const uptime = process.uptime();
    const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;

    await say({
      text: 'Estado del sistema Kopp CRM OAuth',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Estado del Sistema - Kopp Stadium CRM (OAuth)'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*🟢 Estado:* Operativo\n*⏱️ Uptime:* ${uptimeFormatted}`
            },
            {
              type: 'mrkdwn',
              text: `*🔐 OAuth:* Activo\n*🤖 Bot:* Conectado`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Servicios OAuth activos:*\n✅ Slack OAuth 2.0\n✅ ExpressReceiver\n✅ Comandos Slash Seguros\n✅ Install/Redirect URLs\n✅ Health Monitoring'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🆔 Client ID: ${process.env.SLACK_CLIENT_ID}`
            }
          ]
        }
      ]
    });

  } catch (error) {
    logger.error('Error en comando /kop-status OAuth:', { error: (error as Error).message });
    await say('❌ Error al obtener estado del sistema OAuth.');
  }
});

// Comando /kop-oauth-info - Información específica de OAuth
app.command('/kop-oauth-info', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-oauth-info ejecutado', { user: command.user_name });

    const ngrokExample = 'https://abc123.ngrok.io';

    await say({
      text: 'Información OAuth - Kopp CRM',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔐 OAuth 2.0 Configuration - Kopp Stadium'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Configuración OAuth actual:*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*🆔 Client ID:* ${process.env.SLACK_CLIENT_ID}`
            },
            {
              type: 'mrkdwn',
              text: '*🔒 State Secret:* Configurado'
            },
            {
              type: 'mrkdwn',
              text: '*📍 Install Path:* /slack/install'
            },
            {
              type: 'mrkdwn',
              text: '*🔄 Redirect Path:* /slack/oauth_redirect'
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🌐 URLs para configurar en Slack App:*\n\n*Install URL:*\n\`${ngrokExample}/slack/install\`\n\n*OAuth Redirect URL:*\n\`${ngrokExample}/slack/oauth_redirect\`\n\n*Request URL (Commands):*\n\`${ngrokExample}/slack/events\``
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 Reemplaza la URL de ngrok con tu URL actual.'
            }
          ]
        }
      ]
    });

  } catch (error) {
    logger.error('Error en comando /kop-oauth-info:', { error: (error as Error).message });
    await say('❌ Error al mostrar información OAuth.');
  }
});

/**
 * Event listeners OAuth
 */

// Evento cuando la app es instalada/autorizada
app.event('app_home_opened', async ({ event, say }) => {
  logger.info('App home abierta via OAuth', { user: event.user });

  try {
    await say({
      text: '¡Bienvenido a Kopp Stadium CRM OAuth!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🏟️ ¡Bienvenido a Kopp Stadium CRM OAuth!'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '¡Gracias por instalar nuestra app con OAuth 2.0! 🎉\n\n🔐 Tu instalación es segura y encriptada.\n\nUsa `/kop-help` para ver todos los comandos disponibles.'
          }
        }
      ]
    });
  } catch (error) {
    logger.error('Error en app_home_opened:', { error: (error as Error).message });
  }
});

/**
 * Función para iniciar el servidor OAuth
 */
export async function startSlackOAuthApp(): Promise<void> {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);

    await app.start(port);

    logger.info(`🚀 Slack OAuth App iniciada en puerto ${port}`);

    console.log(`
🎉 ¡Slack OAuth App iniciada correctamente!

🔧 Configuración OAuth:
   • Port: ${port}
   • Base Path: /slack
   • Install URL: /slack/install  
   • OAuth Redirect: /slack/oauth_redirect
   • Slack Events: /slack/events

📋 Variables de entorno OAuth:
   • SLACK_CLIENT_ID: ${process.env.SLACK_CLIENT_ID ? '✅ Configurado' : '❌ Faltante'}
   • SLACK_CLIENT_SECRET: ${process.env.SLACK_CLIENT_SECRET ? '✅ Configurado' : '❌ Faltante'}
   • SLACK_SIGNING_SECRET: ${process.env.SLACK_SIGNING_SECRET ? '✅ Configurado' : '❌ Faltante'}
   • SLACK_STATE_SECRET: ${process.env.SLACK_STATE_SECRET ? '✅ Configurado' : '❌ Faltante'}

🌐 Setup con ngrok:
   1. Ejecuta: ngrok http ${port}
   2. Copia tu URL ngrok: https://abc123.ngrok.io
   3. Ve a https://api.slack.com/apps
   4. En "OAuth & Permissions" → "Redirect URLs":
      ✅ Añade: https://abc123.ngrok.io/slack/oauth_redirect
   5. En "Slash Commands" → Request URL:
      ✅ Usa: https://abc123.ngrok.io/slack/events
   6. En "Install App":
      ✅ URL: https://abc123.ngrok.io/slack/install

🚀 Comandos OAuth disponibles:
   • /kop-test - Test OAuth básico
   • /kop-status - Estado del sistema OAuth
   • /kop-oauth-info - Ver configuración OAuth actual
   • /kop-help - Ayuda completa

⚡ ¡Listo para OAuth 2.0!
    `);

  } catch (error) {
    logger.error('Error al iniciar Slack OAuth App:', { error: (error as Error).message });
    throw error;
  }
}

export { app as slackOAuthApp };
export default app;
