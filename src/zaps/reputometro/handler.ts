import { Client } from '@hubspot/api-client';
import { WebClient, Block, KnownBlock } from '@slack/web-api';
import { Logger } from '../../utils/Logger';

// Configurar logger específico para Reputómetro
const logger = new Logger('reputometro');

/**
 * 🎯 Handler principal del Reputómetro Invisible
 *
 * Funcionalidades:
 * 1. Consulta HubSpot por leads activos (última hora)
 * 2. Calcula lead_influence_score = views * 0.5 + submissions * 2
 * 3. Actualiza propiedades en HubSpot
 * 4. Envía reporte Block Kit a Slack
 */

export interface ReputometroConfig {
  hubspotApiKey: string;
  slackBotToken: string;
  slackSigningSecret: string;
  slackChannel: string;
  isEnabled: boolean;
}

export interface LeadData {
  id: string;
  email: string;
  views: number;
  submissions: number;
  lastSubmissionDate: string;
  currentScore?: number;
}

export interface CalculatedLead extends LeadData {
  leadInfluenceScore: number;
  scoreChange: number;
}

export interface ReputometroResult {
  id: string;
  timestamp: string;
  totalLeads: number;
  avgScore: number;
  topLeads: Array<{
    email: string;
    score: number;
  }>;
  slackMessageSent: boolean;
  hubspotUpdates: number;
  executionTimeMs: number;
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
      logger.warn(`Reintento ${attempt}/${maxRetries} en ${delay}ms`, {
        error: lastError.message,
        attempt,
        delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Obtener leads activos de HubSpot (última hora)
 */
async function getActiveLeads(hubspotClient: Client): Promise<LeadData[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    logger.info('🔍 Consultando HubSpot por leads activos', {
      since: oneHourAgo,
      component: 'hubspot-query',
    });

    const response = await retryWithBackoff(async () => {
      return await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'last_submission_date',
                operator: 'GTE' as any, // HubSpot API type issue
                value: oneHourAgo,
              },
            ],
          },
        ],
        properties: [
          'email',
          'page_views',
          'form_submissions',
          'last_submission_date',
          'lead_influence_score',
        ],
        limit: 100,
      });
    });

    const leads: LeadData[] = response.results.map((contact) => ({
      id: contact.id,
      email: contact.properties.email || '',
      views: parseInt(contact.properties.page_views || '0', 10),
      submissions: parseInt(contact.properties.form_submissions || '0', 10),
      lastSubmissionDate: contact.properties.last_submission_date || '',
      currentScore: parseFloat(contact.properties.lead_influence_score || '0'),
    }));

    logger.info(`✅ Encontrados ${leads.length} leads activos`, {
      count: leads.length,
      component: 'hubspot-query',
    });

    return leads;
  } catch (error) {
    logger.error('❌ Error consultando HubSpot', {
      error: error instanceof Error ? error.message : String(error),
      component: 'hubspot-query',
    });
    throw error;
  }
}

/**
 * Calcular lead influence score
 * Formula: views * 0.5 + submissions * 2
 */
function calculateLeadScores(leads: LeadData[]): CalculatedLead[] {
  return leads.map((lead) => {
    const leadInfluenceScore = lead.views * 0.5 + lead.submissions * 2;
    const scoreChange = leadInfluenceScore - (lead.currentScore || 0);

    logger.debug('📊 Score calculado para lead', {
      email: lead.email,
      views: lead.views,
      submissions: lead.submissions,
      previousScore: lead.currentScore,
      newScore: leadInfluenceScore,
      change: scoreChange,
    });

    return {
      ...lead,
      leadInfluenceScore: Math.round(leadInfluenceScore * 100) / 100, // Redondear a 2 decimales
      scoreChange: Math.round(scoreChange * 100) / 100,
    };
  });
}

/**
 * Actualizar scores en HubSpot
 */
