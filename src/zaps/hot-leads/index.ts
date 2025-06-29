import { Bundle, ZObject } from 'zapier-platform-core';
import dotenv from 'dotenv';
import { hotLeadsHandler, HotLeadsConfig, HotLeadsResult } from './handler';
import { Logger } from '../../utils/Logger';

// Cargar variables de entorno
dotenv.config();

// Configurar logger específico
const logger = new Logger('hot-leads-index');

/**
 * 🚨 Hot Leads Detection - Zapier CLI Integration
 *
 * Automatización que detecta leads "calientes" cuando:
 * - lead_influence_score > 40 en HubSpot
 * - Actualiza lead_status = 'Hot Lead'
 * - Envía alerta inmediata a Slack #hot-leads
 *
 * Stack: TypeScript + Zapier CLI + HubSpot Webhooks + Slack API
 */

export interface HotLeadTriggerData {
  contactId: string;
  email: string;
  leadInfluenceScore: number;
  previousScore?: number;
  timestamp: string;
  hubspotPortalId: string;
}

/**
 * Configuración principal de Hot Leads
 */
const config: HotLeadsConfig = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY || '',
  slackBotToken: process.env.SLACK_BOT_TOKEN || '',
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET || '',
  slackChannel: '#hot-leads',
  hotLeadThreshold: parseInt(process.env.HOT_LEAD_THRESHOLD || '40'),
  isEnabled: process.env.HOT_LEADS_ENABLED === 'true',
};

/**
 * Validar configuración requerida
 */
function validateConfig(): boolean {
  const required = ['hubspotApiKey', 'slackBotToken', 'slackSigningSecret'];

  const missing = required.filter(
    (key) => !config[key as keyof HotLeadsConfig]
  );

  if (missing.length > 0) {
    logger.error('❌ Configuración faltante para Hot Leads', { missing });
    return false;
  }

  logger.info('✅ Configuración de Hot Leads validada', {
    channel: config.slackChannel,
    threshold: config.hotLeadThreshold,
    enabled: config.isEnabled,
  });

  return true;
}

/**
 * 🎯 Trigger principal de Hot Leads
 * Se ejecuta cuando HubSpot detecta lead_influence_score > threshold
 */
export const hotLeadsTrigger = async (
  z: ZObject,
  bundle: Bundle
): Promise<HotLeadsResult> => {
  const startTime = Date.now();

  try {
    logger.info('🚨 Hot Lead trigger activado', {
      contactId: bundle.inputData?.contactId,
      score: bundle.inputData?.leadInfluenceScore,
    });

    // Validar configuración
    if (!validateConfig()) {
      throw new Error('Configuración de Hot Leads inválida');
    }

    if (!config.isEnabled) {
      logger.warn('⚠️ Hot Leads está deshabilitado');
      return {
        id: `skip-${Date.now()}`,
        timestamp: new Date().toISOString(),
        contactId: String(bundle.inputData?.contactId || 'unknown'),
        email: String(bundle.inputData?.email || 'unknown'),
        previousScore: Number(bundle.inputData?.previousScore || 0),
        newScore: Number(bundle.inputData?.leadInfluenceScore || 0),
        statusUpdated: false,
        slackMessageSent: false,
        executionTimeMs: Date.now() - startTime,
        skipped: true,
        reason: 'Hot Leads deshabilitado',
      };
    }

    // Extraer datos del trigger
    const triggerData: HotLeadTriggerData = {
      contactId: String(bundle.inputData?.contactId || ''),
      email: String(bundle.inputData?.email || ''),
      leadInfluenceScore: parseFloat(
        String(bundle.inputData?.leadInfluenceScore || '0')
      ),
      previousScore: parseFloat(String(bundle.inputData?.previousScore || '0')),
      timestamp: String(
        bundle.inputData?.timestamp || new Date().toISOString()
      ),
      hubspotPortalId: String(bundle.inputData?.hubspotPortalId || ''),
    };

    // Validar que el score supera el threshold
    if (triggerData.leadInfluenceScore <= config.hotLeadThreshold) {
      logger.info('ℹ️ Score no supera el threshold', {
        score: triggerData.leadInfluenceScore,
        threshold: config.hotLeadThreshold,
      });

      return {
        id: `below-threshold-${Date.now()}`,
        timestamp: new Date().toISOString(),
        contactId: triggerData.contactId,
        email: triggerData.email,
        previousScore: triggerData.previousScore || 0,
        newScore: triggerData.leadInfluenceScore,
        statusUpdated: false,
        slackMessageSent: false,
        executionTimeMs: Date.now() - startTime,
        skipped: true,
        reason: `Score ${triggerData.leadInfluenceScore} no supera threshold ${config.hotLeadThreshold}`,
      };
    }

    // Ejecutar handler principal
    const result = await hotLeadsHandler(config, triggerData);

    logger.info('✅ Hot Lead procesado exitosamente', {
      contactId: result.contactId,
      email: result.email,
      scoreChange: `${result.previousScore} → ${result.newScore}`,
      statusUpdated: result.statusUpdated,
      slackSent: result.slackMessageSent,
      executionTime: result.executionTimeMs,
    });

    return result;
  } catch (error) {
    logger.error('❌ Error procesando Hot Lead', {
      error: error instanceof Error ? error.message : error,
      contactId: bundle.inputData?.contactId,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};

/**
 * Configuración del Zap para Zapier Platform
 */
export const hotLeadsZap = {
  key: 'hot_leads_detection',
  noun: 'Hot Lead',
  display: {
    label: 'Hot Leads Detection',
    description:
      'Detecta leads calientes cuando lead_influence_score > 40 y envía alertas',
  },
  operation: {
    type: 'hook',
    perform: hotLeadsTrigger,
    performSubscribe: (z: ZObject, bundle: Bundle) => {
      // Configurar webhook en HubSpot para property updates
      return z.request({
        url: 'https://api.hubapi.com/webhooks/v3/subscriptions',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          eventType: 'contact.propertyChange',
          propertyName: 'lead_influence_score',
          webhookUrl: bundle.targetUrl,
        },
      });
    },
    performUnsubscribe: (z: ZObject, bundle: Bundle) => {
      // Remover webhook de HubSpot
      return z.request({
        url: `https://api.hubapi.com/webhooks/v3/subscriptions/${bundle.subscribeData?.id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${config.hubspotApiKey}`,
        },
      });
    },
    sample: {
      id: 'sample-hot-lead-123',
      timestamp: '2025-06-29T20:46:15.123Z',
      contactId: '12345',
      email: 'juan.perez@example.com',
      previousScore: 35,
      newScore: 45,
      statusUpdated: true,
      slackMessageSent: true,
      executionTimeMs: 1250,
    },
  },
};

/**
 * Inicializar Hot Leads
 */
export function initHotLeads(): void {
  if (!validateConfig()) {
    logger.error(
      '❌ No se puede inicializar Hot Leads: configuración inválida'
    );
    return;
  }

  logger.info('🚨 Hot Leads Detection inicializado', {
    threshold: config.hotLeadThreshold,
    channel: config.slackChannel,
    enabled: config.isEnabled,
  });
}

// Auto-inicialización en desarrollo
if (process.env.NODE_ENV !== 'test') {
  initHotLeads();
}
