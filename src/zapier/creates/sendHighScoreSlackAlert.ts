import {
  ZapierCreate,
  ZapierZ,
  ZapierBundle,
  SlackMessage,
  SlackBlock,
} from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Interface para la respuesta de Slack
 */
interface SlackResponse {
  ok: boolean;
  channel: string;
  ts: string;
  message: {
    text: string;
    ts: string;
  };
}

/**
 * Envía alerta a Slack cuando external_score > 50
 */
const sendHighScoreSlackAlert = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<SlackResponse> => {
  const { email, external_score, name, company, source } = bundle.inputData;

  if (!email) {
    throw new Error('Email is required to send Slack alert');
  }

  if (external_score === undefined || external_score === null) {
    throw new Error('External score is required');
  }

  const scoreValue = parseInt(external_score.toString());

  // Solo enviar alerta si el score es mayor a 50
  if (scoreValue <= 50) {
    z.console.log(
      `External score ${scoreValue} is not greater than 50, skipping Slack alert`
    );
    return {
      ok: true,
      channel: '#scoring-leads',
      ts: new Date().getTime().toString(),
      message: {
        text: 'Alert skipped - score not greater than 50',
        ts: new Date().getTime().toString(),
      },
    };
  }

  const webhookUrl = bundle.authData.slack_webhook_url;

  // Construir el mensaje con Block Kit
  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 High Lead Score Alert',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `A new lead with a high external score has been detected!`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Email:*\n${email}`,
        },
        {
          type: 'mrkdwn',
          text: `*External Score:*\n${scoreValue}`,
        },
      ],
    },
  ];

  // Agregar campos adicionales si están disponibles
  if (name || company || source) {
    const additionalFields: Array<{ type: string; text: string }> = [];

    if (name) {
      additionalFields.push({
        type: 'mrkdwn',
        text: `*Name:*\n${name}`,
      });
    }

    if (company) {
      additionalFields.push({
        type: 'mrkdwn',
        text: `*Company:*\n${company}`,
      });
    }

    if (source) {
      additionalFields.push({
        type: 'mrkdwn',
        text: `*Source:*\n${source}`,
      });
    }

    if (additionalFields.length > 0) {
      blocks.push({
        type: 'section',
        fields: additionalFields,
      });
    }
  }

  // Agregar contexto con timestamp
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: {
          type: 'mrkdwn',
          text: `🕐 Detected at ${new Date().toLocaleString()}`,
        },
      },
    ],
  });

  // Agregar botones de acción
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View in HubSpot',
          emoji: true,
        },
        style: 'primary',
        url: `https://app.hubspot.com/contacts/search?query=${encodeURIComponent(email)}`,
      },
    ],
  });

  const slackMessage: SlackMessage = {
    blocks: blocks,
    username: 'Lead Scoring Bot',
    icon_emoji: ':chart_with_upwards_trend:',
    channel: '#scoring-leads',
  };

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

    // Slack webhook devuelve texto plano 'ok' en caso de éxito
    const isSuccess = response.content === 'ok' || response.status === 200;

    if (!isSuccess) {
      throw new Error(
        `Slack webhook returned: ${response.content || 'Unknown error'}`
      );
    }

    const result: SlackResponse = {
      ok: true,
      channel: '#scoring-leads',
      ts: new Date().getTime().toString(),
      message: {
        text: `High score alert sent for ${email}`,
        ts: new Date().getTime().toString(),
      },
    };

    // Log de la acción exitosa
    await logZapAction(z, {
      action: 'send_high_score_slack_alert',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        email: email,
        external_score: scoreValue,
        name: name || '',
        company: company || '',
        source: source || '',
        channel: '#scoring-leads',
      },
    });

    z.console.log(
      `Successfully sent high score alert to Slack for ${email} (score: ${scoreValue})`
    );
    return result;
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'send_high_score_slack_alert',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        email: email,
        external_score: scoreValue,
        channel: '#scoring-leads',
      },
    });

    z.console.error('Error sending high score Slack alert:', error);
    throw error;
  }
};

/**
 * Configuración del create para enviar alertas de Slack para scores altos
 */
const create: ZapierCreate = {
  key: 'send_high_score_slack_alert',
  noun: 'High Score Slack Alert',
  display: {
    label: 'Send High Score Alert to Slack',
    description:
      'Sends an alert to #scoring-leads Slack channel when external_score > 50',
    important: true,
  },
  operation: {
    perform: sendHighScoreSlackAlert,
    inputFields: [
      {
        key: 'email',
        label: 'Contact Email',
        type: 'string',
        required: true,
        helpText: 'The email address of the contact',
      },
      {
        key: 'external_score',
        label: 'External Score',
        type: 'integer',
        required: true,
        helpText: 'The external score value (alert sent only if > 50)',
      },
      {
        key: 'name',
        label: 'Contact Name',
        type: 'string',
        required: false,
        helpText: 'The name of the contact (optional)',
      },
      {
        key: 'company',
        label: 'Company',
        type: 'string',
        required: false,
        helpText: 'The company of the contact (optional)',
      },
      {
        key: 'source',
        label: 'Source',
        type: 'string',
        required: false,
        helpText: 'The source of the lead (optional)',
      },
    ],
    sample: {
      ok: true,
      channel: '#scoring-leads',
      ts: '1642248600000',
      message: {
        text: 'High score alert sent for john.doe@example.com',
        ts: '1642248600000',
      },
    },
    outputFields: [
      { key: 'ok', label: 'Success', type: 'boolean' },
      { key: 'channel', label: 'Channel', type: 'string' },
      { key: 'ts', label: 'Timestamp', type: 'string' },
      { key: 'message.text', label: 'Message Text', type: 'string' },
      { key: 'message.ts', label: 'Message Timestamp', type: 'string' },
    ],
  },
};

export default create;
