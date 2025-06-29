import { SlackMessage, ZapierCreate, ZapierZ, ZapierBundle } from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Envía una notificación a Slack usando Block Kit
 */
const sendSlackNotification = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<SlackMessage> => {
  const webhookUrl = bundle.authData.slack_webhook_url;
  const input = bundle.inputData;

  // Crear el mensaje con Block Kit según el formato especificado
  const slackMessage: SlackMessage = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '📩 *Nuevo Form Submission*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Usuario:* ${input.email || 'No especificado'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Formulario:* ${input.form_name || input.form_id || 'No especificado'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Fecha:* ${input.submitted_at || new Date().toISOString()}`,
          },
        ],
      },
    ],
    username: 'Zapier Integration',
    icon_emoji: ':zap:',
    channel: '#automations-alerts',
  };

  // Agregar campos adicionales si están disponibles
  if (input.firstname || input.lastname) {
    const fullName = [input.firstname, input.lastname]
      .filter(Boolean)
      .join(' ');
    if (fullName) {
      slackMessage.blocks[1].fields?.push({
        type: 'mrkdwn',
        text: `*Nombre Completo:* ${fullName}`,
      });
    }
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

  if (input.page_url) {
    slackMessage.blocks[1].fields?.push({
      type: 'mrkdwn',
      text: `*Página:* <${input.page_url}|${input.page_title || 'Ver página'}>`,
    });
  }

  // Si hay muchos campos, agregar un bloque adicional
  if (
    slackMessage.blocks[1].fields &&
    slackMessage.blocks[1].fields.length > 6
  ) {
    const extraFields = slackMessage.blocks[1].fields.splice(6);
    slackMessage.blocks.push({
      type: 'section',
      fields: extraFields,
    });
  }

  // Agregar un divisor y un botón de acción si hay información del contacto
  if (input.email) {
    slackMessage.blocks.push({
      type: 'divider',
    } as any);

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
          style: 'primary',
          url: `https://app.hubspot.com/contacts/search?term=${encodeURIComponent(input.email)}`,
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
      action: 'send_slack_notification',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        email: input.email,
        form_name: input.form_name,
        channel: '#automations-alerts',
        blocks_count: slackMessage.blocks.length,
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
      action: 'send_slack_notification',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        email: input.email,
        form_name: input.form_name,
        webhook_url: webhookUrl.replace(/\/[^/]*$/, '/***'), // Ocultar token del webhook
      },
    });

    z.console.error('Error sending Slack notification:', error);
    throw error;
  }
};

/**
 * Configuración del create action para notificaciones de Slack
 */
const create: ZapierCreate = {
  key: 'slack_notification',
  noun: 'Slack Message',
  display: {
    label: 'Send Slack Notification',
    description: 'Sends a formatted notification to Slack using Block Kit',
    important: true,
  },
  operation: {
    perform: sendSlackNotification,
    inputFields: [
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        required: true,
        helpText: 'The email address from the form submission',
      },
      {
        key: 'form_name',
        label: 'Form Name',
        type: 'string',
        required: false,
        helpText: 'The name of the form that was submitted',
      },
      {
        key: 'form_id',
        label: 'Form ID',
        type: 'string',
        required: false,
        helpText:
          'The ID of the form that was submitted (fallback if no form_name)',
      },
      {
        key: 'submitted_at',
        label: 'Submitted At',
        type: 'datetime',
        required: false,
        helpText: 'When the form was submitted',
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
        key: 'page_url',
        label: 'Page URL',
        type: 'string',
        required: false,
        helpText: 'The URL of the page where the form was submitted',
      },
      {
        key: 'page_title',
        label: 'Page Title',
        type: 'string',
        required: false,
        helpText: 'The title of the page where the form was submitted',
      },
    ],
    sample: {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '📩 *Nuevo Form Submission*',
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
              text: '*Formulario:* Contact Form',
            },
            {
              type: 'mrkdwn',
              text: '*Fecha:* 2024-01-15T10:30:00Z',
            },
          ],
        },
      ],
      username: 'Zapier Integration',
      icon_emoji: ':zap:',
      channel: '#automations-alerts',
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
