import { Client } from '@hubspot/api-client';
import { WebClient, Block, KnownBlock } from '@slack/web-api';
import { Logger } from '../../utils/Logger';

// Configurar logger específico para Hot Leads
const logger = new Logger('hot-leads');

/**
 * 🚨 Handler principal de Hot Leads Detection
 *
 * Funcionalidades:
 * 1. Actualiza lead_status = 'Hot Lead' en HubSpot
 * 2. Envía alerta inmediata a Slack #hot-leads
 * 3. Maneja errores con reintentos exponenciales
 */

export interface HotLeadsConfig {
  hubspotApiKey: string;
  slackBotToken: string;
  slackSigningSecret: string;
  slackChannel: string;
  hotLeadThreshold: number;
  isEnabled: boolean;
}

export interface HotLeadTriggerData {
  contactId: string;
  email: string;
  leadInfluenceScore: number;
  previousScore?: number;
  timestamp: string;
  hubspotPortalId: string;
}

export interface HotLeadsResult {
  id: string;
  timestamp: string;
  contactId: string;
  email: string;
  previousScore: number;
  newScore: number;
  statusUpdated: boolean;
  slackMessageSent: boolean;
  executionTimeMs: number;
  error?: string;
  skipped?: boolean;
  reason?: string;
}

/**
 * Retry helper con backoff exponencial
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(
        `Reintento Hot Leads ${attempt}/${maxRetries} en ${delay}ms`,
        {
          error: lastError.message,
          attempt,
          delay,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Actualizar lead_status en HubSpot
 */
async function updateHubSpotLeadStatus(
  hubspotClient: Client,
  contactId: string,
  email: string
): Promise<boolean> {
  try {
    logger.info('🔄 Actualizando lead_status en HubSpot', {
      contactId,
      email,
      newStatus: 'Hot Lead',
    });

    await retryWithBackoff(async () => {
      await hubspotClient.crm.contacts.basicApi.update(contactId, {
        properties: {
          lead_status: 'Hot Lead',
          last_hot_lead_detection: new Date().toISOString(),
          hot_lead_trigger_score: '40+',
        },
      });
    });

    logger.info('✅ Lead status actualizado en HubSpot', { contactId, email });
    return true;
  } catch (error) {
    logger.error('❌ Error actualizando HubSpot lead status', {
      error: error instanceof Error ? error.message : error,
      contactId,
      email,
    });
    return false;
  }
}

/**
 * Crear mensaje Block Kit para Slack
 */
function createHotLeadSlackMessage(
  triggerData: HotLeadTriggerData,
  statusUpdated: boolean
): (Block | KnownBlock)[] {
  const scoreChange = triggerData.previousScore
    ? `${triggerData.previousScore} → ${triggerData.leadInfluenceScore}`
    : `${triggerData.leadInfluenceScore}`;

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🚨 *Hot Lead Detectado*',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Usuario:*\n${triggerData.email}`,
        },
        {
          type: 'mrkdwn',
          text: `*Score:*\n${scoreChange}`,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\n${statusUpdated ? '✅ Actualizado' : '❌ Error'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Acción:*\nSeguimiento inmediato`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎯 *Recomendación:* Este lead ha alcanzado un score de ${triggerData.leadInfluenceScore}, indicando alto interés. Contactar inmediatamente para maximizar conversión.`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '👀 Ver en HubSpot',
          },
          url: `https://app.hubspot.com/contacts/portal/contact/${triggerData.contactId}/`,
          action_id: 'view_hubspot',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📞 Contactar Ahora',
          },
          action_id: 'contact_now',
          style: 'primary',
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⏰ Detectado: ${new Date(triggerData.timestamp).toLocaleString('es-MX')} | 🆔 Contact: ${triggerData.contactId}`,
        },
      ],
    },
  ];
}

/**
 * Enviar mensaje a Slack
 */
async function sendSlackHotLeadAlert(
  slackClient: WebClient,
  config: HotLeadsConfig,
  triggerData: HotLeadTriggerData,
  statusUpdated: boolean
): Promise<boolean> {
  try {
    logger.info('💬 Enviando alerta Hot Lead a Slack', {
      channel: config.slackChannel,
      email: triggerData.email,
      score: triggerData.leadInfluenceScore,
    });

    const blocks = createHotLeadSlackMessage(triggerData, statusUpdated);

    await retryWithBackoff(async () => {
      await slackClient.chat.postMessage({
        channel: config.slackChannel,
        text: `🚨 Hot Lead Detectado: ${triggerData.email} (Score: ${triggerData.leadInfluenceScore})`,
        blocks: blocks,
        unfurl_links: false,
        unfurl_media: false,
      });
    });

    logger.info('✅ Alerta Hot Lead enviada a Slack', {
      channel: config.slackChannel,
      email: triggerData.email,
    });

    return true;
  } catch (error) {
    logger.error('❌ Error enviando alerta a Slack', {
      error: error instanceof Error ? error.message : error,
      channel: config.slackChannel,
      email: triggerData.email,
    });
    return false;
  }
}

/**
 * 🎯 Handler principal de Hot Leads
 */
export async function hotLeadsHandler(
  config: HotLeadsConfig,
  triggerData: HotLeadTriggerData
): Promise<HotLeadsResult> {
  const startTime = Date.now();
  const executionId = `hot-lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.info('🚨 Iniciando procesamiento Hot Lead', {
    id: executionId,
    contactId: triggerData.contactId,
    email: triggerData.email,
    score: triggerData.leadInfluenceScore,
    previousScore: triggerData.previousScore,
  });

  // Inicializar clientes
  const hubspotClient = new Client({ accessToken: config.hubspotApiKey });
  const slackClient = new WebClient(config.slackBotToken);

  let statusUpdated = false;
  let slackMessageSent = false;

  try {
    // 1. Actualizar lead_status en HubSpot
    statusUpdated = await updateHubSpotLeadStatus(
      hubspotClient,
      triggerData.contactId,
      triggerData.email
    );

    // 2. Enviar alerta a Slack
    slackMessageSent = await sendSlackHotLeadAlert(
      slackClient,
      config,
      triggerData,
      statusUpdated
    );

    const result: HotLeadsResult = {
      id: executionId,
      timestamp: new Date().toISOString(),
      contactId: triggerData.contactId,
      email: triggerData.email,
      previousScore: triggerData.previousScore || 0,
      newScore: triggerData.leadInfluenceScore,
      statusUpdated,
      slackMessageSent,
      executionTimeMs: Date.now() - startTime,
    };

    logger.info('✅ Hot Lead procesado completamente', {
      id: executionId,
      email: triggerData.email,
      statusUpdated,
      slackMessageSent,
      executionTime: result.executionTimeMs,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    logger.error('❌ Error procesando Hot Lead', {
      id: executionId,
      error: errorMessage,
      contactId: triggerData.contactId,
      email: triggerData.email,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Error procesando Hot Lead: ${errorMessage}`);
  }
}
