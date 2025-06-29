/**
 * 💫 Dropout Positivo - Zapier CLI Integration
 *
 * Detecta contacts con engagement bajo (>7 días sin actividad)
 * y los reactiva con un boost de score positivo.
 */

import { Bundle, ZObject } from 'zapier-platform-core';
import dotenv from 'dotenv';
import { Logger } from '../../utils/Logger';

// Cargar variables de entorno
dotenv.config();

// Import dinámico del handler para evitar problemas de compilación
const getHandler = () => {
  try {
    return require('./handler').dropoutPositivoHandler;
  } catch (error) {
    throw new Error(`Error cargando handler: ${error}`);
  }
};

const logger = new Logger('dropout-positivo');

/**
 * Configuración del trigger de HubSpot
 * Webhook que se activa cuando last_engagement_date < now - 7 days
 */
export const dropoutPositivoTrigger = async (z: ZObject, bundle: Bundle) => {
  logger.info('💫 Dropout Positivo trigger activado', {
    subscriptionId: bundle.subscribeData?.id,
    targetUrl: bundle.targetUrl,
    executionId: `dropout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  });

  try {
    // En modo de suscripción, configurar el webhook
    if (bundle.subscribeData) {
      logger.info('🔧 Configurando webhook para Dropout Positivo');

      const webhookData = {
        objectTypeId: 'contacts',
        propertyName: 'last_engagement_date',
        filters: [
          {
            filterType: 'PROPERTY',
            property: 'last_engagement_date',
            operator: 'LTE',
            value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
          },
        ],
      };

      return [webhookData];
    }

    // Procesar datos del webhook
    const inputData = bundle.inputData || {};

    logger.info('📥 Datos recibidos del webhook HubSpot', {
      contactId: inputData.objectId,
      email: inputData.email,
      lastEngagement: inputData.last_engagement_date,
    });

    // Validar que tenemos los datos necesarios
    if (!inputData.objectId) {
      throw new Error('Contact ID no encontrado en los datos del webhook');
    }

    // Ejecutar el handler principal
    const dropoutPositivoHandler = getHandler();
    const result = await dropoutPositivoHandler({
      contactId: inputData.objectId,
      email: inputData.email || 'email-no-disponible@unknown.com',
      lastEngagementDate: inputData.last_engagement_date,
      hubspotApiKey: process.env.HUBSPOT_API_KEY!,
      slackBotToken: process.env.SLACK_BOT_TOKEN!,
      slackChannel: '#auditoria-sagrada',
    });

    logger.info('✅ Dropout Positivo procesado exitosamente', {
      contactId: inputData.objectId,
      newScore: result.newScore,
      messageId: result.slackMessageId,
    });

    return [result];
  } catch (error) {
    logger.error('❌ Error en Dropout Positivo trigger', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      inputData: bundle.inputData,
    });

    throw error;
  }
};

/**
 * Configurar suscripción al webhook de HubSpot
 */
export const setupHubSpotWebhook = async (z: ZObject, bundle: Bundle) => {
  logger.info('🔧 Configurando webhook HubSpot para Dropout Positivo');

  const options = {
    url: 'https://api.hubapi.com/webhooks/v3/subscriptions',
    method: 'POST' as const,
    headers: {
      Authorization: `Bearer ${bundle.authData.access_token}`,
      'Content-Type': 'application/json',
    },
    json: {
      eventType: 'contact.propertyChange',
      propertyName: 'last_engagement_date',
      subscriptionDetails: {
        subscriptionType: 'TIMELINE',
        filters: [
          {
            filterType: 'PROPERTY',
            property: 'last_engagement_date',
            operator: 'LTE',
            value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
      enabled: true,
    },
  };

  const response = await z.request(options);
  logger.info('✅ Webhook HubSpot configurado', {
    subscriptionId: response.json?.id,
  });

  return { id: response.json?.id };
};

/**
 * Remover suscripción al webhook de HubSpot
 */
export const removeHubSpotWebhook = async (z: ZObject, bundle: Bundle) => {
  const subscriptionId = bundle.subscribeData?.id;

  if (!subscriptionId) {
    logger.warn('⚠️ No se encontró ID de suscripción para remover');
    return;
  }

  logger.info('🗑️ Removiendo webhook HubSpot', { subscriptionId });

  const options = {
    url: `https://api.hubapi.com/webhooks/v3/subscriptions/${subscriptionId}`,
    method: 'DELETE' as const,
    headers: {
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
  };

  await z.request(options);
  logger.info('✅ Webhook HubSpot removido exitosamente');
};

/**
 * Configuración del Zap para Zapier CLI
 */
export const dropoutPositivoZap = {
  key: 'dropout_positivo',
  noun: 'Dropout Positivo',
  display: {
    label: '💫 Dropout Positivo',
    description:
      'Detecta contacts sin engagement reciente y los reactiva con score boost',
  },
  operation: {
    type: 'hook',
    perform: dropoutPositivoTrigger,
    performSubscribe: setupHubSpotWebhook,
    performUnsubscribe: removeHubSpotWebhook,

    inputFields: [
      {
        key: 'threshold_days',
        label: 'Días sin engagement',
        type: 'integer',
        default: 7,
        helpText: 'Número de días sin actividad para considerar dropout',
      },
      {
        key: 'score_boost',
        label: 'Boost de score',
        type: 'integer',
        default: 30,
        helpText: 'Puntos a agregar al lead_influence_score',
      },
    ],

    sample: {
      id: 'dropout-positivo-123',
      contactId: '12345',
      email: 'usuario@example.com',
      lastEngagementDate: '2025-06-22T00:00:00.000Z',
      daysSinceEngagement: 7,
      newScore: 65,
      previousScore: 35,
      slackMessageId: 'C1234567890_1234567890.123456',
      processedAt: new Date().toISOString(),
    },

    outputFields: [
      { key: 'id', label: 'ID de procesamiento' },
      { key: 'contactId', label: 'Contact ID' },
      { key: 'email', label: 'Email' },
      { key: 'newScore', label: 'Nuevo Score' },
      { key: 'previousScore', label: 'Score Anterior' },
      { key: 'slackMessageId', label: 'Mensaje Slack ID' },
      { key: 'processedAt', label: 'Procesado en' },
    ],
  },
};
