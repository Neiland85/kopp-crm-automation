import { HubSpotContact, ZapierTrigger, ZapierZ, ZapierBundle } from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Interface para el contacto con lead score actualizado
 */
interface ContactWithScore extends HubSpotContact {
  id: string;
  lead_score: number;
  last_score_update?: string;
  updated_at: string;
}

/**
 * Obtiene contactos con lead_score actualizado recientemente
 */
const getUpdatedContactProperty = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<ContactWithScore[]> => {
  const apiKey = bundle.authData.hubspot_api_key;

  // Calcular timestamp para obtener solo actualizaciones recientes
  const since = new Date();
  since.setMinutes(since.getMinutes() - 15); // Últimos 15 minutos
  const sinceTimestamp = since.getTime();

  // Buscar contactos con lead_score actualizado recientemente
  const searchUrl = 'https://api.hubapi.com/crm/v3/objects/contacts/search';

  const searchRequest = {
    url: searchUrl,
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
              propertyName: 'lead_score',
              operator: 'HAS_PROPERTY',
            },
            {
              propertyName: 'hs_lastmodifieddate',
              operator: 'GTE',
              value: sinceTimestamp.toString(),
            },
          ],
        },
      ],
      sorts: [
        {
          propertyName: 'hs_lastmodifieddate',
          direction: 'DESCENDING',
        },
      ],
      properties: [
        'email',
        'firstname',
        'lastname',
        'lead_score',
        'last_score_update',
        'hs_lastmodifieddate',
        'company',
        'phone',
      ],
      limit: 100,
    },
  };

  try {
    const response = await withRetry(() => z.request(searchRequest), 3);
    const contacts = response.data?.results || [];

    // Filtrar solo contactos donde lead_score fue actualizado recientemente
    const updatedContacts = contacts.filter((contact: any) => {
      const lastModified = new Date(contact.properties.hs_lastmodifieddate);
      const scoreUpdateTime = contact.properties.last_score_update
        ? new Date(contact.properties.last_score_update)
        : new Date(0);

      // Verificar si lead_score fue actualizado después de last_score_update
      return lastModified > scoreUpdateTime;
    });

    // Log de la acción
    await logZapAction(z, {
      action: 'trigger_updated_contact_property',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        total_contacts: contacts.length,
        updated_contacts: updatedContacts.length,
        since_timestamp: sinceTimestamp,
      },
    });

    // Transformar datos para Zapier
    return updatedContacts.map((contact: any) => ({
      id: contact.id,
      email: contact.properties.email || '',
      firstname: contact.properties.firstname || '',
      lastname: contact.properties.lastname || '',
      lead_score: parseInt(contact.properties.lead_score) || 0,
      last_score_update: contact.properties.last_score_update || '',
      company: contact.properties.company || '',
      phone: contact.properties.phone || '',
      updated_at: contact.properties.hs_lastmodifieddate,
      raw_data: contact,
    }));
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'trigger_updated_contact_property',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        since_timestamp: sinceTimestamp,
      },
    });

    z.console.error('Error fetching updated contacts:', error);
    throw error;
  }
};

/**
 * Configuración del trigger para propiedades de contacto actualizadas
 */
const trigger: ZapierTrigger = {
  key: 'updated_contact_property',
  noun: 'Contact Property Update',
  display: {
    label: 'Updated Contact Property (Lead Score)',
    description:
      "Triggers when a contact's lead_score property is updated in HubSpot",
    important: true,
  },
  operation: {
    type: 'polling',
    perform: getUpdatedContactProperty,
    sample: {
      id: 'contact-123456',
      email: 'john.doe@example.com',
      firstname: 'John',
      lastname: 'Doe',
      lead_score: 75,
      last_score_update: '2024-01-15T09:00:00Z',
      company: 'Example Corp',
      phone: '+1234567890',
      updated_at: '2024-01-15T10:30:00Z',
    },
    outputFields: [
      { key: 'id', label: 'Contact ID', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'firstname', label: 'First Name', type: 'string' },
      { key: 'lastname', label: 'Last Name', type: 'string' },
      { key: 'lead_score', label: 'Lead Score', type: 'integer' },
      {
        key: 'last_score_update',
        label: 'Last Score Update',
        type: 'datetime',
      },
      { key: 'company', label: 'Company', type: 'string' },
      { key: 'phone', label: 'Phone', type: 'string' },
      { key: 'updated_at', label: 'Updated At', type: 'datetime' },
    ],
  },
};

export default trigger;
