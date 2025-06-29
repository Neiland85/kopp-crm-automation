import * as cron from 'node-cron';
import dotenv from 'dotenv';
import { reputometroHandler, ReputometroConfig } from './handler';
import { Logger } from '../../utils/Logger';

// Cargar variables de entorno
dotenv.config();

// Configurar logger específico
const logger = new Logger('reputometro-index');

/**
 * 🎯 Reputómetro Invisible - Zapier CLI Integration
 *
 * Automatización avanzada que ejecuta cada 5 minutos para:
 * 1. Consultar HubSpot por leads activos (última hora)
 * 2. Calcular lead_influence_score basado en actividad
 * 3. Actualizar propiedades en HubSpot
 * 4. Enviar reporte automático a Slack
 *
 * Stack: TypeScript + Zapier CLI + HubSpot API + Slack API + Node-Cron
 */

// Configuración del cron job
const CRON_SCHEDULE = '*/5 * * * *'; // Cada 5 minutos
const TIMEZONE = 'America/Mexico_City'; // Timezone Kopp Stadium

/**
 * Configuración principal del Reputómetro
 */
const config: ReputometroConfig = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY || '',
  slackBotToken: process.env.SLACK_BOT_TOKEN || '',
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET || '',
  slackChannel: '#scoring-leads',
  isEnabled: process.env.REPUTOMETRO_ENABLED === 'true',
};

/**
 * Validar configuración requerida
 */
function validateConfig(): boolean {
  const required = ['hubspotApiKey', 'slackBotToken', 'slackSigningSecret'];
  const missing = required.filter(
    (key) => !config[key as keyof ReputometroConfig]
  );

  if (missing.length > 0) {
    logger.error('Reputómetro: Configuración incompleta', {
      missing,
      component: 'reputometro-config',
    });
    return false;
  }

  return true;
}

/**
 * Función principal del trigger de Zapier
 */
export const reputometroTrigger = async () => {
  try {
    logger.info('🎯 Iniciando Reputómetro Invisible', {
      timestamp: new Date().toISOString(),
      component: 'reputometro-trigger',
    });

    // Validar configuración
    if (!validateConfig()) {
      throw new Error('Configuración del Reputómetro incompleta');
    }

    // Ejecutar handler principal
    const result = await reputometroHandler(config);

    logger.info('✅ Reputómetro ejecutado exitosamente', {
      result,
      component: 'reputometro-trigger',
    });

    return [result];
  } catch (error) {
    logger.error('❌ Error en Reputómetro', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      component: 'reputometro-trigger',
    });

    throw error;
  }
};

/**
 * Configuración del cron job para ejecución automática
 */
export function initializeReputometroCron(): void {
  if (!config.isEnabled) {
    logger.info('⏸️ Reputómetro deshabilitado', {
      component: 'reputometro-cron',
    });
    return;
  }

  if (!validateConfig()) {
    logger.error(
      '❌ No se puede inicializar Reputómetro: configuración inválida',
      {
        component: 'reputometro-cron',
      }
    );
    return;
  }

  logger.info('🚀 Iniciando Reputómetro Cron Job', {
    schedule: CRON_SCHEDULE,
    timezone: TIMEZONE,
    channel: config.slackChannel,
    component: 'reputometro-cron',
  });

  // Programar ejecución cada 5 minutos
  cron.schedule(
    CRON_SCHEDULE,
    async () => {
      try {
        logger.info('⏰ Ejecutando Reputómetro programado', {
          timestamp: new Date().toISOString(),
          component: 'reputometro-cron',
        });

        const result = await reputometroHandler(config);

        logger.info('✅ Reputómetro programado completado', {
          result,
          component: 'reputometro-cron',
        });
      } catch (error) {
        logger.error('❌ Error en Reputómetro programado', {
          error: error instanceof Error ? error.message : String(error),
          component: 'reputometro-cron',
        });
      }
    },
    {
      timezone: TIMEZONE,
    }
  );

  logger.info('📅 Cron job del Reputómetro iniciado exitosamente', {
    component: 'reputometro-cron',
  });
}

/**
 * Definición del Zap para Zapier Platform
 */
export const reputometroZap = {
  key: 'reputometro_invisible',
  noun: 'Reputómetro',
  display: {
    label: '🎯 Reputómetro Invisible',
    description:
      'Automatización de lead scoring cada 5 minutos con reporting a Slack',
    important: true,
  },
  operation: {
    type: 'polling',
    perform: reputometroTrigger,
    sample: {
      id: 'reputometro_' + Date.now(),
      timestamp: new Date().toISOString(),
      total_leads: 25,
      avg_score: 7.2,
      top_leads: [
        { email: 'ejemplo@empresa.com', score: 9.5 },
        { email: 'lead@startup.com', score: 8.7 },
        { email: 'contact@acme.com', score: 8.2 },
      ],
      slack_message_sent: true,
    },
  },
};

/**
 * Función de utilidad para testing manual
 */
export async function runReputometroManual(): Promise<void> {
  logger.info('🧪 Ejecutando Reputómetro en modo manual', {
    component: 'reputometro-manual',
  });

  try {
    if (!validateConfig()) {
      throw new Error('Configuración inválida para ejecución manual');
    }

    const result = await reputometroHandler(config);

    console.log('🎉 Reputómetro manual completado:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error en ejecución manual:', error);
    throw error;
  }
}

// Exportar configuración para tests
export { config, validateConfig };

// Inicializar automáticamente si no estamos en modo test
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
  initializeReputometroCron();
}
