import { Bundle, ZObject } from 'zapier-platform-core';
import dotenv from 'dotenv';
import {
  RecompensasEscasezConfig,
  RecompensasEscasezResult,
} from './handler.types';
import { recompensasEscasezHandler } from './handler';
import { Logger } from '../../utils/Logger';

// Cargar variables de entorno
dotenv.config();

// Configurar logger específico
const logger = new Logger('recompensas-escasez-index');

/**
 * 🎁 Recompensas por Escasez - Zapier CLI Integration
 *
 * Automatización que detecta productos con stock bajo y activa recompensas:
 * - Trigger: Google Sheets → New/Updated Row con stock_remaining ≤ 20
 * - Actualiza recompensa_emocional = 'Oferta especial' en HubSpot
 * - Envía alerta a Slack #scoring-leads para envío de cupón
 *
 * Stack: TypeScript + Zapier CLI + Google Sheets + HubSpot + Slack
 */

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

/**
 * Configuración principal de Recompensas por Escasez
 */
const config: RecompensasEscasezConfig = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY || '',
  slackBotToken: process.env.SLACK_BOT_TOKEN || '',
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET || '',
  googleSheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY || '',
  googleSheetsId: process.env.GOOGLE_SHEETS_ID || '',
  slackChannel: '#scoring-leads',
  stockThreshold: parseInt(process.env.STOCK_THRESHOLD || '20'),
  isEnabled: process.env.RECOMPENSAS_ESCASEZ_ENABLED === 'true',
};

/**
 * Validar configuración requerida
 */
function validateConfig(): boolean {
  const required = [
    'hubspotApiKey',
    'slackBotToken',
    'slackSigningSecret',
    'googleSheetsApiKey',
    'googleSheetsId',
  ];

  const missing = required.filter(
    (key) => !config[key as keyof RecompensasEscasezConfig]
  );

  if (missing.length > 0) {
    logger.error('❌ Configuración faltante para Recompensas por Escasez', {
      missing,
    });
    return false;
  }

  logger.info('✅ Configuración de Recompensas por Escasez validada', {
    channel: config.slackChannel,
    threshold: config.stockThreshold,
    enabled: config.isEnabled,
  });

  return true;
}

/**
 * Determinar nivel de urgencia basado en stock
 */
function determineUrgencyLevel(
  stockRemaining: number
): 'medium' | 'high' | 'critical' {
  if (stockRemaining <= 5) return 'critical';
  if (stockRemaining <= 10) return 'high';
  return 'medium';
}

/**
 * 🎯 Trigger principal de Recompensas por Escasez
 * Se ejecuta cuando Google Sheets detecta stock_remaining ≤ threshold
 */
