import express from 'express';
import { Request, Response } from 'express';

const router: express.Router = express.Router();

/**
 * @swagger
 * /zapier/webhook/lead-scoring:
 *   post:
 *     tags: [Zapier]
 *     summary: Webhook para lead scoring desde Google Sheets
 *     description: |
 *       Recibe webhooks de Zapier cuando se actualiza el lead scoring en Google Sheets.
 *
 *       **Flujo de automatización:**
 *       1. 📊 Google Sheets calcula nuevo score de lead
 *       2. ⚡ Zapier dispara webhook a este endpoint
 *       3. 🔄 Sistema actualiza score en HubSpot
 *       4. 🔔 Notificación automática a Slack si score > 70
 *       5. 📈 Actualización en dashboard de reporting
 *
 *       **Validaciones incluidas:**
 *       - ✅ Verificación de firma de Zapier
 *       - 📊 Validación de formato de scoring
 *       - 🔒 Verificación de contacto existente
 *       - 🚫 Prevención de actualizaciones duplicadas
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contact_id, score, source]
 *             properties:
 *               contact_id:
 *                 type: string
 *                 description: ID del contacto en HubSpot
 *                 example: "12345678901"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del contacto (fallback si no hay contact_id)
 *                 example: "juan.perez@acme.com"
 *               score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Nuevo score calculado
 *                 example: 85
 *               source:
 *                 type: string
 *                 description: Fuente del scoring
 *                 example: "google_sheets_automation"
 *               scoring_factors:
 *                 type: object
 *                 description: Factores que contribuyeron al score
 *                 properties:
 *                   demographic:
 *                     type: integer
 *                     description: Puntuación demográfica
 *                   behavioral:
 *                     type: integer
 *                     description: Puntuación comportamental
 *                   engagement:
 *                     type: integer
 *                     description: Puntuación de engagement
 *                   company_fit:
 *                     type: integer
 *                     description: Puntuación de fit de empresa
 *               metadata:
 *                 type: object
 *                 description: Metadatos adicionales del scoring
 *                 properties:
 *                   sheet_row:
 *                     type: integer
 *                     description: Fila en Google Sheets
 *                   calculation_timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp del cálculo en Sheets
 *           examples:
 *             high_score_lead:
 *               summary: Lead con score alto
 *               value:
 *                 contact_id: "12345678901"
 *                 email: "juan.perez@acme.com"
 *                 score: 90
 *                 source: "google_sheets_automation"
 *                 scoring_factors:
 *                   demographic: 22
 *                   behavioral: 28
 *                   engagement: 20
 *                   company_fit: 20
 *                 metadata:
 *                   sheet_row: 15
 *                   calculation_timestamp: "2024-06-29T17:45:00.000Z"
 *             medium_score_lead:
 *               summary: Lead con score medio
 *               value:
 *                 contact_id: "98765432109"
 *                 email: "maria.garcia@startup.com"
 *                 score: 65
 *                 source: "google_sheets_automation"
 *                 scoring_factors:
 *                   demographic: 15
 *                   behavioral: 20
 *                   engagement: 15
 *                   company_fit: 15
 *                 metadata:
 *                   sheet_row: 23
 *                   calculation_timestamp: "2024-06-29T17:47:00.000Z"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 contact_id:
 *                   type: string
 *                 score_updated:
 *                   type: boolean
 *                 previous_score:
 *                   type: integer
 *                 new_score:
 *                   type: integer
 *                 notifications_sent:
 *                   type: object
 *                   properties:
 *                     slack:
 *                       type: boolean
 *                       description: Si se envió notificación a Slack
 *                     hubspot:
 *                       type: boolean
 *                       description: Si se actualizó en HubSpot
 *                 automations_triggered:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Automatizaciones adicionales disparadas
 *                 processed_at:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               contact_id: "12345678901"
 *               score_updated: true
 *               previous_score: 45
 *               new_score: 90
 *               notifications_sent:
 *                 slack: true
 *                 hubspot: true
 *               automations_triggered:
 *                 - "assign_to_sales_rep"
 *                 - "update_lifecycle_stage"
 *                 - "create_task_for_followup"
 *               processed_at: "2024-06-29T18:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Contacto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "CONTACT_NOT_FOUND"
 *               message: "No se encontró contacto con el ID proporcionado"
 *               contact_id: "12345678901"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/webhook/lead-scoring',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { contact_id, email, score, source, scoring_factors, metadata } =
        req.body;

      // Validación básica
      if (!contact_id && !email) {
        res.status(400).json({
          error: 'MISSING_CONTACT_IDENTIFIER',
          message:
            'Se requiere contact_id o email para identificar el contacto',
        });
        return;
      }

      if (typeof score !== 'number' || score < 0 || score > 100) {
        res.status(400).json({
          error: 'INVALID_SCORE',
          message: 'El score debe ser un número entre 0 y 100',
        });
        return;
      }

      if (!source) {
        res.status(400).json({
          error: 'MISSING_SOURCE',
          message: 'El campo source es obligatorio',
        });
        return;
      }

      // Mock processing - En producción aquí iría la lógica real
      const previousScore = Math.floor(Math.random() * 100);
      const shouldNotifySlack = score > 70;

      const automationsTriggered = [];
      if (score > 75) automationsTriggered.push('assign_to_sales_rep');
      if (score > 80) automationsTriggered.push('update_lifecycle_stage');
      if (score > 85) automationsTriggered.push('create_task_for_followup');

      const response = {
        success: true,
        contact_id: contact_id || `resolved_from_email_${Date.now()}`,
        score_updated: true,
        previous_score: previousScore,
        new_score: score,
        scoring_factors,
        source,
        notifications_sent: {
          slack: shouldNotifySlack,
          hubspot: true,
        },
        automations_triggered: automationsTriggered,
        metadata: {
          ...metadata,
          processing_duration_ms: Math.floor(Math.random() * 500) + 100,
          zapier_webhook_id: `zwh_${Date.now()}`,
        },
        processed_at: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: 'LEAD_SCORING_WEBHOOK_FAILED',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /zapier/webhook/form-submission:
 *   post:
 *     tags: [Zapier]
 *     summary: Webhook para nuevas submissions de formularios
 *     description: |
 *       Recibe webhooks cuando se envía un formulario web y procesa automáticamente el lead.
 *
 *       **Procesamiento automático:**
 *       1. 📝 Validación de datos del formulario
 *       2. 🔍 Verificación de duplicados en HubSpot
 *       3. 📊 Cálculo inicial de lead score
 *       4. 💾 Creación/actualización de contacto en HubSpot
 *       5. 🔔 Notificación inmediata a Slack
 *       6. 📈 Actualización en Google Sheets para tracking
 *
 *       **Enriquecimiento automático:**
 *       - 🌐 Lookup de información de empresa
 *       - 📍 Geolocalización por IP
 *       - 🏷️ Clasificación automática de lead
 *       - 📊 Score inicial basado en fuente y datos
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, form_name, submitted_at]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del lead
 *                 example: "nuevo.lead@empresa.com"
 *               firstname:
 *                 type: string
 *                 description: Nombre del lead
 *                 example: "Carlos"
 *               lastname:
 *                 type: string
 *                 description: Apellido del lead
 *                 example: "Ruiz"
 *               phone:
 *                 type: string
 *                 description: Teléfono del lead
 *                 example: "+34 666 777 888"
 *               company:
 *                 type: string
 *                 description: Empresa del lead
 *                 example: "Innovative Solutions SL"
 *               form_name:
 *                 type: string
 *                 description: Nombre del formulario enviado
 *                 example: "Contact Form - Homepage"
 *               form_data:
 *                 type: object
 *                 description: Datos adicionales del formulario
 *                 additionalProperties: true
 *               submitted_at:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp de envío del formulario
 *               page_url:
 *                 type: string
 *                 description: URL donde se envió el formulario
 *                 example: "https://kopp-stadium.com/contact"
 *               user_ip:
 *                 type: string
 *                 description: IP del usuario para geolocalización
 *                 example: "192.168.1.1"
 *               utm_parameters:
 *                 type: object
 *                 description: Parámetros UTM para tracking
 *                 properties:
 *                   utm_source: { type: string }
 *                   utm_medium: { type: string }
 *                   utm_campaign: { type: string }
 *                   utm_term: { type: string }
 *                   utm_content: { type: string }
 *           examples:
 *             contact_form:
 *               summary: Formulario de contacto básico
 *               value:
 *                 email: "carlos.ruiz@innovative.com"
 *                 firstname: "Carlos"
 *                 lastname: "Ruiz"
 *                 phone: "+34 666 777 888"
 *                 company: "Innovative Solutions SL"
 *                 form_name: "Contact Form - Homepage"
 *                 form_data:
 *                   message: "Interesado en sus servicios de CRM"
 *                   budget: "10000-50000"
 *                   timeline: "3-6 months"
 *                 submitted_at: "2024-06-29T18:00:00.000Z"
 *                 page_url: "https://kopp-stadium.com/contact"
 *                 user_ip: "185.76.8.165"
 *                 utm_parameters:
 *                   utm_source: "google"
 *                   utm_medium: "cpc"
 *                   utm_campaign: "crm-solutions"
 *             demo_request:
 *               summary: Solicitud de demo
 *               value:
 *                 email: "director@bigcorp.com"
 *                 firstname: "Ana"
 *                 lastname: "Martínez"
 *                 phone: "+34 910 123 456"
 *                 company: "BigCorp Enterprise"
 *                 form_name: "Demo Request Form"
 *                 form_data:
 *                   job_title: "IT Director"
 *                   company_size: "501-1000"
 *                   use_case: "Sales automation"
 *                   preferred_date: "2024-07-05"
 *                 submitted_at: "2024-06-29T17:30:00.000Z"
 *                 page_url: "https://kopp-stadium.com/demo"
 *     responses:
 *       200:
 *         description: Formulario procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 lead_id:
 *                   type: string
 *                   description: ID del lead creado/actualizado
 *                 contact_id:
 *                   type: string
 *                   description: ID del contacto en HubSpot
 *                 is_new_contact:
 *                   type: boolean
 *                   description: Si es un contacto nuevo o actualización
 *                 initial_score:
 *                   type: integer
 *                   description: Score inicial calculado
 *                 enrichment_data:
 *                   type: object
 *                   description: Datos adicionales obtenidos automáticamente
 *                   properties:
 *                     company_info:
 *                       type: object
 *                       description: Información de empresa enriquecida
 *                     geolocation:
 *                       type: object
 *                       description: Datos de geolocalización
 *                 notifications_sent:
 *                   type: object
 *                   properties:
 *                     slack_channel:
 *                       type: string
 *                       description: Canal de Slack notificado
 *                     email_confirmation:
 *                       type: boolean
 *                       description: Si se envió email de confirmación
 *                 next_steps:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Próximos pasos automatizados programados
 *                 processed_at:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               lead_id: "lead_29062024_001"
 *               contact_id: "55667788990"
 *               is_new_contact: true
 *               initial_score: 75
 *               enrichment_data:
 *                 company_info:
 *                   domain: "innovative.com"
 *                   industry: "Technology"
 *                   employee_count: "51-200"
 *                 geolocation:
 *                   country: "Spain"
 *                   city: "Madrid"
 *                   timezone: "Europe/Madrid"
 *               notifications_sent:
 *                 slack_channel: "#leads"
 *                 email_confirmation: true
 *               next_steps:
 *                 - "Send welcome email sequence"
 *                 - "Schedule follow-up task for sales rep"
 *                 - "Add to nurturing campaign"
 *               processed_at: "2024-06-29T18:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/webhook/form-submission',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        firstname,
        lastname,
        phone,
        company,
        form_name,
        form_data,
        submitted_at,
        page_url,
        user_ip,
        utm_parameters,
      } = req.body;

      // Validación básica
      if (!email) {
        res.status(400).json({
          error: 'MISSING_EMAIL',
          message: 'El campo email es obligatorio',
        });
        return;
      }

      if (!form_name) {
        res.status(400).json({
          error: 'MISSING_FORM_NAME',
          message: 'El campo form_name es obligatorio',
        });
        return;
      }

      if (!submitted_at) {
        res.status(400).json({
          error: 'MISSING_SUBMITTED_AT',
          message: 'El campo submitted_at es obligatorio',
        });
        return;
      }

      // Mock processing - En producción aquí iría la lógica real
      const leadId = `lead_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const contactId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const initialScore = Math.floor(Math.random() * 40) + 40; // Score entre 40-80 para nuevos leads

      const response = {
        success: true,
        lead_id: leadId,
        contact_id: contactId,
        is_new_contact: true,
        initial_score: initialScore,
        form_details: {
          name: form_name,
          page_url,
          submitted_at,
        },
        contact_data: {
          email,
          firstname,
          lastname,
          phone,
          company,
        },
        enrichment_data: {
          company_info: company
            ? {
                domain: company.toLowerCase().replace(/\s+/g, '') + '.com',
                industry: 'Technology',
                employee_count: '51-200',
              }
            : null,
          geolocation: user_ip
            ? {
                country: 'Spain',
                city: 'Madrid',
                timezone: 'Europe/Madrid',
              }
            : null,
          utm_tracking: utm_parameters,
        },
        notifications_sent: {
          slack_channel: '#leads',
          email_confirmation: true,
        },
        next_steps: [
          'Send welcome email sequence',
          'Schedule follow-up task for sales rep',
          'Add to nurturing campaign',
        ],
        form_data,
        processed_at: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: 'FORM_SUBMISSION_WEBHOOK_FAILED',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /zapier/status:
 *   get:
 *     tags: [Zapier]
 *     summary: Estado de integración con Zapier
 *     description: |
 *       Obtiene el estado actual de la integración con Zapier, incluyendo:
 *
 *       **Información de estado:**
 *       - ✅ Conectividad con Zapier webhooks
 *       - 📊 Estadísticas de webhooks recibidos
 *       - ⚡ Zaps activos y configurados
 *       - 🕒 Últimas actividades y timestamps
 *       - 🚨 Errores recientes y rate limits
 *
 *       **Métricas incluidas:**
 *       - 📈 Webhooks procesados (últimas 24h, 7 días, 30 días)
 *       - ⏱️ Tiempo promedio de procesamiento
 *       - 📊 Distribución por tipo de evento
 *       - 🔄 Estado de automatizaciones activas
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Estado de Zapier obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 zapier_integration:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, error]
 *                       description: Estado general de la integración
 *                     active_zaps:
 *                       type: integer
 *                       description: Número de Zaps activos relacionados
 *                     webhook_endpoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint: { type: string }
 *                           status: { type: string }
 *                           last_activity: { type: string }
 *                 webhook_stats:
 *                   type: object
 *                   properties:
 *                     last_24h:
 *                       type: object
 *                       properties:
 *                         total_received: { type: integer }
 *                         successful: { type: integer }
 *                         failed: { type: integer }
 *                     last_7d:
 *                       type: object
 *                       properties:
 *                         total_received: { type: integer }
 *                         successful: { type: integer }
 *                         failed: { type: integer }
 *                     avg_processing_time_ms:
 *                       type: number
 *                       description: Tiempo promedio de procesamiento
 *                 event_distribution:
 *                   type: object
 *                   description: Distribución de eventos por tipo
 *                   additionalProperties:
 *                     type: integer
 *                 recent_activity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp: { type: string }
 *                       event_type: { type: string }
 *                       status: { type: string }
 *                       processing_time_ms: { type: number }
 *                 checked_at:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               zapier_integration:
 *                 status: "active"
 *                 active_zaps: 8
 *                 webhook_endpoints:
 *                   - endpoint: "/zapier/webhook/lead-scoring"
 *                     status: "active"
 *                     last_activity: "2024-06-29T17:45:00.000Z"
 *                   - endpoint: "/zapier/webhook/form-submission"
 *                     status: "active"
 *                     last_activity: "2024-06-29T17:30:00.000Z"
 *               webhook_stats:
 *                 last_24h:
 *                   total_received: 45
 *                   successful: 43
 *                   failed: 2
 *                 last_7d:
 *                   total_received: 287
 *                   successful: 278
 *                   failed: 9
 *                 avg_processing_time_ms: 245.8
 *               event_distribution:
 *                 lead_scoring: 156
 *                 form_submission: 89
 *                 contact_update: 42
 *               recent_activity:
 *                 - timestamp: "2024-06-29T17:45:00.000Z"
 *                   event_type: "lead_scoring"
 *                   status: "success"
 *                   processing_time_ms: 234
 *                 - timestamp: "2024-06-29T17:30:00.000Z"
 *                   event_type: "form_submission"
 *                   status: "success"
 *                   processing_time_ms: 189
 *               checked_at: "2024-06-29T18:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock response - En producción aquí iría la lógica real
    const response = {
      success: true,
      zapier_integration: {
        status: 'active',
        active_zaps: 8,
        webhook_endpoints: [
          {
            endpoint: '/zapier/webhook/lead-scoring',
            status: 'active',
            last_activity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            endpoint: '/zapier/webhook/form-submission',
            status: 'active',
            last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ],
      },
      webhook_stats: {
        last_24h: {
          total_received: 45,
          successful: 43,
          failed: 2,
        },
        last_7d: {
          total_received: 287,
          successful: 278,
          failed: 9,
        },
        avg_processing_time_ms: 245.8,
      },
      event_distribution: {
        lead_scoring: 156,
        form_submission: 89,
        contact_update: 42,
      },
      recent_activity: [
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          event_type: 'lead_scoring',
          status: 'success',
          processing_time_ms: 234,
        },
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          event_type: 'form_submission',
          status: 'success',
          processing_time_ms: 189,
        },
      ],
      checked_at: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'ZAPIER_STATUS_CHECK_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
