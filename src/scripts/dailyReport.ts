/**
 * 📊 Daily Report - Reporte Diario de Lead Scoring
 *
 * Script que ejecuta cada día a las 08:00 CET para generar
 * un reporte de los top 10 leads por lead_influence_score
 */

import * as cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Logger } from '../utils/Logger';

const logger = new Logger('daily-report');

interface LeadScoreRecord {
  email: string;
  lead_influence_score: number;
  firstname?: string;
  lastname?: string;
  company?: string;
  last_activity_date?: string;
  contact_id: string;
}

interface DailyReportConfig {
  hubspotApiKey: string;
  reportsDir: string;
  timezone: string;
  enabled: boolean;
}

/**
 * Configuración del reporte diario
 */
const reportConfig: DailyReportConfig = {
  hubspotApiKey: process.env.HUBSPOT_API_KEY || '',
  reportsDir: path.join(process.cwd(), 'reports'),
  timezone: 'Europe/Madrid', // CET
  enabled: process.env.DAILY_REPORT_ENABLED === 'true',
};

/**
 * Generar reporte diario de scoring
 */
export async function generateDailyReport(): Promise<void> {
  const executionId = `daily-report-${Date.now()}`;

  logger.info('📊 Iniciando generación de reporte diario', {
    executionId,
    timestamp: new Date().toISOString(),
  });

  try {
    // 1. Crear directorio de reportes si no existe
    if (!fs.existsSync(reportConfig.reportsDir)) {
      fs.mkdirSync(reportConfig.reportsDir, { recursive: true });
      logger.info('📁 Directorio de reportes creado', {
        dir: reportConfig.reportsDir,
      });
    }

    // 2. Obtener top 10 leads de HubSpot
    const topLeads = await getTopLeadsFromHubSpot();

    logger.info('🔍 Leads obtenidos de HubSpot', {
      count: topLeads.length,
      topScore: topLeads[0]?.lead_influence_score || 0,
    });

    // 3. Generar archivo Markdown
    const reportDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const reportPath = path.join(reportConfig.reportsDir, `${reportDate}.md`);

    const markdownContent = generateMarkdownReport(topLeads, reportDate);

    fs.writeFileSync(reportPath, markdownContent, 'utf8');

    logger.info('📄 Reporte diario generado exitosamente', {
      reportPath,
      leadsCount: topLeads.length,
      fileSize: markdownContent.length,
    });

    // 4. Generar también un resumen JSON para APIs
    const jsonReportPath = path.join(
      reportConfig.reportsDir,
      `${reportDate}.json`
    );
    const jsonContent = {
      date: reportDate,
      generated_at: new Date().toISOString(),
      timezone: reportConfig.timezone,
      total_leads: topLeads.length,
      top_leads: topLeads,
      summary: {
        highest_score: topLeads[0]?.lead_influence_score || 0,
        lowest_score: topLeads[topLeads.length - 1]?.lead_influence_score || 0,
        average_score:
          topLeads.reduce((sum, lead) => sum + lead.lead_influence_score, 0) /
            topLeads.length || 0,
      },
    };

    fs.writeFileSync(
      jsonReportPath,
      JSON.stringify(jsonContent, null, 2),
      'utf8'
    );

    logger.info('📋 Reporte JSON generado', { jsonReportPath });
  } catch (error) {
    logger.error('❌ Error generando reporte diario', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      executionId,
    });

    throw error;
  }
}

/**
 * Obtener top 10 leads desde HubSpot API
 */
