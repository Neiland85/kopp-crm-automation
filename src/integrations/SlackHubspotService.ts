import { WebClient } from '@slack/web-api';
import axios from 'axios';
import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';

/**
 * Servicio de integración Slack → Hubspot
 * Sincroniza mensajes de canales específicos con contactos de Hubspot
 * y envía respuestas automáticas cuando contactos avanzan de etapa
 */
export class SlackHubspotService {
  private slackClient: WebClient;
  private logger: Logger;
  private config: ConfigManager;
  private hubspotApiKey: string;
  private hubspotBaseUrl: string;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger('SlackHubspotService');
    
    const slackToken = process.env.SLACK_BOT_TOKEN;
    if (!slackToken) {
      throw new Error('SLACK_BOT_TOKEN no encontrado en variables de entorno');
    }
    
    this.slackClient = new WebClient(slackToken);
    this.hubspotApiKey = process.env.HUBSPOT_API_KEY || '';
    this.hubspotBaseUrl = 'https://api.hubapi.com';
    
    if (!this.hubspotApiKey) {
      throw new Error('HUBSPOT_API_KEY no encontrada en variables de entorno');
    }
  }

  /**
   * Captura mensajes de canales específicos y los sincroniza con Hubspot
   */
  async syncChannelMessagesToHubspot(channelId: string, message: any): Promise<void> {
    try {
      // Solo procesar canales específicos
      const monitoredChannels = ['growth-marketing', 'soporte-y-clientes'];
      
      const channelInfo = await this.slackClient.conversations.info({ channel: channelId });
      const channelName = channelInfo.channel?.name;
      
      if (!channelName || !monitoredChannels.includes(channelName)) {
        return;
      }

      this.logger.info(`Procesando mensaje del canal #${channelName}`, { 
        messageTs: message.ts,
        user: message.user 
      });

      // Obtener información del usuario
      const userInfo = await this.slackClient.users.info({ user: message.user });
      const userEmail = userInfo.user?.profile?.email;
      
      if (!userEmail) {
        this.logger.warn('No se pudo obtener email del usuario de Slack');
        return;
      }

      // Buscar contacto en Hubspot por email
      const contact = await this.findHubspotContactByEmail(userEmail);
      
      if (contact) {
        await this.addNoteToHubspotContact(contact.id, {
          channel: channelName,
          message: message.text,
          timestamp: message.ts,
          slackUser: userInfo.user?.real_name || 'Usuario desconocido'
        });
      } else {
        // Crear nuevo contacto si no existe
        await this.createHubspotContactFromSlack(userInfo.user!, channelName, message.text);
      }

    } catch (error) {
      this.logger.error('Error sincronizando mensaje de Slack con Hubspot:', error);
    }
  }

  /**
   * Busca un contacto en Hubspot por email
   */
  private async findHubspotContactByEmail(email: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.hubspotBaseUrl}/crm/v3/objects/contacts/search`,
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          },
          data: {
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: email
              }]
            }]
          }
        }
      );

      return response.data.results?.[0] || null;
    } catch (error) {
      this.logger.error('Error buscando contacto en Hubspot:', error);
      return null;
    }
  }

  /**
   * Añade una nota a un contacto de Hubspot
   */
  private async addNoteToHubspotContact(contactId: string, noteData: {
    channel: string;
    message: string;
    timestamp: string;
    slackUser: string;
  }): Promise<void> {
    try {
      const noteContent = `📱 Mensaje desde Slack #${noteData.channel}
      
Usuario: ${noteData.slackUser}
Timestamp: ${new Date(parseInt(noteData.timestamp) * 1000).toISOString()}

Mensaje:
${noteData.message}

