import { ZapierCreate, ZapierZ, ZapierBundle } from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Interface para la respuesta de actualización de HubSpot
 */
interface HubSpotUpdateResponse {
  id: string;
  properties: {
    email: string;
    external_score: string;
    lastmodifieddate: string;
  };
  updatedAt: string;
}

/**
 * Actualiza el external_score de un contacto en HubSpot
 */
const updateHubSpotExternalScore = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<HubSpotUpdateResponse> => {
  const { email, external_score } = bundle.inputData;

  if (!email) {
    throw new Error('Email is required to update contact external_score');
  }

  if (external_score === undefined || external_score === null) {
    throw new Error('External score is required');
  }

  const apiKey = bundle.authData.hubspot_api_key;
  const scoreValue = parseInt(external_score.toString());

  try {
    // Primero buscar el contacto por email
    const searchRequest = {
      url: 'https://api.hubapi.com/crm/v3/objects/contacts/search',
      method: 'POST' as const,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      json: {
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: ['email', 'external_score', 'firstname', 'lastname'],
        limit: 1,
      },
    };

    const searchResponse = await withRetry(() => z.request(searchRequest), 3);
    const searchData = searchResponse.data;

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error(`Contact with email ${email} not found in HubSpot`);
    }

    const contactId = searchData.results[0].id;
    const currentContact = searchData.results[0];

    // Actualizar el contacto con el nuevo external_score
    const updateRequest = {
      url: `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      method: 'PATCH' as const,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      json: {
        properties: {
          external_score: scoreValue.toString(),
        },
      },
    };

    const updateResponse = await withRetry(() => z.request(updateRequest), 3);
    const updateData = updateResponse.data;

    // Preparar respuesta
    const result: HubSpotUpdateResponse = {
      id: updateData.id,
      properties: {
        email: email,
        external_score: scoreValue.toString(),
        lastmodifieddate: updateData.updatedAt,
      },
      updatedAt: updateData.updatedAt,
    };

    // Log de la acción exitosa
    await logZapAction(z, {
      action: 'update_hubspot_external_score',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        contact_id: contactId,
        email: email,
        external_score: scoreValue,
        previous_score: currentContact.properties?.external_score || 'not set',
      },
    });

    z.console.log(
      `Successfully updated external_score for contact ${email} to ${scoreValue}`
    );
    return result;
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'update_hubspot_external_score',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        email: email,
        external_score: scoreValue,
      },
    });

    z.console.error('Error updating HubSpot external score:', error);
    throw error;
  }
};

/**
 * Configuración del create para actualizar external_score en HubSpot
 */
const create: ZapierCreate = {
  key: 'update_hubspot_external_score',
  noun: 'HubSpot External Score Update',
  display: {
    label: 'Update HubSpot Contact External Score',
    description:
      'Updates the external_score property of a HubSpot contact identified by email',
    important: true,
  },
  operation: {
    perform: updateHubSpotExternalScore,
    inputFields: [
      {
        key: 'email',
        label: 'Contact Email',
        type: 'string',
        required: true,
        helpText: 'The email address of the contact to update',
      },
      {
        key: 'external_score',
        label: 'External Score',
        type: 'integer',
        required: true,
        helpText: 'The external score value to set for the contact',
      },
    ],
    sample: {
      id: '12345',
      properties: {
        email: 'john.doe@example.com',
        external_score: '75',
        lastmodifieddate: '2024-01-15T10:30:00Z',
      },
      updatedAt: '2024-01-15T10:30:00Z',
    },
    outputFields: [
      { key: 'id', label: 'Contact ID', type: 'string' },
      { key: 'properties.email', label: 'Email', type: 'string' },
      {
        key: 'properties.external_score',
        label: 'External Score',
        type: 'string',
      },
      {
        key: 'properties.lastmodifieddate',
        label: 'Last Modified Date',
        type: 'datetime',
      },
      { key: 'updatedAt', label: 'Updated At', type: 'datetime' },
    ],
  },
};

export default create;
