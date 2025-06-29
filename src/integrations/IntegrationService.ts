import { ZapierSlackService } from './ZapierSlackService';
import { SlackHubspotService } from './SlackHubspotService';
import { Logger } from '../utils/Logger';
import { ConfigManager } from '../config/ConfigManager';
import express, { Request, Response } from 'express';

/**
 * Servicio principal de integración
 * Orquesta las integraciones entre Slack, Zapier y Hubspot
 */
export class IntegrationService {
  private zapierSlackService: ZapierSlackService;
  private slackHubspotService: SlackHubspotService;
  private logger: Logger;
  private config: ConfigManager;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger('IntegrationService');
    this.zapierSlackService = new ZapierSlackService(config);
    this.slackHubspotService = new SlackHubspotService(config);
  }

  /**
   * Inicializa todas las integraciones
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('🔗 Inicializando servicios de integración...');

      // Configurar webhooks de Slack
      await this.zapierSlackService.setupSlackWebhooks();

      // Configurar listeners de eventos de Slack
      await this.slackHubspotService.setupSlackEventListeners();

      this.logger.info(
        '✅ Servicios de integración inicializados correctamente'
      );
    } catch (error) {
      this.logger.error(
        '❌ Error inicializando servicios de integración:',
        error
      );
      throw error;
    }
  }

  /**
   * Configura las rutas de webhooks para Express
   */
  setupWebhookRoutes(app: express.Application): void {
    // Webhook para recibir datos de Zapier
    app.post(
      '/webhooks/zapier',
      async (req: Request, res: Response): Promise<void> => {
        try {
          await this.zapierSlackService.handleZapierWebhook(req.body);
          res.status(200).json({ success: true });
        } catch (error) {
          this.logger.error('Error procesando webhook de Zapier:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      }
    );

    // Webhook para eventos de Slack
    app.post(
      '/webhooks/slack',
      async (req: Request, res: Response): Promise<void> => {
        try {
          const { type, challenge, event } = req.body;

          // Verificación de URL para Slack
          if (type === 'url_verification') {
            res.status(200).send(challenge);
            return;
          }

          // Procesar eventos de mensajes
          if (type === 'event_callback' && event?.type === 'message') {
            await this.slackHubspotService.syncChannelMessagesToHubspot(
              event.channel,
              event
            );
          }

          res.status(200).json({ success: true });
        } catch (error) {
          this.logger.error('Error procesando webhook de Slack:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      }
    );

    // Webhook para eventos de Hubspot
    app.post(
      '/webhooks/hubspot',
      async (req: Request, res: Response): Promise<void> => {
        try {
          const events = req.body;

          for (const event of events) {
            if (
              event.subscriptionType === 'contact.propertyChange' &&
              event.propertyName === 'lifecyclestage'
            ) {
              // Obtener datos del contacto desde Hubspot
              const contactData = await this.getHubspotContactData(
                event.objectId
              );

              if (contactData) {
                await this.slackHubspotService.notifyStageAdvancement({
                  email: contactData.properties.email,
                  name: `${contactData.properties.firstname || ''} ${contactData.properties.lastname || ''}`.trim(),
                  previousStage: event.propertyValue.previousValue || 'unknown',
                  newStage: event.propertyValue.value,
                  hubspotContactId: event.objectId.toString(),
                });
              }
            }
          }

          res.status(200).json({ success: true });
        } catch (error) {
          this.logger.error('Error procesando webhook de Hubspot:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      }
    );

    this.logger.info('🌐 Rutas de webhooks configuradas');
  }

  /**
   * Obtiene datos de un contacto de Hubspot
   */
  private async getHubspotContactData(contactId: string): Promise<any> {
    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          params: {
            properties: 'email,firstname,lastname,lifecyclestage',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Error obteniendo datos del contacto de Hubspot:',
        error
      );
      return null;
    }
  }

  /**
   * Método de utilidad para testing manual de integraciones
   */
  async testIntegrations(): Promise<void> {
    try {
      this.logger.info('🧪 Ejecutando tests de integración...');

      // Test de Zapier → Slack
      await this.zapierSlackService.notifyRitualSilencioso({
        name: 'Test Usuario',
        email: 'test@example.com',
        ritual_silencioso: true,
        hubspot_contact_id: '12345',
      });

      // Test de Slack → Hubspot (simulado)
      await this.slackHubspotService.notifyStageAdvancement({
        email: 'test@example.com',
        name: 'Test Usuario',
        previousStage: 'lead',
        newStage: 'customer',
        hubspotContactId: '12345',
      });

      this.logger.info('✅ Tests de integración completados');
    } catch (error) {
      this.logger.error('❌ Error en tests de integración:', error);
    }
  }
}
