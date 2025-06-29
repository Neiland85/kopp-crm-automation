import { Client } from '@hubspot/api-client';
import { WebClient, Block, KnownBlock } from '@slack/web-api';
import { Logger } from '../../utils/Logger';

// Configurar logger específico para Recompensas por Escasez
const logger = new Logger('recompensas-escasez');

/**
 * 🎁 Handler principal de Recompensas por Escasez
 *
 * Funcionalidades:
 * 1. Detecta productos con stock bajo en Google Sheets
 * 2. Actualiza recompensa_emocional = 'Oferta especial' en HubSpot
 * 3. Envía alerta a Slack #scoring-leads para envío de cupón
 * 4. Maneja diferentes niveles de urgencia según stock restante
 */

export interface RecompensasEscasezConfig {
  hubspotApiKey: string;
  slackBotToken: string;
  slackSigningSecret: string;
  googleSheetsApiKey: string;
  googleSheetsId: string;
  slackChannel: string;
  stockThreshold: number;
  isEnabled: boolean;
}

export interface EscasezTriggerData {
  productId: string;
  productName: string;
  stockRemaining: number;
  previousStock?: number;
  email?: string;
  contactId?: string;
  sheetRowId: string;
  timestamp: string;
  urgencyLevel: 'medium' | 'high' | 'critical';
}

export interface RecompensasEscasezResult {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  stockRemaining: number;
  previousStock: number;
  urgencyLevel: 'medium' | 'high' | 'critical';
  hubspotUpdated: boolean;
  slackMessageSent: boolean;
  executionTimeMs: number;
  error?: string;
  skipped?: boolean;
  reason?: string;
  contactsUpdated?: number;
  couponCode?: string;
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
        `Reintento Recompensas Escasez ${attempt}/${maxRetries} en ${delay}ms`,
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
 * Generar código de cupón único
 */
function generateCouponCode(productId: string, urgencyLevel: string): string {
  const prefix = urgencyLevel === 'critical' ? 'URGENT' : 'SPECIAL';
  const timestamp = Date.now().toString().slice(-6);
  const productCode = productId
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4);
  return `${prefix}${productCode}${timestamp}`;
}

/**
 * Obtener descuento basado en urgencia
 */
function getDiscountByUrgency(urgencyLevel: string): {
  percentage: number;
  description: string;
} {
  switch (urgencyLevel) {
    case 'critical':
      return { percentage: 25, description: '¡ÚLTIMAS UNIDADES! 25% OFF' };
    case 'high':
      return { percentage: 20, description: 'STOCK LIMITADO - 20% OFF' };
    case 'medium':
    default:
      return { percentage: 15, description: 'OFERTA ESPECIAL - 15% OFF' };
  }
}

/**
 * Actualizar recompensa_emocional en HubSpot
 */
async function updateHubSpotEmotionalReward(
  hubspotClient: Client,
  triggerData: EscasezTriggerData,
  couponCode: string
): Promise<number> {
  try {
    logger.info('🔄 Actualizando recompensa_emocional en HubSpot', {
      productId: triggerData.productId,
      stockRemaining: triggerData.stockRemaining,
      couponCode,
    });

    // Si tenemos contactId específico, actualizar solo ese contacto
    if (triggerData.contactId) {
      await retryWithBackoff(async () => {
        await hubspotClient.crm.contacts.basicApi.update(
          triggerData.contactId!,
          {
            properties: {
              recompensa_emocional: 'Oferta especial',
              last_stock_alert: new Date().toISOString(),
              stock_alert_product: triggerData.productName,
              coupon_code: couponCode,
              stock_urgency_level: triggerData.urgencyLevel,
            },
          }
        );
      });

      logger.info('✅ Contacto específico actualizado en HubSpot', {
        contactId: triggerData.contactId,
      });
      return 1;
    }

    // Si no hay contactId específico, buscar contactos relacionados con el producto
    // Esto podría ser basado en interacciones previas, wishlist, etc.
    const searchResponse = await retryWithBackoff(async () => {
      return await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'last_page_seen',
                operator: 'CONTAINS_TOKEN' as any,
                value: triggerData.productId,
              },
            ],
          },
        ],
        limit: 100,
      });
    });

    let contactsUpdated = 0;

    if (searchResponse.results && searchResponse.results.length > 0) {
      for (const contact of searchResponse.results) {
        try {
          await retryWithBackoff(async () => {
            await hubspotClient.crm.contacts.basicApi.update(contact.id, {
              properties: {
                recompensa_emocional: 'Oferta especial',
                last_stock_alert: new Date().toISOString(),
                stock_alert_product: triggerData.productName,
                coupon_code: couponCode,
                stock_urgency_level: triggerData.urgencyLevel,
              },
            });
          });
          contactsUpdated++;
        } catch (error) {
          logger.warn('⚠️ Error actualizando contacto individual', {
            contactId: contact.id,
            error: error instanceof Error ? error.message : error,
          });
        }
      }
    }

    logger.info('✅ Recompensas emocionales actualizadas en HubSpot', {
      contactsUpdated,
      couponCode,
    });

    return contactsUpdated;
  } catch (error) {
    logger.error('❌ Error actualizando recompensas emocionales en HubSpot', {
      error: error instanceof Error ? error.message : error,
      productId: triggerData.productId,
    });
    return 0;
  }
}

/**
 * Crear mensaje Block Kit para Slack
 */