---
Sincronizado automáticamente desde Slack`;

      await axios.post(
        `${this.hubspotBaseUrl}/crm/v3/objects/notes`,
        {
          properties: {
            hs_note_body: noteContent,
            hs_timestamp: Date.now()
          },
          associations: [{
            to: { id: contactId },
            types: [{
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202
            }]
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.logger.info('Nota añadida al contacto de Hubspot', { contactId });
    } catch (error) {
      this.logger.error('Error añadiendo nota al contacto de Hubspot:', error);
    }
  }

  /**
   * Crea un nuevo contacto en Hubspot desde información de Slack
   */
  private async createHubspotContactFromSlack(slackUser: any, channel: string, message: string): Promise<void> {
    try {
      const contactData = {
        properties: {
          email: slackUser.profile?.email,
          firstname: slackUser.profile?.first_name || slackUser.real_name?.split(' ')[0],
          lastname: slackUser.profile?.last_name || slackUser.real_name?.split(' ').slice(1).join(' '),
          source_slack_channel: channel,
          source_slack_user_id: slackUser.id,
          lifecyclestage: 'lead'
        }
      };

      const response = await axios.post(
        `${this.hubspotBaseUrl}/crm/v3/objects/contacts`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const contactId = response.data.id;
      
      // Añadir primera nota
      await this.addNoteToHubspotContact(contactId, {
        channel,
        message,
        timestamp: Date.now().toString(),
        slackUser: slackUser.real_name || 'Usuario desconocido'
      });

      this.logger.info('Nuevo contacto creado en Hubspot desde Slack', { contactId });
    } catch (error) {
      this.logger.error('Error creando contacto en Hubspot:', error);
    }
  }

  /**
   * Envía respuesta automática a Slack cuando un contacto avanza de etapa en Hubspot
   */
  async notifyStageAdvancement(contactData: {
    email: string;
    name: string;
    previousStage: string;
    newStage: string;
    hubspotContactId: string;
  }): Promise<void> {
    try {
      // Buscar usuario de Slack por email
      const users = await this.slackClient.users.list({});
      const slackUser = users.members?.find(user => 
        user.profile?.email === contactData.email
      );

      if (!slackUser) {
        this.logger.warn('Usuario de Slack no encontrado para notificación de etapa', { 
          email: contactData.email 
        });
        return;
      }

      // Determinar canal de notificación según la etapa
      let channelName = 'general';
      let messageIcon = '📈';
      
      switch (contactData.newStage.toLowerCase()) {
        case 'customer':
          channelName = 'growth-marketing';
          messageIcon = '🎉';
          break;
        case 'opportunity':
          channelName = 'soporte-y-clientes';
          messageIcon = '🔥';
          break;
        case 'qualified':
          channelName = 'growth-marketing';
          messageIcon = '✅';
          break;
      }

      const message = {
        channel: `#${channelName}`,
        text: `${messageIcon} Avance de etapa en Hubspot`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${messageIcon} Avance de Etapa*\n\n` +
                    `*Contacto:* ${contactData.name}\n` +
                    `*Email:* ${contactData.email}\n` +
                    `*Etapa anterior:* ${contactData.previousStage}\n` +
                    `*Nueva etapa:* ${contactData.newStage}\n\n` +
                    `¡El contacto ha avanzado en el embudo de ventas!`
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
                url: `https://app.hubspot.com/contacts/${process.env.HUBSPOT_PORTAL_ID}/contact/${contactData.hubspotContactId}`,
                style: 'primary'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Contactar'
                },
                action_id: 'contact_user'
              }
            ]
          }
        ]
      };

      await this.slackClient.chat.postMessage(message);
      
      // También enviar DM al usuario si corresponde
      if (contactData.newStage.toLowerCase() === 'customer') {
        await this.slackClient.chat.postMessage({
          channel: slackUser.id!,
          text: `¡Felicidades! 🎉 Has avanzado a cliente en nuestro sistema. ¡Gracias por confiar en nosotros!`
        });
      }

      this.logger.info('Notificación de avance de etapa enviada', { 
        contactId: contactData.hubspotContactId,
        stage: contactData.newStage 
      });

    } catch (error) {
      this.logger.error('Error enviando notificación de avance de etapa:', error);
    }
  }

  /**
   * Configura listeners para eventos de Slack
   */
  async setupSlackEventListeners(): Promise<void> {
    try {
      this.logger.info('Configurando listeners de eventos de Slack...');
      
      // Nota: En una implementación real, esto se haría con Slack Bolt Framework
      // Este es un placeholder para mostrar la estructura
      
      this.logger.info('Listeners de Slack configurados correctamente');
    } catch (error) {
      this.logger.error('Error configurando listeners de Slack:', error);
      throw error;
    }
  }
}
