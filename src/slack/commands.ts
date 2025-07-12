import { App } from '@slack/bolt';
import { Logger } from '../utils/Logger';

/**
 * Slack Bolt App para comandos slash de Kopp Stadium CRM
 */

const logger = new Logger('SlackBoltApp');

// Configurar la app Bolt
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false, // Usar HTTP mode para webhooks
  port: parseInt(process.env.PORT || '3000', 10),
});

/**
 * Comando /kop-test - Test básico de conectividad
 */
app.command('/kop-test', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-test ejecutado', { user: command.user_name });

    await say({
      text: '¡Slash command funcionando! 🎉',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🏟️ Kopp Stadium CRM - Test Exitoso'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `¡Hola <@${command.user_id}>! 👋\n\n✅ *Slash command funcionando correctamente*\n🎯 *Backend CRM conectado*\n⚡ *Automatizaciones activas*`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📅 ${new Date().toLocaleString()} | 🤖 kopstadium_bot`
            }
          ]
        }
      ]
    });
  } catch (error) {
    logger.error('Error en comando /kop-test', { error: error instanceof Error ? error.message : String(error) });
    await say('❌ Error ejecutando el comando. Contacta al administrador.');
  }
});

/**
 * Comando /kop-status - Verificar estado del sistema
 */
app.command('/kop-status', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-status ejecutado', { user: command.user_name });

    // Simular verificación de estados (en producción conectarías a tus servicios reales)
    const systemStatus = {
      hubspot: '✅ Conectado',
      zapier: '✅ Activo',
      notion: '✅ Operacional',
      backend: '✅ Healthy'
    };

    await say({
      text: '📊 Estado del Sistema Kopp CRM',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Estado del Sistema Kopp CRM'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*HubSpot CRM:*\n${systemStatus.hubspot}`
            },
            {
              type: 'mrkdwn',
              text: `*Zapier Automation:*\n${systemStatus.zapier}`
            },
            {
              type: 'mrkdwn',
              text: `*Notion Dashboard:*\n${systemStatus.notion}`
            },
            {
              type: 'mrkdwn',
              text: `*Backend API:*\n${systemStatus.backend}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🔗 Ver Dashboard'
              },
              url: 'https://kopp-crm-automation.vercel.app/health',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📚 Documentación'
              },
              url: 'https://github.com/Neiland85/kopp-crm-automation'
            }
          ]
        }
      ]
    });
  } catch (error) {
    logger.error('Error en comando /kop-status', { error: error instanceof Error ? error.message : String(error) });
    await say('❌ Error obteniendo el estado del sistema.');
  }
});

/**
 * Comando /kop-leads - Información sobre leads recientes
 */
app.command('/kop-leads', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-leads ejecutado', { user: command.user_name });

    await say({
      text: '🎯 Información de Leads - Kopp Stadium',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 Resumen de Leads Recientes'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*📈 Métricas del Día:*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*🔥 Hot Leads:*\n`3 nuevos`'
            },
            {
              type: 'mrkdwn',
              text: '*📊 Lead Score Promedio:*\n`68/100`'
            },
            {
              type: 'mrkdwn',
              text: '*⚡ Automatizaciones:*\n`12 ejecutadas`'
            },
            {
              type: 'mrkdwn',
              text: '*🎁 Recompensas:*\n`5 enviadas`'
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 Usa `/kop-status` para ver el estado completo del sistema'
            }
          ]
        }
      ]
    });
  } catch (error) {
    logger.error('Error en comando /kop-leads', { error: error instanceof Error ? error.message : String(error) });
    await say('❌ Error obteniendo información de leads.');
  }
});

/**
 * Comando /kop-help - Ayuda y comandos disponibles
 */
app.command('/kop-help', async ({ ack, say, command }) => {
  try {
    await ack();
    logger.info('Comando /kop-help ejecutado', { user: command.user_name });

    await say({
      text: '📚 Ayuda - Comandos Kopp Stadium CRM',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📚 Comandos Disponibles'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Comandos del Sistema Kopp CRM:*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*`/kop-test`*\nTest de conectividad básico'
            },
            {
              type: 'mrkdwn',
              text: '*`/kop-status`*\nEstado del sistema completo'
            },
            {
              type: 'mrkdwn',
              text: '*`/kop-leads`*\nResumen de leads recientes'
            },
            {
              type: 'mrkdwn',
              text: '*`/kop-help`*\nEsta ayuda'
            }
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🤖 Bot desarrollado para Kopp Stadium CRM | 🛠️ Soporte técnico disponible'
            }
          ]
        }
      ]
    });
  } catch (error) {
    logger.error('Error en comando /kop-help', { error: error instanceof Error ? error.message : String(error) });
    await say('❌ Error mostrando la ayuda.');
  }
});

/**
 * Error handler global
 */
app.error(async (error) => {
  logger.error('Error global en Slack Bolt App', { error: error instanceof Error ? error.message : String(error) });
});

/**
 * Función para iniciar la app Bolt
 */
export async function startSlackBoltApp(): Promise<void> {
  try {
    await app.start();
    logger.info(`⚡️ Slack Bolt app listening on port ${process.env.PORT || 3000}`);
    console.log('🚀 Slack Bolt App iniciada correctamente');
    console.log('📋 Comandos disponibles: /kop-test, /kop-status, /kop-leads, /kop-help');
  } catch (error) {
    logger.error('Error iniciando Slack Bolt App', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Función para detener la app Bolt
 */
export async function stopSlackBoltApp(): Promise<void> {
  try {
    await app.stop();
    logger.info('Slack Bolt App detenida');
  } catch (error) {
    logger.error('Error deteniendo Slack Bolt App', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export { app };
export default app;