async function updateHubSpotScores(
  hubspotClient: Client,
  calculatedLeads: CalculatedLead[]
): Promise<number> {
  let updatedCount = 0;

  logger.info('🔄 Actualizando scores en HubSpot', {
    totalLeads: calculatedLeads.length,
    component: 'hubspot-update',
  });

  for (const lead of calculatedLeads) {
    if (Math.abs(lead.scoreChange) < 0.1) {
      // Skip if change is minimal
      continue;
    }

    try {
      await retryWithBackoff(async () => {
        await hubspotClient.crm.contacts.basicApi.update(lead.id, {
          properties: {
            lead_influence_score: lead.leadInfluenceScore.toString(),
            last_score_update: new Date().toISOString(),
          },
        });
      });

      updatedCount++;

      logger.debug('✅ Score actualizado', {
        contactId: lead.id,
        email: lead.email,
        newScore: lead.leadInfluenceScore,
        change: lead.scoreChange,
      });
    } catch (error) {
      logger.error('❌ Error actualizando score', {
        contactId: lead.id,
        email: lead.email,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info(`✅ Actualizados ${updatedCount} scores en HubSpot`, {
    updated: updatedCount,
    total: calculatedLeads.length,
    component: 'hubspot-update',
  });

  return updatedCount;
}

/**
 * Crear mensaje Block Kit para Slack
 */
function createSlackBlocks(
  totalLeads: number,
  avgScore: number,
  topLeads: CalculatedLead[]
): (Block | KnownBlock)[] {
  const topThree = topLeads.slice(0, 3);
  const topEmails = topThree
    .map((lead) => `• ${lead.email} (${lead.leadInfluenceScore})`)
    .join('\n');

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⚡ Reputómetro Invisible',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Total:*\n${totalLeads} leads`,
        },
        {
          type: 'mrkdwn',
          text: `*Score medio:*\n${avgScore}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Top 3:*\n${topEmails || 'Sin leads en esta ejecución'}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📊 Actualizado: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })} | 🤖 Kopp Stadium CRM`,
        },
      ],
    },
  ];
}

/**
 * Enviar reporte a Slack
 */
async function sendSlackReport(
  slackClient: WebClient,
  channel: string,
  totalLeads: number,
  avgScore: number,
  topLeads: CalculatedLead[]
): Promise<boolean> {
  try {
    logger.info('📱 Enviando reporte a Slack', {
      channel,
      totalLeads,
      avgScore,
      component: 'slack-report',
    });

    const blocks = createSlackBlocks(totalLeads, avgScore, topLeads);

    await retryWithBackoff(async () => {
      await slackClient.chat.postMessage({
        channel,
        blocks,
        text: `⚡ Reputómetro Invisible - ${totalLeads} leads procesados`,
      });
    });

    logger.info('✅ Reporte enviado a Slack exitosamente', {
      channel,
      component: 'slack-report',
    });

    return true;
  } catch (error) {
    logger.error('❌ Error enviando reporte a Slack', {
      channel,
      error: error instanceof Error ? error.message : String(error),
      component: 'slack-report',
    });
    return false;
  }
}

/**
 * Handler principal del Reputómetro
 */
export async function reputometroHandler(
  config: ReputometroConfig
): Promise<ReputometroResult> {
  const startTime = Date.now();
  const executionId = `reputometro_${Date.now()}`;

  logger.info('🎯 Iniciando Reputómetro Handler', {
    executionId,
    timestamp: new Date().toISOString(),
    component: 'main-handler',
  });

  try {
    // Inicializar clientes
    const hubspotClient = new Client({ accessToken: config.hubspotApiKey });
    const slackClient = new WebClient(config.slackBotToken);

    // 1. Obtener leads activos
    const activeLeads = await getActiveLeads(hubspotClient);

    if (activeLeads.length === 0) {
      logger.info('ℹ️ No hay leads activos en la última hora', {
        executionId,
        component: 'main-handler',
      });

      // Enviar reporte vacío a Slack
      await sendSlackReport(slackClient, config.slackChannel, 0, 0, []);

      return {
        id: executionId,
        timestamp: new Date().toISOString(),
        totalLeads: 0,
        avgScore: 0,
        topLeads: [],
        slackMessageSent: true,
        hubspotUpdates: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // 2. Calcular scores
    const calculatedLeads = calculateLeadScores(activeLeads);

    // 3. Actualizar HubSpot
    const hubspotUpdates = await updateHubSpotScores(
      hubspotClient,
      calculatedLeads
    );

    // 4. Preparar estadísticas
    const scores = calculatedLeads.map((lead) => lead.leadInfluenceScore);
    const avgScore =
      Math.round(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100
      ) / 100;
    const topLeads = calculatedLeads
      .sort((a, b) => b.leadInfluenceScore - a.leadInfluenceScore)
      .slice(0, 3);

    // 5. Enviar reporte a Slack
    const slackMessageSent = await sendSlackReport(
      slackClient,
      config.slackChannel,
      calculatedLeads.length,
      avgScore,
      topLeads
    );

    const result: ReputometroResult = {
      id: executionId,
      timestamp: new Date().toISOString(),
      totalLeads: calculatedLeads.length,
      avgScore,
      topLeads: topLeads.map((lead) => ({
        email: lead.email,
        score: lead.leadInfluenceScore,
      })),
      slackMessageSent,
      hubspotUpdates,
      executionTimeMs: Date.now() - startTime,
    };

    logger.info('🎉 Reputómetro Handler completado exitosamente', {
      ...result,
      component: 'main-handler',
    });

    return result;
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;

    logger.error('❌ Error en Reputómetro Handler', {
      executionId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      executionTimeMs,
      component: 'main-handler',
    });

    throw error;
  }
}