function createEscasezSlackMessage(
  triggerData: EscasezTriggerData,
  couponCode: string,
  contactsUpdated: number
): (Block | KnownBlock)[] {
  const discount = getDiscountByUrgency(triggerData.urgencyLevel);
  const urgencyEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '💡',
  }[triggerData.urgencyLevel];

  const urgencyColor = {
    critical: '#ff0000',
    high: '#ff6600',
    medium: '#ffcc00',
  }[triggerData.urgencyLevel];

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎁 *Recompensa Emocional* ${urgencyEmoji}`,
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
          text: `*Producto:*\n${triggerData.productName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Stock restante:*\n${triggerData.stockRemaining} unidades`,
        },
        {
          type: 'mrkdwn',
          text: `*Nivel de urgencia:*\n${triggerData.urgencyLevel.toUpperCase()}`,
        },
        {
          type: 'mrkdwn',
          text: `*Contactos actualizados:*\n${contactsUpdated}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `💎 *${discount.description}*\n\`Código: ${couponCode}\``,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Copiar Código',
        },
        action_id: 'copy_coupon',
        style: urgencyColor === '#ff0000' ? 'danger' : 'primary',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎯 *Acción recomendada:* ${
          triggerData.urgencyLevel === 'critical'
            ? 'Envío de cupón URGENTE - Stock crítico'
            : 'Enviar cupón promocional para incentivar compra'
        }`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📧 Enviar Cupones',
          },
          action_id: 'send_coupons',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📊 Ver Stock Sheet',
          },
          url: `https://docs.google.com/spreadsheets/d/${triggerData.sheetRowId}`,
          action_id: 'view_sheet',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📈 Analizar Tendencia',
          },
          action_id: 'analyze_trend',
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⏰ ${new Date(triggerData.timestamp).toLocaleString('es-MX')} | 🏷️ ${triggerData.productId} | 📉 Stock: ${triggerData.previousStock || 'N/A'} → ${triggerData.stockRemaining}`,
        },
      ],
    },
  ];
}

/**
 * Enviar mensaje a Slack
 */
async function sendSlackEscasezAlert(
  slackClient: WebClient,
  config: RecompensasEscasezConfig,
  triggerData: EscasezTriggerData,
  couponCode: string,
  contactsUpdated: number
): Promise<boolean> {
  try {
    logger.info('💬 Enviando alerta de escasez a Slack', {
      channel: config.slackChannel,
      productName: triggerData.productName,
      stockRemaining: triggerData.stockRemaining,
      urgencyLevel: triggerData.urgencyLevel,
    });

    const blocks = createEscasezSlackMessage(
      triggerData,
      couponCode,
      contactsUpdated
    );

    await retryWithBackoff(async () => {
      await slackClient.chat.postMessage({
        channel: config.slackChannel,
        text: `🎁 Recompensa Emocional: ${triggerData.productName} (Stock: ${triggerData.stockRemaining})`,
        blocks: blocks,
        unfurl_links: false,
        unfurl_media: false,
      });
    });

    logger.info('✅ Alerta de escasez enviada a Slack', {
      channel: config.slackChannel,
      productName: triggerData.productName,
      couponCode,
    });

    return true;
  } catch (error) {
    logger.error('❌ Error enviando alerta de escasez a Slack', {
      error: error instanceof Error ? error.message : error,
      channel: config.slackChannel,
      productName: triggerData.productName,
    });
    return false;
  }
}

/**
 * 🎯 Handler principal de Recompensas por Escasez
 */
export async function recompensasEscasezHandler(
  config: RecompensasEscasezConfig,
  triggerData: EscasezTriggerData
): Promise<RecompensasEscasezResult> {
  const startTime = Date.now();
  const executionId = `escasez-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.info('🎁 Iniciando procesamiento Recompensas por Escasez', {
    id: executionId,
    productId: triggerData.productId,
    productName: triggerData.productName,
    stockRemaining: triggerData.stockRemaining,
    urgencyLevel: triggerData.urgencyLevel,
  });

  // Inicializar clientes
  const hubspotClient = new Client({ accessToken: config.hubspotApiKey });
  const slackClient = new WebClient(config.slackBotToken);

  // Generar código de cupón
  const couponCode = generateCouponCode(
    triggerData.productId,
    triggerData.urgencyLevel
  );

  let hubspotUpdated = false;
  let slackMessageSent = false;
  let contactsUpdated = 0;

  try {
    // 1. Actualizar recompensa_emocional en HubSpot
    contactsUpdated = await updateHubSpotEmotionalReward(
      hubspotClient,
      triggerData,
      couponCode
    );
    hubspotUpdated = contactsUpdated > 0;

    // 2. Enviar alerta a Slack
    slackMessageSent = await sendSlackEscasezAlert(
      slackClient,
      config,
      triggerData,
      couponCode,
      contactsUpdated
    );

    const result: RecompensasEscasezResult = {
      id: executionId,
      timestamp: new Date().toISOString(),
      productId: triggerData.productId,
      productName: triggerData.productName,
      stockRemaining: triggerData.stockRemaining,
      previousStock: triggerData.previousStock || 0,
      urgencyLevel: triggerData.urgencyLevel,
      hubspotUpdated,
      slackMessageSent,
      executionTimeMs: Date.now() - startTime,
      contactsUpdated,
      couponCode,
    };

    logger.info('✅ Recompensa por Escasez procesada completamente', {
      id: executionId,
      productName: triggerData.productName,
      contactsUpdated,
      couponCode,
      hubspotUpdated,
      slackMessageSent,
      executionTime: result.executionTimeMs,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    logger.error('❌ Error procesando Recompensa por Escasez', {
      id: executionId,
      error: errorMessage,
      productId: triggerData.productId,
      productName: triggerData.productName,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Error procesando Recompensa por Escasez: ${errorMessage}`);
  }
}
