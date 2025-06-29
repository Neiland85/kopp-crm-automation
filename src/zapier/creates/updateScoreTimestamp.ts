import { ZapierCreate, ZapierZ, ZapierBundle } from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Interface para la respuesta de actualización de score
 */
interface ScoreUpdateResponse {
  contact_id: string;
  email: string;
  lead_score: number;
  last_score_update: string;
  updated_properties: string[];
}

/**
 * Actualiza el timestamp de last_score_update en HubSpot
 */
const updateScoreTimestamp = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<ScoreUpdateResponse> => {
  const apiKey = bundle.authData.hubspot_api_key;
  const input = bundle.inputData;

  const contactId = input.contact_id || input.id;
  const currentTimestamp = new Date().toISOString();

  if (!contactId) {
    throw new Error('Contact ID is required');
  }

  // Preparar propiedades a actualizar
  const properties: Record<string, any> = {
    last_score_update: currentTimestamp,
  };

  // Si se proporciona un nuevo lead_score, también actualizarlo
  if (input.lead_score !== undefined && input.lead_score !== null) {
    properties.lead_score = input.lead_score.toString();
  }

  const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;
  const updateRequest = {
    url: updateUrl,
    method: 'PATCH' as const,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    json: {
      properties,
    },
  };

  try {
    const response = await withRetry(() => z.request(updateRequest), 3);
    const contact = response.data;

    const result: ScoreUpdateResponse = {
      contact_id: contact.id,
      email: contact.properties.email || input.email || '',
      lead_score:
        parseInt(contact.properties.lead_score) || input.lead_score || 0,
      last_score_update:
        contact.properties.last_score_update || currentTimestamp,
      updated_properties: Object.keys(properties),
    };

    // Log de la acción exitosa
    await logZapAction(z, {
      action: 'update_score_timestamp',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        contact_id: contactId,
        email: result.email,
        lead_score: result.lead_score,
        updated_properties: result.updated_properties,
        timestamp_set: currentTimestamp,
      },
    });

    return result;
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'update_score_timestamp',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        contact_id: contactId,
        email: input.email,
        lead_score: input.lead_score,
        properties_attempted: Object.keys(properties),
      },
    });

    z.console.error('Error updating score timestamp:', error);
    throw error;
  }
};

/**
 * Configuración del create action para actualizar timestamp de score
 */
const create: ZapierCreate = {
  key: 'update_score_timestamp',
  noun: 'Score Timestamp',
  display: {
    label: 'Update Score Timestamp in HubSpot',
    description:
      'Updates the last_score_update property with current timestamp',
    important: true,
  },
  operation: {
    perform: updateScoreTimestamp,
    inputFields: [
      {
        key: 'contact_id',
        label: 'Contact ID',
        type: 'string',
        required: true,
        helpText: 'The HubSpot contact ID to update',
      },
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        required: false,
        helpText: 'Contact email for logging purposes',
      },
      {
        key: 'lead_score',
        label: 'Lead Score',
        type: 'integer',
        required: false,
        helpText: 'The current lead score (optional, for logging)',
      },
    ],
    sample: {
      contact_id: 'contact-123456',
      email: 'john.doe@example.com',
      lead_score: 75,
      last_score_update: '2024-01-15T10:30:00Z',
      updated_properties: ['last_score_update'],
    },
    outputFields: [
      { key: 'contact_id', label: 'Contact ID', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'lead_score', label: 'Lead Score', type: 'integer' },
      {
        key: 'last_score_update',
        label: 'Last Score Update',
        type: 'datetime',
      },
      {
        key: 'updated_properties',
        label: 'Updated Properties',
        type: 'string',
      },
    ],
  },
};

export default create;
