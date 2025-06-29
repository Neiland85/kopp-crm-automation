import { SlackMessage, ZapierCreate, ZapierZ, ZapierBundle } from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Envía notificación de lead scoring a Slack #scoring-leads
 */
const sendScoringNotification = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<SlackMessage> => {
  const webhookUrl = bundle.authData.slack_webhook_url;
  const input = bundle.inputData;

  const leadScore = parseInt(input.lead_score) || 0;
  const email = input.email || 'Sin email';
  const fullName =
    [input.firstname, input.lastname].filter(Boolean).join(' ') || 'Sin nombre';

  // Solo enviar notificación si lead_score >= 50
  if (leadScore < 50) {
    await logZapAction(z, {
      action: 'send_scoring_notification',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        email,
        lead_score: leadScore,
        action_taken: 'skipped_low_score',
        threshold: 50,
      },
    });

    return {
      blocks: [],
      username: 'Zapier Integration',
      icon_emoji: ':zap:',
      channel: '#scoring-leads',
      skipped: true,
      reason: `Lead score ${leadScore} is below threshold of 50`,
    } as SlackMessage & { skipped: boolean; reason: string };
  }

  // Crear el mensaje de scoring con formato especificado
  const slackMessage: SlackMessage = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '📈 *Lead Score Actualizado*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Usuario:* ${email}`,
          },
          {
            type: 'mrkdwn',
            text: `*Score:* ${leadScore}`,
          },
        ],
      },
    ],
    username: 'Lead Scoring Bot',
    icon_emoji: ':chart_with_upwards_trend:',
    channel: '#scoring-leads',
  };

  // Agregar información adicional si está disponible
  if (fullName !== 'Sin nombre') {
    slackMessage.blocks[1].fields?.push({
      type: 'mrkdwn',
      text: `*Nombre:* ${fullName}`,
    });
  }

  if (input.company) {
    slackMessage.blocks[1].fields?.push({
      type: 'mrkdwn',
      text: `*Empresa:* ${input.company}`,
    });
  }

  if (input.phone) {
    slackMessage.blocks[1].fields?.push({
      type: 'mrkdwn',
      text: `*Teléfono:* ${input.phone}`,
    });
  }

  if (input.last_score_update) {
    const updateDate = new Date(input.last_score_update).toLocaleString(
      'es-ES'
    );
    slackMessage.blocks[1].fields?.push({
      type: 'mrkdwn',
      text: `*Última actualización:* ${updateDate}`,
    });
  }

  // Agregar divider y acciones
  slackMessage.blocks.push({
    type: 'divider',
  } as any);

  // Determinar el color y mensaje según el score
  let scoreLevel = '';
  let actionColor = 'primary';

  if (leadScore >= 80) {
    scoreLevel = '🔥 *HOT LEAD*';
    actionColor = 'danger';
  } else if (leadScore >= 70) {
    scoreLevel = '⚡ *WARM LEAD*';
    actionColor = 'primary';
  } else if (leadScore >= 50) {
    scoreLevel = '👀 *QUALIFIED LEAD*';
    actionColor = 'primary';
  }

  if (scoreLevel) {
    slackMessage.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: scoreLevel,
      },
    });
  }

  // Agregar botón de acción para ver en HubSpot
  if (input.contact_id || email) {
    const hubspotUrl = input.contact_id
      ? `https://app.hubspot.com/contacts/contacts/${input.contact_id}`
      : `https://app.hubspot.com/contacts/search?term=${encodeURIComponent(email)}`;

    slackMessage.blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Ver en HubSpot',
            emoji: true,
          },
          style: actionColor,
          url: hubspotUrl,
        },
      ],
    } as any);
  }

  const request = {
    url: webhookUrl,
    method: 'POST' as const,
    headers: {
      'Content-Type': 'application/json',
    },
    json: slackMessage,
  };

  try {
    const response = await withRetry(() => z.request(request), 3);

    // Log de la acción exitosa
    await logZapAction(z, {
      action: 'send_scoring_notification',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        email,
        lead_score: leadScore,
        score_level: scoreLevel,
        channel: '#scoring-leads',
        blocks_count: slackMessage.blocks.length,
        contact_id: input.contact_id,
      },
    });

    // Verificar que el mensaje se envió correctamente
    if (response.status >= 200 && response.status < 300) {
      return slackMessage;
    } else {
      throw new Error(
        `Slack API returned status ${response.status}: ${response.content}`
      );
    }
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'send_scoring_notification',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        email,
        lead_score: leadScore,
        webhook_url: webhookUrl.replace(/\/[^/]*$/, '/***'),
      },
    });

    z.console.error('Error sending scoring notification:', error);
    throw error;
  }
};

/**
 * Configuración del create action para notificaciones de scoring
 */
const create: ZapierCreate = {
  key: 'send_scoring_notification',
  noun: 'Scoring Notification',
  display: {
    label: 'Send Lead Scoring Notification to Slack',
    description: 'Sends a notification to #scoring-leads when lead score >= 50',
    important: true,
  },
  operation: {
    perform: sendScoringNotification,
    inputFields: [
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        required: true,
        helpText: 'The email address of the contact',
      },
      {
        key: 'lead_score',
        label: 'Lead Score',
        type: 'integer',
        required: true,
        helpText: 'The updated lead score (must be >= 50 to send notification)',
      },
      {
        key: 'firstname',
        label: 'First Name',
        type: 'string',
        required: false,
        helpText: 'The first name of the contact',
      },
      {
        key: 'lastname',
        label: 'Last Name',
        type: 'string',
        required: false,
        helpText: 'The last name of the contact',
      },
      {
        key: 'company',
        label: 'Company',
        type: 'string',
        required: false,
        helpText: 'The company name of the contact',
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'string',
        required: false,
        helpText: 'The phone number of the contact',
      },
      {
        key: 'contact_id',
        label: 'Contact ID',
        type: 'string',
        required: false,
        helpText: 'The HubSpot contact ID for direct linking',
      },
      {
        key: 'last_score_update',
        label: 'Last Score Update',
        type: 'datetime',
        required: false,
        helpText: 'When the score was last updated',
      },
    ],
    sample: {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📈 *Lead Score Actualizado*',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Usuario:* john.doe@example.com',
            },
            {
              type: 'mrkdwn',
              text: '*Score:* 75',
            },
          ],
        },
      ],
      username: 'Lead Scoring Bot',
      icon_emoji: ':chart_with_upwards_trend:',
      channel: '#scoring-leads',
    },
    outputFields: [
      { key: 'blocks', label: 'Slack Blocks', type: 'text' },
      { key: 'username', label: 'Username', type: 'string' },
      { key: 'icon_emoji', label: 'Icon Emoji', type: 'string' },
      { key: 'channel', label: 'Channel', type: 'string' },
    ],
  },
};

export default create;
