/**
 * 💫 Dropout Positivo Handler
 *
 * Lógica principal para procesar contacts con engagement bajo
 * y aplicar boost de reactivación.
 */

import axios from 'axios';
import { Logger } from '../../utils/Logger';

const logger = new Logger('dropout-positivo');

export interface DropoutPositivoConfig {
  contactId: string;
  email: string;
  lastEngagementDate?: string;
  hubspotApiKey: string;
  slackBotToken: string;
  slackChannel: string;
  scoreBoost?: number;
  thresholdDays?: number;
}

export interface DropoutPositivoResult {
  id: string;
  contactId: string;
  email: string;
  lastEngagementDate?: string;
  daysSinceEngagement: number;
  previousScore: number;
  newScore: number;
  slackMessageId: string;
  processedAt: string;
  success: boolean;
}

/**
 * Handler principal para el procesamiento de Dropout Positivo
 */
export const dropoutPositivoHandler = async (
  config: DropoutPositivoConfig
): Promise<DropoutPositivoResult> => {
  const executionId = `dropout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const scoreBoost = config.scoreBoost || 30;
  const thresholdDays = config.thresholdDays || 7;

  logger.info('💫 Iniciando procesamiento Dropout Positivo', {
    id: executionId,
    contactId: config.contactId,
    email: config.email,
    scoreBoost,
    thresholdDays,
  });

  try {
    // 1. Obtener información actual del contact
    const contactInfo = await getHubSpotContact(
      config.contactId,
      config.hubspotApiKey
    );

    const currentScore = parseInt(contactInfo.lead_influence_score || '0');
    const lastEngagement =
      config.lastEngagementDate || contactInfo.last_engagement_date;
    const daysSinceEngagement = calculateDaysSinceEngagement(lastEngagement);

    logger.info('📊 Información del contact', {
      contactId: config.contactId,
      currentScore,
      lastEngagement,
      daysSinceEngagement,
    });

    // 2. Verificar si cumple con el threshold
    if (daysSinceEngagement < thresholdDays) {
      logger.info('⏭️ Contact no cumple threshold, saltando procesamiento', {
        daysSinceEngagement,
        thresholdDays,
      });

      return {
        id: executionId,
        contactId: config.contactId,
        email: config.email,
        lastEngagementDate: lastEngagement,
        daysSinceEngagement,
        previousScore: currentScore,
        newScore: currentScore,
        slackMessageId: '',
        processedAt: new Date().toISOString(),
        success: false,
      };
    }

    // 3. Aplicar boost de score en HubSpot
    const newScore = currentScore + scoreBoost;
    await updateHubSpotContactScore(
      config.contactId,
      newScore,
      config.hubspotApiKey
    );

    logger.info('🔄 Score actualizado en HubSpot', {
      contactId: config.contactId,
      previousScore: currentScore,
      newScore,
      boost: scoreBoost,
    });

    // 4. Enviar mensaje a Slack
    const slackMessageId = await sendDropoutSlackMessage({
      email: config.email,
      newScore,
      previousScore: currentScore,
      daysSinceEngagement,
      slackChannel: config.slackChannel,
      slackBotToken: config.slackBotToken,
    });

    logger.info('💬 Mensaje enviado a Slack', {
      messageId: slackMessageId,
      channel: config.slackChannel,
    });

    const result: DropoutPositivoResult = {
      id: executionId,
      contactId: config.contactId,
      email: config.email,
      lastEngagementDate: lastEngagement,
      daysSinceEngagement,
      previousScore: currentScore,
      newScore,
      slackMessageId,
      processedAt: new Date().toISOString(),
      success: true,
    };

    logger.info('✅ Dropout Positivo procesado exitosamente', result);
    return result;
  } catch (error) {
    logger.error('❌ Error en procesamiento Dropout Positivo', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      contactId: config.contactId,
      executionId,
    });

    throw error;
  }
};

/**
 * Obtener información del contact desde HubSpot
 */
async function getHubSpotContact(
  contactId: string,
  apiKey: string,
  retries = 3
): Promise<any> {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          properties:
            'email,lead_influence_score,last_engagement_date,firstname,lastname',
        },
      });

      return response.data.properties;
    } catch (error) {
      if (attempt === retries) {
        logger.error(
          '❌ Error obteniendo contact de HubSpot después de todos los reintentos',
          {
            contactId,
            attempt,
            error: error instanceof Error ? error.message : String(error),
          }
        );
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
      logger.warn(`Reintento ${attempt}/${retries} en ${delay}ms`, {
        contactId,
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Error inesperado en getHubSpotContact');
}

/**
 * Actualizar score del contact en HubSpot
 */
async function updateHubSpotContactScore(
  contactId: string,
  newScore: number,
  apiKey: string,
  retries = 3
): Promise<void> {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axios.patch(
        url,
        {
          properties: {
            lead_influence_score: newScore.toString(),
            last_dropout_boost_date: new Date().toISOString(),
            dropout_boost_applied: 'true',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return;
    } catch (error) {
      if (attempt === retries) {
        logger.error(
          '❌ Error actualizando contact en HubSpot después de todos los reintentos',
          {
            contactId,
            newScore,
            attempt,
            error: error instanceof Error ? error.message : String(error),
          }
        );
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      logger.warn(
        `Reintento actualización HubSpot ${attempt}/${retries} en ${delay}ms`,
        {
          contactId,
          newScore,
          error: error instanceof Error ? error.message : String(error),
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Enviar mensaje de dropout positivo a Slack
 */
async function sendDropoutSlackMessage(
  config: {
    email: string;
    newScore: number;
    previousScore: number;
    daysSinceEngagement: number;
    slackChannel: string;
    slackBotToken: string;
  },
  retries = 3
): Promise<string> {
  const message = {
    channel: config.slackChannel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            `💫 *Dropout Emocional Positivo*\n\n` +
            `*Usuario:* ${config.email}\n` +
            `*Score:* ${config.previousScore} → *${config.newScore}* (+${config.newScore - config.previousScore})\n` +
            `*Días sin engagement:* ${config.daysSinceEngagement}\n` +
            `*Acción:* Reengagement aplicado\n\n` +
            `🚀 Este usuario ha sido reactivado con un boost de score para fomentar el re-engagement.`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `⏰ ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} CET`,
          },
        ],
      },
    ],
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        message,
        {
          headers: {
            Authorization: `Bearer ${config.slackBotToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return response.data.ts;
    } catch (error) {
      if (attempt === retries) {
        logger.error(
          '❌ Error enviando mensaje a Slack después de todos los reintentos',
          {
            channel: config.slackChannel,
            attempt,
            error: error instanceof Error ? error.message : String(error),
          }
        );
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      logger.warn(`Reintento Slack ${attempt}/${retries} en ${delay}ms`, {
        channel: config.slackChannel,
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Error inesperado en sendDropoutSlackMessage');
}

/**
 * Calcular días desde el último engagement
 */
function calculateDaysSinceEngagement(lastEngagementDate?: string): number {
  if (!lastEngagementDate) {
    return 999; // Si no tiene fecha, asumimos muchos días
  }

  const lastDate = new Date(lastEngagementDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