export const recompensasEscasezTrigger = async (
  z: ZObject,
  bundle: Bundle
): Promise<RecompensasEscasezResult> => {
  const startTime = Date.now();

  try {
    logger.info('🎁 Recompensas por Escasez trigger activado', {
      productId: bundle.inputData?.productId,
      stockRemaining: bundle.inputData?.stockRemaining,
    });

    // Validar configuración
    if (!validateConfig()) {
      throw new Error('Configuración de Recompensas por Escasez inválida');
    }

    if (!config.isEnabled) {
      logger.warn('⚠️ Recompensas por Escasez está deshabilitado');
      return {
        id: `skip-${Date.now()}`,
        timestamp: new Date().toISOString(),
        productId: String(bundle.inputData?.productId || 'unknown'),
        productName: String(bundle.inputData?.productName || 'unknown'),
        stockRemaining: parseInt(
          String(bundle.inputData?.stockRemaining || '0')
        ),
        previousStock: parseInt(String(bundle.inputData?.previousStock || '0')),
        urgencyLevel: 'medium',
        hubspotUpdated: false,
        slackMessageSent: false,
        executionTimeMs: Date.now() - startTime,
        skipped: true,
        reason: 'Recompensas por Escasez deshabilitado',
      };
    }

    // Extraer datos del trigger
    const stockRemaining = parseInt(
      String(bundle.inputData?.stockRemaining || '0')
    );
    const urgencyLevel = determineUrgencyLevel(stockRemaining);

    const triggerData: EscasezTriggerData = {
      productId: String(bundle.inputData?.productId || ''),
      productName: String(bundle.inputData?.productName || ''),
      stockRemaining,
      previousStock: parseInt(String(bundle.inputData?.previousStock || '0')),
      email: String(bundle.inputData?.email || ''),
      contactId: String(bundle.inputData?.contactId || ''),
      sheetRowId: String(bundle.inputData?.sheetRowId || ''),
      timestamp: String(
        bundle.inputData?.timestamp || new Date().toISOString()
      ),
      urgencyLevel,
    };

    // Validar que el stock está por debajo del threshold
    if (triggerData.stockRemaining > config.stockThreshold) {
      logger.info('ℹ️ Stock no está por debajo del threshold', {
        stock: triggerData.stockRemaining,
        threshold: config.stockThreshold,
      });

      return {
        id: `above-threshold-${Date.now()}`,
        timestamp: new Date().toISOString(),
        productId: triggerData.productId,
        productName: triggerData.productName,
        stockRemaining: triggerData.stockRemaining,
        previousStock: triggerData.previousStock || 0,
        urgencyLevel: triggerData.urgencyLevel,
        hubspotUpdated: false,
        slackMessageSent: false,
        executionTimeMs: Date.now() - startTime,
        skipped: true,
        reason: `Stock ${triggerData.stockRemaining} no está por debajo del threshold ${config.stockThreshold}`,
      };
    }

    // Ejecutar handler principal
    const result = await recompensasEscasezHandler(config, triggerData);

    logger.info('✅ Recompensa por Escasez procesada exitosamente', {
      productName: result.productName,
      stockRemaining: result.stockRemaining,
      urgencyLevel: result.urgencyLevel,
      hubspotUpdated: result.hubspotUpdated,
      slackSent: result.slackMessageSent,
      executionTime: result.executionTimeMs,
    });

    return result;
  } catch (error) {
    logger.error('❌ Error procesando Recompensa por Escasez', {
      error: error instanceof Error ? error.message : error,
      productId: bundle.inputData?.productId,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
};

/**
 * Configuración del Zap para Zapier Platform
 */
export const recompensasEscasezZap = {
  key: 'recompensas_escasez',
  noun: 'Stock Alert',
  display: {
    label: 'Recompensas por Escasez',
    description:
      'Detecta stock bajo y activa recompensas emocionales automáticamente',
  },
  operation: {
    type: 'hook',
    perform: recompensasEscasezTrigger,
    performSubscribe: (z: ZObject, bundle: Bundle) => {
      // Configurar webhook para Google Sheets
      // En un caso real, esto se configuraría con Google Sheets API
      return z.request({
        url: 'https://sheets.googleapis.com/v4/spreadsheets/webhook',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.googleSheetsApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          spreadsheetId: config.googleSheetsId,
          range: 'Stock!A:Z',
          webhookUrl: bundle.targetUrl,
          eventType: 'SHEET_CHANGED',
        },
      });
    },
    performUnsubscribe: (z: ZObject, bundle: Bundle) => {
      // Remover webhook de Google Sheets
      return z.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/webhook/${bundle.subscribeData?.id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${config.googleSheetsApiKey}`,
        },
      });
    },
    sample: {
      id: 'sample-escasez-123',
      timestamp: '2025-06-29T20:46:15.123Z',
      productId: 'PROD-001',
      productName: 'Jersey Kopp Stadium Edición Limitada',
      stockRemaining: 15,
      previousStock: 25,
      urgencyLevel: 'high',
      hubspotUpdated: true,
      slackMessageSent: true,
      executionTimeMs: 1850,
    },
  },
};

/**
 * Inicializar Recompensas por Escasez
 */
export function initRecompensasEscasez(): void {
  if (!validateConfig()) {
    logger.error(
      '❌ No se puede inicializar Recompensas por Escasez: configuración inválida'
    );
    return;
  }

  logger.info('🎁 Recompensas por Escasez inicializado', {
    threshold: config.stockThreshold,
    channel: config.slackChannel,
    enabled: config.isEnabled,
  });
}

// Auto-inicialización en desarrollo
if (process.env.NODE_ENV !== 'test') {
  initRecompensasEscasez();
}
