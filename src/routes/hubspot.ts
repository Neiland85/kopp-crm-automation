import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /hubspot/contacts:
 *   post:
 *     tags: [HubSpot]
 *     summary: Crear nuevo contacto en HubSpot
 *     description: |
 *       Crea un nuevo contacto en HubSpot CRM con validación automática y scoring de leads.
 *
 *       **Características:**
 *       - 📊 Cálculo automático de lead score
 *       - 🔄 Deduplicación inteligente por email
 *       - 🏷️ Asignación automática de tags y propiedades
 *       - 📈 Integración con pipelines de ventas
 *       - 🔔 Notificaciones automáticas a Slack
 *
 *       **Validaciones automáticas:**
 *       - ✅ Formato de email válido
 *       - 📞 Validación de formato de teléfono
 *       - 🌐 Verificación de dominio de empresa
 *       - 🚫 Prevención de contactos duplicados
 *
 *       **Lead Scoring automático basado en:**
 *       - 🏢 Tamaño y tipo de empresa
 *       - 📊 Comportamiento en website
 *       - 🎯 Fuente del lead
 *       - 📧 Engagement con emails
 *     security:
 *       - hubspotAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HubSpotContact'
 *           examples:
 *             basic_contact:
 *               summary: Contacto básico
 *               value:
 *                 email: "juan.perez@acme.com"
 *                 firstname: "Juan"
 *                 lastname: "Pérez"
 *                 phone: "+34 600 123 456"
 *                 company: "Acme Corp"
 *                 source: "Website Form"
 *             qualified_lead:
 *               summary: Lead cualificado con scoring
 *               value:
 *                 email: "maria.garcia@enterprise.com"
 *                 firstname: "María"
 *                 lastname: "García"
 *                 phone: "+34 910 234 567"
 *                 company: "Enterprise Solutions"
 *                 lead_score: 85
 *                 source: "Demo Request"
 *                 jobtitle: "Director de Marketing"
 *                 website: "https://enterprise.com"
 *                 industry: "Technology"
 *                 num_employees: "201-500"
 *     responses:
 *       201:
 *         description: Contacto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 contact_id:
 *                   type: string
 *                   description: ID único del contacto en HubSpot
 *                   example: "12345678901"
 *                 lead_score:
 *                   type: integer
 *                   description: Score calculado del lead
 *                   example: 85
 *                 hubspot_url:
 *                   type: string
 *                   description: URL del contacto en HubSpot
 *                   example: "https://app.hubspot.com/contacts/123456/contact/12345678901"
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     slack_sent:
 *                       type: boolean
 *                       description: Si se envió notificación a Slack
 *                     zapier_triggered:
 *                       type: boolean
 *                       description: Si se activaron Zaps de Zapier
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp de creación
 *             example:
 *               success: true
 *               contact_id: "12345678901"
 *               lead_score: 85
 *               hubspot_url: "https://app.hubspot.com/contacts/123456/contact/12345678901"
 *               notifications:
 *                 slack_sent: true
 *                 zapier_triggered: true
 *               created_at: "2024-06-29T18:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Contacto ya existe
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - type: object
 *                   properties:
 *                     existing_contact:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         email: { type: string }
 *                         created_at: { type: string }
 *             example:
 *               error: "CONTACT_ALREADY_EXISTS"
 *               message: "Ya existe un contacto con este email"
 *               existing_contact:
 *                 id: "98765432109"
 *                 email: "juan.perez@acme.com"
 *                 created_at: "2024-06-25T10:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/contacts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstname, lastname, phone, company, lead_score, source } =
      req.body;

    // Validación básica
    if (!email) {
      res.status(400).json({
        error: 'MISSING_EMAIL',
        message: 'El campo email es obligatorio',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'INVALID_EMAIL_FORMAT',
        message: 'El formato del email no es válido',
      });
      return;
    }

    // Mock response - En producción aquí iría la integración real con HubSpot
    const contactId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const calculatedScore = lead_score || Math.floor(Math.random() * 100);

    // Simular creación exitosa
    const response = {
      success: true,
      contact_id: contactId,
      lead_score: calculatedScore,
      hubspot_url: `https://app.hubspot.com/contacts/123456/contact/${contactId}`,
      notifications: {
        slack_sent: calculatedScore > 70,
        zapier_triggered: true,
      },
      contact_data: {
        email,
        firstname,
        lastname,
        phone,
        company,
        source,
      },
      created_at: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      error: 'CONTACT_CREATION_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /hubspot/contacts/{contactId}/score:
 *   put:
 *     tags: [HubSpot]
 *     summary: Actualizar score de un contacto
 *     description: |
 *       Actualiza el score de un contacto existente en HubSpot y dispara automatizaciones basadas en el nuevo score.
 *
 *       **Automatizaciones disparadas:**
 *       - 🔔 Notificación a Slack si score > 70
 *       - 📧 Asignación automática a sales rep si score > 80
 *       - 🏷️ Actualización de tags y lifecycle stage
 *       - 📊 Actualización en Google Sheets para reporting
 *       - ⚡ Trigger de Zapier workflows
 *
 *       **Factores de scoring considerados:**
 *       - 👤 Información demográfica (20%)
 *       - 🌐 Comportamiento en website (30%)
 *       - 📧 Engagement con emails (25%)
 *       - 💼 Fit de empresa (25%)
 *     security:
 *       - hubspotAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del contacto en HubSpot
 *         example: "12345678901"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeadScoring'
 *           examples:
 *             high_score_update:
 *               summary: Actualización de score alto
 *               value:
 *                 score: 90
 *                 factors:
 *                   demographic: 18
 *                   behavioral: 28
 *                   engagement: 22
 *                   company_fit: 22
 *                 updated_by: "automated_scoring"
 *                 reason: "Downloaded whitepaper and requested demo"
 *             medium_score_update:
 *               summary: Actualización de score medio
 *               value:
 *                 score: 65
 *                 factors:
 *                   demographic: 15
 *                   behavioral: 20
 *                   engagement: 15
 *                   company_fit: 15
 *                 updated_by: "behavioral_tracking"
 *                 reason: "Multiple page views and form submission"
 *     responses:
 *       200:
 *         description: Score actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 contact_id:
 *                   type: string
 *                 previous_score:
 *                   type: integer
 *                 new_score:
 *                   type: integer
 *                 score_change:
 *                   type: integer
 *                   description: Diferencia en el score
 *                 automations_triggered:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Lista de automatizaciones disparadas
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               contact_id: "12345678901"
 *               previous_score: 45
 *               new_score: 90
 *               score_change: 45
 *               automations_triggered:
 *                 - "slack_high_score_alert"
 *                 - "assign_to_sales_rep"
 *                 - "update_lifecycle_stage"
 *                 - "zapier_qualified_lead_workflow"
 *               updated_at: "2024-06-29T18:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put(
  '/contacts/:contactId/score',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;
      const { score, factors, updated_by, reason } = req.body;

      // Validación básica
      if (!contactId) {
        res.status(400).json({
          error: 'MISSING_CONTACT_ID',
          message: 'ID de contacto requerido',
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

      // Mock response - En producción aquí iría la integración real con HubSpot
      const previousScore = Math.floor(Math.random() * 100);
      const scoreChange = score - previousScore;

      const automationsTriggered = [];
      if (score > 70) automationsTriggered.push('slack_high_score_alert');
      if (score > 80) automationsTriggered.push('assign_to_sales_rep');
      if (score > 85) automationsTriggered.push('update_lifecycle_stage');
      if (score > 75)
        automationsTriggered.push('zapier_qualified_lead_workflow');

      const response = {
        success: true,
        contact_id: contactId,
        previous_score: previousScore,
        new_score: score,
        score_change: scoreChange,
        scoring_factors: factors,
        updated_by: updated_by || 'api',
        reason: reason || 'Manual update via API',
        automations_triggered: automationsTriggered,
        updated_at: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: 'SCORE_UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @swagger
 * /hubspot/contacts/{contactId}:
 *   get:
 *     tags: [HubSpot]
 *     summary: Obtener información de un contacto
 *     description: |
 *       Obtiene información completa de un contacto específico desde HubSpot.
 *
 *       **Información incluida:**
 *       - 👤 Datos básicos del contacto
 *       - 📊 Score actual y histórico
 *       - 🏷️ Tags y propiedades personalizadas
 *       - 📈 Historial de interacciones
 *       - 💼 Información de empresa asociada
 *       - 🔄 Estado en pipelines de ventas
 *     security:
 *       - hubspotAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del contacto en HubSpot
 *         example: "12345678901"
 *       - in: query
 *         name: include
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [score_history, interactions, company, deals]
 *         description: Información adicional a incluir
 *         example: ["score_history", "company"]
 *     responses:
 *       200:
 *         description: Información del contacto obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 contact:
 *                   allOf:
 *                     - $ref: '#/components/schemas/HubSpotContact'
 *                     - type: object
 *                       properties:
 *                         id: { type: string }
 *                         created_at: { type: string }
 *                         updated_at: { type: string }
 *                         score_history:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               score: { type: integer }
 *                               timestamp: { type: string }
 *                               reason: { type: string }
 *                         recent_interactions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type: { type: string }
 *                               timestamp: { type: string }
 *                               details: { type: object }
 *             example:
 *               success: true
 *               contact:
 *                 id: "12345678901"
 *                 email: "juan.perez@acme.com"
 *                 firstname: "Juan"
 *                 lastname: "Pérez"
 *                 phone: "+34 600 123 456"
 *                 company: "Acme Corp"
 *                 lead_score: 85
 *                 source: "Website Form"
 *                 created_at: "2024-06-25T10:30:00.000Z"
 *                 updated_at: "2024-06-29T18:00:00.000Z"
 *                 score_history:
 *                   - score: 45
 *                     timestamp: "2024-06-25T10:30:00.000Z"
 *                     reason: "Initial form submission"
 *                   - score: 85
 *                     timestamp: "2024-06-29T18:00:00.000Z"
 *                     reason: "Downloaded whitepaper"
 *                 recent_interactions:
 *                   - type: "form_submission"
 *                     timestamp: "2024-06-25T10:30:00.000Z"
 *                     details:
 *                       form_name: "Contact Form"
 *                       page_url: "/contact"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/contacts/:contactId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { contactId } = req.params;
      const { include = [] } = req.query;

      if (!contactId) {
        res.status(400).json({
          error: 'MISSING_CONTACT_ID',
          message: 'ID de contacto requerido',
        });
        return;
      }

      // Mock response - En producción aquí iría la integración real con HubSpot
      const contact = {
        id: contactId,
        email: 'juan.perez@acme.com',
        firstname: 'Juan',
        lastname: 'Pérez',
        phone: '+34 600 123 456',
        company: 'Acme Corp',
        lead_score: 85,
        source: 'Website Form',
        created_at: '2024-06-25T10:30:00.000Z',
        updated_at: new Date().toISOString(),
      };

      // Añadir información adicional según parámetros include
      const response: any = { success: true, contact };

      if (Array.isArray(include) && include.includes('score_history')) {
        response.contact.score_history = [
          {
            score: 45,
            timestamp: '2024-06-25T10:30:00.000Z',
            reason: 'Initial form submission',
          },
          {
            score: 85,
            timestamp: new Date().toISOString(),
            reason: 'Downloaded whitepaper',
          },
        ];
      }

      if (Array.isArray(include) && include.includes('interactions')) {
        response.contact.recent_interactions = [
          {
            type: 'form_submission',
            timestamp: '2024-06-25T10:30:00.000Z',
            details: {
              form_name: 'Contact Form',
              page_url: '/contact',
            },
          },
        ];
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: 'CONTACT_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
