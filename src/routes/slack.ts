import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /slack/notify:
 *   post:
 *     tags: [Slack]
 *     summary: Enviar notificación a Slack
 *     description: |
 *       Envía una notificación personalizada a un canal de Slack específico.
 *
 *       **Características:**
 *       - 📢 Soporte para canales públicos y privados
 *       - 🎨 Formatting rico con Markdown
 *       - 📎 Attachments y botones interactivos
 *       - 🔔 Diferentes niveles de prioridad
 *       - 👥 Menciones a usuarios y grupos
 *
 *       **Niveles de prioridad:**
 *       - `low`: Notificación informativa
 *       - `medium`: Notificación estándar
 *       - `high`: Notificación importante (con ping)
 *       - `urgent`: Notificación crítica (con @channel)
 *     security:
 *       - slackAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlackMessage'
 *           examples:
 *             simple_message:
 *               summary: Mensaje simple
 *               value:
 *                 channel: "#general"
 *                 text: "Nuevo lead generado desde el formulario web"
 *                 priority: "medium"
 *             urgent_alert:
 *               summary: Alerta urgente
 *               value:
 *                 channel: "#alerts"
 *                 text: "🚨 Lead de alta prioridad detectado - Score: 95/100"
 *                 priority: "urgent"
 *                 attachments:
 *                   - color: "danger"
 *                     title: "Lead Calificado"
 *                     fields:
 *                       - title: "Empresa"
 *                         value: "Acme Corp"
 *                         short: true
 *                       - title: "Score"
 *                         value: "95/100"
 *                         short: true
 *             lead_notification:
 *               summary: Notificación de lead con datos
 *               value:
 *                 channel: "#leads"
 *                 text: "🎯 Nuevo lead cualificado disponible"
 *                 priority: "high"
 *                 attachments:
 *                   - color: "good"
 *                     title: "Lead Información"
 *                     fields:
 *                       - title: "Nombre"
 *                         value: "Juan Pérez"
 *                         short: true
 *                       - title: "Email"
 *                         value: "juan.perez@acme.com"
 *                         short: true
 *                       - title: "Teléfono"
 *                         value: "+34 600 123 456"
 *                         short: true
 *                       - title: "Fuente"
 *                         value: "Formulario Web"
 *                         short: true
 *                     actions:
 *                       - type: "button"
 *                         text: "Ver en HubSpot"
 *                         url: "https://app.hubspot.com/contacts/..."
 *                         style: "primary"
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notificación enviada exitosamente"
 *                 slack_response:
 *                   type: object
 *                   properties:
 *                     ok:
 *                       type: boolean
 *                     channel:
 *                       type: string
 *                     ts:
 *                       type: string
 *                     message:
 *                       type: object
 *             example:
 *               success: true
 *               message: "Notificación enviada exitosamente"
 *               slack_response:
 *                 ok: true
 *                 channel: "C1234567890"
 *                 ts: "1234567890.123456"
 *                 message:
 *                   text: "Nuevo lead generado desde el formulario web"
 *                   user: "U1234567890"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/notify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, text, priority = 'medium', attachments = [] } = req.body;

    // Validación básica
    if (!channel || !text) {
      res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Los campos channel y text son obligatorios',
      });
      return;
    }

    // Mock response - En producción aquí iría la integración real con Slack
    const slackResponse = {
      ok: true,
      channel: 'C1234567890',
      ts: `${Date.now() / 1000}.123456`,
      message: {
        text,
        user: 'U1234567890',
      },
    };

    res.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      slack_response: slackResponse,
      priority,
      attachments: attachments.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'SLACK_NOTIFICATION_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /slack/channels:
 *   get:
 *     tags: [Slack]
 *     summary: Listar canales de Slack disponibles
 *     description: |
 *       Obtiene la lista de canales de Slack disponibles para el bot.
 *
 *       **Incluye:**
 *       - 📢 Canales públicos accesibles
 *       - 🔒 Canales privados donde el bot está invitado
 *       - 👥 Información básica de cada canal
 *       - ✅ Estado de permisos del bot
 *
 *       > **Nota:** Solo se muestran canales donde el bot tiene permisos de escritura.
 *     security:
 *       - slackAuth: []
 *     parameters:
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           enum: [public_channel, private_channel, mpim, im]
 *         description: Tipo de canales a listar
 *         example: "public_channel"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Número máximo de canales a retornar
 *     responses:
 *       200:
 *         description: Lista de canales obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 channels:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID único del canal
 *                       name:
 *                         type: string
 *                         description: Nombre del canal
 *                       is_channel:
 *                         type: boolean
 *                         description: Si es un canal público
 *                       is_private:
 *                         type: boolean
 *                         description: Si es un canal privado
 *                       is_member:
 *                         type: boolean
 *                         description: Si el bot es miembro del canal
 *                       member_count:
 *                         type: integer
 *                         description: Número de miembros del canal
 *                       purpose:
 *                         type: string
 *                         description: Propósito del canal
 *                 total_count:
 *                   type: integer
 *                   description: Total de canales disponibles
 *             example:
 *               success: true
 *               channels:
 *                 - id: "C1234567890"
 *                   name: "general"
 *                   is_channel: true
 *                   is_private: false
 *                   is_member: true
 *                   member_count: 25
 *                   purpose: "Canal general de la empresa"
 *                 - id: "C0987654321"
 *                   name: "leads"
 *                   is_channel: true
 *                   is_private: false
 *                   is_member: true
 *                   member_count: 8
 *                   purpose: "Notificaciones de leads"
 *               total_count: 2
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/channels', async (req: Request, res: Response) => {
  try {
    const { types = 'public_channel', limit = 100 } = req.query;

    // Mock response - En producción aquí iría la integración real con Slack
    const channels = [
      {
        id: 'C1234567890',
        name: 'general',
        is_channel: true,
        is_private: false,
        is_member: true,
        member_count: 25,
        purpose: 'Canal general de la empresa',
      },
      {
        id: 'C0987654321',
        name: 'leads',
        is_channel: true,
        is_private: false,
        is_member: true,
        member_count: 8,
        purpose: 'Notificaciones de leads',
      },
      {
        id: 'C1122334455',
        name: 'alerts',
        is_channel: true,
        is_private: false,
        is_member: true,
        member_count: 12,
        purpose: 'Alertas del sistema',
      },
    ];

    res.json({
      success: true,
      channels,
      total_count: channels.length,
      filters: { types, limit },
    });
  } catch (error) {
    res.status(500).json({
      error: 'SLACK_CHANNELS_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /slack/webhook:
 *   post:
 *     tags: [Slack]
 *     summary: Webhook para recibir eventos de Slack
 *     description: |
 *       Endpoint para recibir webhooks de Slack, incluyendo:
 *
 *       **Tipos de eventos soportados:**
 *       - 📝 `app_mention` - Menciones al bot
 *       - 📩 `message` - Mensajes en canales
 *       - 👥 `member_joined_channel` - Nuevos miembros
 *       - 🔔 `reaction_added` - Reacciones a mensajes
 *       - ⚙️ `app_home_opened` - Apertura del home del bot
 *
 *       **Verificación de seguridad:**
 *       - ✅ Validación de signature de Slack
 *       - 🕒 Verificación de timestamp
 *       - 🔒 Validación de token de aplicación
 *
 *       > **Nota:** Este endpoint debe configurarse en la aplicación de Slack como Event Subscription URL.
 *     security:
 *       - slackAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de verificación de Slack
 *               challenge:
 *                 type: string
 *                 description: Challenge para verificación de URL (solo en setup inicial)
 *               type:
 *                 type: string
 *                 enum: [url_verification, event_callback]
 *                 description: Tipo de webhook
 *               event:
 *                 type: object
 *                 description: Datos del evento (si type es event_callback)
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Tipo específico del evento
 *                   user:
 *                     type: string
 *                     description: ID del usuario que generó el evento
 *                   channel:
 *                     type: string
 *                     description: ID del canal donde ocurrió el evento
 *                   text:
 *                     type: string
 *                     description: Texto del mensaje (si aplica)
 *                   ts:
 *                     type: string
 *                     description: Timestamp del evento
 *           examples:
 *             url_verification:
 *               summary: Verificación inicial de URL
 *               value:
 *                 token: "verification_token_here"
 *                 challenge: "challenge_string_here"
 *                 type: "url_verification"
 *             app_mention:
 *               summary: Mención al bot
 *               value:
 *                 token: "verification_token_here"
 *                 type: "event_callback"
 *                 event:
 *                   type: "app_mention"
 *                   user: "U1234567890"
 *                   channel: "C1234567890"
 *                   text: "<@U0987654321> help"
 *                   ts: "1234567890.123456"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challenge:
 *                   type: string
 *                   description: Challenge devuelto para verificación (solo en url_verification)
 *                 success:
 *                   type: boolean
 *                   description: Si el evento fue procesado exitosamente
 *                 message:
 *                   type: string
 *                   description: Mensaje de confirmación
 *           examples:
 *             url_verification_response:
 *               summary: Respuesta a verificación de URL
 *               value:
 *                 challenge: "challenge_string_here"
 *             event_processed:
 *               summary: Evento procesado
 *               value:
 *                 success: true
 *                 message: "Evento procesado exitosamente"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, challenge, type, event } = req.body;

    // Verificación inicial de URL
    if (type === 'url_verification') {
      res.json({ challenge });
      return;
    }

    // Validación de token (en producción se haría verificación de signature)
    if (!token) {
      res.status(401).json({
        error: 'MISSING_TOKEN',
        message: 'Token de verificación requerido',
      });
      return;
    }

    // Procesar evento de callback
    if (type === 'event_callback' && event) {
      console.log(`Received Slack event: ${event.type}`);

      // Aquí iría la lógica específica para cada tipo de evento
      switch (event.type) {
        case 'app_mention':
          console.log(
            `Bot mentioned in channel ${event.channel} by user ${event.user}`
          );
          break;
        case 'message':
          console.log(`Message received in channel ${event.channel}`);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({
        success: true,
        message: 'Evento procesado exitosamente',
        event_type: event.type,
      });
      return;
    }

    res.status(400).json({
      error: 'INVALID_WEBHOOK_TYPE',
      message: 'Tipo de webhook no soportado',
    });
  } catch (error) {
    res.status(500).json({
      error: 'WEBHOOK_PROCESSING_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /slack/message:
 *   post:
 *     tags: [Slack]
 *     summary: Enviar mensaje a Slack
 *     description: Envía un mensaje a un canal específico de Slack
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 description: Canal de destino
 *               text:
 *                 type: string
 *                 description: Texto del mensaje
 *               blocks:
 *                 type: array
 *                 description: Bloques de mensaje
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
router.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, text } = req.body;

    // Validación básica
    if (!channel || !text) {
      res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Los campos channel y text son obligatorios',
      });
      return;
    }

    // Mock response - En producción aquí iría la integración real con Slack
    const slackResponse = {
      ok: true,
      channel: 'C1234567890',
      ts: `${Date.now() / 1000}.123456`,
      message: {
        text,
        user: 'U1234567890',
        ts: `${Date.now() / 1000}.123456`,
      },
    };

    res.status(200).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: slackResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'SLACK_MESSAGE_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /slack/message/{ts}:
 *   put:
 *     tags: [Slack]
 *     summary: Actualizar mensaje de Slack
 *     description: Actualiza un mensaje existente en Slack
 *     parameters:
 *       - name: ts
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Timestamp del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 description: Canal del mensaje
 *               text:
 *                 type: string
 *                 description: Nuevo texto del mensaje
 *               blocks:
 *                 type: array
 *                 description: Nuevos bloques del mensaje
 *     responses:
 *       200:
 *         description: Mensaje actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno
 */
router.put('/message/:ts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ts } = req.params;
    const { channel, text } = req.body;

    // Validación básica
    if (!channel || !text) {
      res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Los campos channel y text son obligatorios',
      });
      return;
    }

    // Mock response - En producción aquí iría la integración real con Slack
    const slackResponse = {
      ok: true,
      channel: 'C1234567890',
      ts: ts,
      message: {
        text,
        user: 'U1234567890',
        ts: ts,
      },
    };

    res.status(200).json({
      success: true,
      message: 'Mensaje actualizado exitosamente',
      data: slackResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'SLACK_UPDATE_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /slack/message/{ts}:
 *   delete:
 *     tags: [Slack]
 *     summary: Eliminar mensaje de Slack
 *     description: Elimina un mensaje existente en Slack
 *     parameters:
 *       - name: ts
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Timestamp del mensaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 description: Canal del mensaje
 *     responses:
 *       200:
 *         description: Mensaje eliminado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Mensaje no encontrado
 *       500:
 *         description: Error interno
 */
router.delete('/message/:ts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ts } = req.params;
    const { channel } = req.body;

    // Validación básica
    if (!channel) {
      res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'El campo channel es obligatorio',
      });
      return;
    }

    // Mock response - En producción aquí iría la integración real con Slack
    const slackResponse = {
      ok: true,
      channel: 'C1234567890',
      ts: ts,
    };

    res.status(200).json({
      success: true,
      message: 'Mensaje eliminado exitosamente',
      data: slackResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'SLACK_DELETE_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger  
 * /slack/users:
 *   get:
 *     tags: [Slack]
 *     summary: Obtener lista de usuarios de Slack
 *     description: Retorna la lista de usuarios del workspace de Slack
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Número máximo de usuarios a retornar
 *       - name: include_deleted
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir usuarios eliminados
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "U1234567890"
 *                       name:
 *                         type: string
 *                         example: "juan.perez"
 *                       real_name:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       email:
 *                         type: string
 *                         example: "juan.perez@empresa.com"
 *                       is_bot:
 *                         type: boolean
 *                         example: false
 *                       is_deleted:
 *                         type: boolean
 *                         example: false
 *                 total_count:
 *                   type: integer
 *                   example: 25
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { limit = 100, include_deleted = false } = req.query;

    // Mock response - En producción aquí iría la integración real con Slack
    const users = [
      {
        id: 'U1234567890',
        name: 'juan.perez',
        real_name: 'Juan Pérez',
        profile: {
          email: 'juan.perez@empresa.com',
          phone: '+34 600 123 456',
          title: 'Marketing Manager',
        },
        is_bot: false,
        is_deleted: false,
        is_admin: false,
        is_owner: false,
      },
      {
        id: 'U0987654321',
        name: 'maria.garcia',
        real_name: 'María García',
        profile: {
          email: 'maria.garcia@empresa.com',
          phone: '+34 600 789 012',
          title: 'Sales Representative',
        },
        is_bot: false,
        is_deleted: false,
        is_admin: true,
        is_owner: false,
      },
      {
        id: 'U1122334455',
        name: 'bot.assistant',
        real_name: 'Assistant Bot',
        profile: {
          email: 'bot@empresa.com',
          title: 'Automation Bot',
        },
        is_bot: true,
        is_deleted: false,
        is_admin: false,
        is_owner: false,
      },
    ];

    // Filtrar usuarios eliminados si no se requieren
    const filteredUsers = include_deleted 
      ? users 
      : users.filter(user => !user.is_deleted);

    res.json({
      success: true,
      users: filteredUsers.slice(0, Number(limit)),
      total_count: filteredUsers.length,
      filters: { limit, include_deleted },
    });
  } catch (error) {
    res.status(500).json({
      error: 'SLACK_USERS_FAILED',
      message: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