async function getTopLeadsFromHubSpot(retries = 3): Promise<LeadScoreRecord[]> {
  const url = 'https://api.hubapi.com/crm/v3/objects/contacts';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${reportConfig.hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          properties:
            'email,lead_influence_score,firstname,lastname,company,last_activity_date',
          limit: 100, // Obtener más para filtrar y ordenar
          archived: false,
        },
      });

      // Filtrar y ordenar por score
      const contacts = response.data.results
        .filter((contact: any) => {
          const score = parseInt(
            contact.properties.lead_influence_score || '0'
          );
          return score > 0 && contact.properties.email; // Solo contacts con score > 0 y email
        })
        .map(
          (contact: any) =>
            ({
              contact_id: contact.id,
              email: contact.properties.email,
              lead_influence_score: parseInt(
                contact.properties.lead_influence_score || '0'
              ),
              firstname: contact.properties.firstname || '',
              lastname: contact.properties.lastname || '',
              company: contact.properties.company || '',
              last_activity_date: contact.properties.last_activity_date || '',
            }) as LeadScoreRecord
        )
        .sort(
          (a: LeadScoreRecord, b: LeadScoreRecord) =>
            b.lead_influence_score - a.lead_influence_score
        ) // Ordenar descendente
        .slice(0, 10); // Top 10

      logger.info('📈 Leads procesados desde HubSpot', {
        totalFetched: response.data.results.length,
        filtered: contacts.length,
        attempt,
      });

      return contacts;
    } catch (error) {
      if (attempt === retries) {
        logger.error(
          '❌ Error obteniendo leads de HubSpot después de todos los reintentos',
          {
            attempt,
            error: error instanceof Error ? error.message : String(error),
          }
        );
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      logger.warn(`Reintento HubSpot ${attempt}/${retries} en ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return [];
}

/**
 * Generar contenido Markdown del reporte
 */
function generateMarkdownReport(
  leads: LeadScoreRecord[],
  reportDate: string
): string {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    timeZone: reportConfig.timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('es-ES', {
    timeZone: reportConfig.timezone,
    hour: '2-digit',
    minute: '2-digit',
  });

  return `# 📊 Reporte Diario de Lead Scoring

**Fecha:** ${currentDate}  
**Generado:** ${currentTime} CET  
**Período:** ${reportDate}

## 🏆 Top 10 Leads por Influence Score

| Pos | Email | Score | Nombre | Empresa | Última Actividad |
|-----|-------|-------|--------|---------|------------------|
${leads
  .map((lead, index) => {
    const position = index + 1;
    const name =
      [lead.firstname, lead.lastname].filter(Boolean).join(' ') || 'N/A';
    const company = lead.company || 'N/A';
    const lastActivity = lead.last_activity_date
      ? new Date(lead.last_activity_date).toLocaleDateString('es-ES')
      : 'N/A';

    return `| ${position} | ${lead.email} | **${lead.lead_influence_score}** | ${name} | ${company} | ${lastActivity} |`;
  })
  .join('\n')}

## 📈 Resumen Estadístico

- **Total de leads evaluados:** ${leads.length}
- **Score más alto:** ${leads[0]?.lead_influence_score || 0}
- **Score más bajo:** ${leads[leads.length - 1]?.lead_influence_score || 0}
- **Score promedio:** ${Math.round(leads.reduce((sum, lead) => sum + lead.lead_influence_score, 0) / leads.length) || 0}

## 🎯 Insights y Recomendaciones

### 🔥 Leads de Alta Prioridad (Score > 80)
${
  leads.filter((lead) => lead.lead_influence_score > 80).length > 0
    ? leads
        .filter((lead) => lead.lead_influence_score > 80)
        .map(
          (lead) =>
            `- **${lead.email}** (Score: ${lead.lead_influence_score}) - Contactar inmediatamente`
        )
        .join('\n')
    : '- No hay leads con score > 80 en este período'
}

### 🚀 Leads de Seguimiento (Score 40-80)
${
  leads.filter(
    (lead) => lead.lead_influence_score >= 40 && lead.lead_influence_score <= 80
  ).length > 0
    ? leads
        .filter(
          (lead) =>
            lead.lead_influence_score >= 40 && lead.lead_influence_score <= 80
        )
        .map(
          (lead) =>
            `- **${lead.email}** (Score: ${lead.lead_influence_score}) - Incluir en campaña de nurturing`
        )
        .join('\n')
    : '- No hay leads en el rango 40-80 en este período'
}

### 📊 Acciones Recomendadas

1. **Contacto Inmediato:** ${leads.filter((lead) => lead.lead_influence_score > 80).length} leads
2. **Campaña de Nurturing:** ${leads.filter((lead) => lead.lead_influence_score >= 40 && lead.lead_influence_score <= 80).length} leads
3. **Seguimiento Rutinario:** ${leads.filter((lead) => lead.lead_influence_score < 40).length} leads

---

*Reporte generado automáticamente por Kopp CRM Automation*  
*Próximo reporte: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')} 08:00 CET*
`;
}

/**
 * Configurar cron job para ejecución diaria
 */
export function setupDailyReportCron(): void {
  if (!reportConfig.enabled) {
    logger.info('📊 Reporte diario deshabilitado');
    return;
  }

  if (!reportConfig.hubspotApiKey) {
    logger.error(
      '❌ HUBSPOT_API_KEY no configurado, reporte diario deshabilitado'
    );
    return;
  }

  // Ejecutar cada día a las 08:00 CET
  const cronSchedule = '0 8 * * *'; // 08:00 todos los días

  const task = cron.schedule(
    cronSchedule,
    async () => {
      logger.info('⏰ Ejecutando reporte diario programado');

      try {
        await generateDailyReport();
        logger.info('✅ Reporte diario completado exitosamente');
      } catch (error) {
        logger.error('❌ Error en reporte diario programado', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
    {
      timezone: reportConfig.timezone,
    }
  );

  task.start();

  logger.info('📅 Cron job de reporte diario configurado', {
    schedule: cronSchedule,
    timezone: reportConfig.timezone,
  });
}

/**
 * Ejecutar reporte manualmente (para testing)
 */
export async function runManualReport(): Promise<void> {
  logger.info('🚀 Ejecutando reporte manual');
  await generateDailyReport();
}

// Auto-inicializar si es el archivo principal
if (require.main === module) {
  setupDailyReportCron();
}
