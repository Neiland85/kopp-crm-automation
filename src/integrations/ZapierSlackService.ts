import { WebClient } from '@slack/web-api';
import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Servicio de integración Zapier → Slack
 * Maneja notificaciones desde Hubspot vía Zapier hacia canales específicos de Slack
 */
export class ZapierSlackService {
  private slackClient: WebClient;
  private logger: Logger;
  private config: ConfigManager;
  private zapierWebhookUrl: string;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger('ZapierSlackService');
    
    const slackToken = process.env.SLACK_BOT_TOKEN;
    if (!slackToken) {
      throw new Error('SLACK_BOT_TOKEN no encontrado en variables de entorno');
    }
    
    this.slackClient = new WebClient(slackToken);
    this.zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL || '';
    
    if (!this.zapierWebhookUrl) {
      this.logger.error('ZAPIER_WEBHOOK_URL no configurada');
    }
  }

  /**
   * Envía mensaje a canal #rituales-silenciosos cuando ritual_silencioso=true
   */
  async notifyRitualSilencioso(contactData: {
    name: string;
    email: string;
    ritual_silencioso: boolean;
    hubspot_contact_id: string;
  }): Promise<void> {
    try {
      if (!contactData.ritual_silencioso) {
        return;
      }

      const message = {
        channel: '#rituales-silenciosos',
        text: `🧘 Nuevo ritual silencioso detectado`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🧘 Ritual Silencioso Activado*\n\n` +
                    `*Contacto:* ${contactData.name}\n` +
                    `*Email:* ${contactData.email}\n` +
                    `*ID Hubspot:* ${contactData.hubspot_contact_id}\n\n` +
                    `El contacto ha activado el modo ritual silencioso. ` +
                    `Se recomienda contacto mínimo y espaciado.`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Ver en Hubspot'
                },
                url: `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${contactData.hubspot_contact_id}`,
                style: 'primary'
              }
            ]
          }
        ]
      };

      await this.slackClient.chat.postMessage(message);
      this.logger.info('Notificación de ritual silencioso enviada', { contactId: contactData.hubspot_contact_id });

    } catch (error) {
      this.logger.error('Error enviando notificación de ritual silencioso:', error);
      throw error;
    }
  }

  /**
   * Notifica retornos imposibles cuando usuario_imposible=true
   */
  async notifyRetornoImposible(contactData: {
    name: string;
    email: string;
    usuario_imposible: boolean;
    hubspot_contact_id: string;
    reason?: string;
  }): Promise<void> {
    try {
      if (!contactData.usuario_imposible) {
        return;
      }

      const message = {
        channel: '#privado-retornos',
        text: `⚠️ Usuario marcado como retorno imposible`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*⚠️ Retorno Imposible*\n\n` +
                    `*Contacto:* ${contactData.name}\n` +
                    `*Email:* ${contactData.email}\n` +
                    `*ID Hubspot:* ${contactData.hubspot_contact_id}\n` +
                    (contactData.reason ? `*Razón:* ${contactData.reason}\n` : '') +
                    `\n❌ Este usuario ha sido marcado como retorno imposible. ` +
                    `No continuar esfuerzos de reactivación.`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Ver en Hubspot'
                },
                url: `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${contactData.hubspot_contact_id}`,
                style: 'danger'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Actualizar Estado'
                },
                action_id: 'update_impossible_user'
              }
            ]
          }
        ]
      };

      await this.slackClient.chat.postMessage(message);
      this.logger.info('Notificación de retorno imposible enviada', { contactId: contactData.hubspot_contact_id });

    } catch (error) {
      this.logger.error('Error enviando notificación de retorno imposible:', error);
      throw error;
    }
  }

  /**
   * Webhook endpoint para recibir datos desde Zapier
   */
  async handleZapierWebhook(webhookData: any): Promise<void> {
    try {
      this.logger.info('Webhook recibido desde Zapier', webhookData);

      // Procesar diferentes tipos de eventos
      switch (webhookData.event_type) {
        case 'ritual_silencioso':
          await this.notifyRitualSilencioso(webhookData.contact);
          break;
        
        case 'usuario_imposible':
          await this.notifyRetornoImposible(webhookData.contact);
          break;
        
        default:
          this.logger.warn('Tipo de evento desconocido desde Zapier:', webhookData.event_type);
      }

    } catch (error) {
      this.logger.error('Error procesando webhook de Zapier:', error);
      throw error;
    }
  }

  /**
   * Configurar webhooks en Slack si es necesario
   */
  async setupSlackWebhooks(): Promise<void> {
    try {
      // Verificar permisos del bot
      const authTest = await this.slackClient.auth.test();
      this.logger.info('Bot de Slack autenticado:', { 
        team: authTest.team,
        user: authTest.user,
        bot_id: authTest.bot_id 
      });

      // Verificar canales requeridos
      const channels = ['rituales-silenciosos', 'privado-retornos'];
      for (const channelName of channels) {
        try {
          const channel = await this.slackClient.conversations.list({
            types: 'public_channel,private_channel'
          });
          
          const foundChannel = channel.channels?.find(c => c.name === channelName);
          if (!foundChannel) {
            this.logger.warn(`Canal #${channelName} no encontrado. Debe ser creado manualmente.`);
          } else {
            this.logger.info(`Canal #${channelName} encontrado`, { id: foundChannel.id });
          }
        } catch (error) {
          this.logger.error(`Error verificando canal #${channelName}:`, error);
        }
      }

    } catch (error) {
      this.logger.error('Error configurando webhooks de Slack:', error);
      throw error;
    }
  }
}
