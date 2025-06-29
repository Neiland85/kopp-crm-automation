import { HubSpotContact, ZapierCreate, ZapierZ, ZapierBundle } from '../types';
import {
  withRetry,
  logZapAction,
  mapFormFieldsToHubSpot,
} from '../utils/common';

/**
 * Crea o actualiza un contacto en HubSpot
 */
const createOrUpdateHubSpotContact = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<HubSpotContact> => {
  const apiKey = bundle.authData.hubspot_api_key;
  const input = bundle.inputData;

  // Mapear campos de entrada a propiedades de HubSpot
  const properties: Record<string, any> = {
    email: input.email,
    firstname: input.firstname || '',
    lastname: input.lastname || '',
  };

  // Agregar campos adicionales si están presentes
  if (input.form_name) {
    properties.last_form_submitted = input.form_name;
  }

  if (input.submitted_at) {
    properties.last_submission_date = input.submitted_at;
  }

  if (input.phone) {
    properties.phone = input.phone;
  }

  if (input.company) {
    properties.company = input.company;
  }

  // Si hay valores de formulario, mapearlos también
  if (input.form_values && Array.isArray(input.form_values)) {
    const mappedFields = mapFormFieldsToHubSpot(input.form_values);
    Object.assign(properties, mappedFields);
  }

  try {
    // Intentar crear el contacto primero
    const createUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
    const createRequest = {
      url: createUrl,
      method: 'POST' as const,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      json: {
        properties,
      },
    };

    let response;
    let isUpdate = false;

    try {
      response = await withRetry(() => z.request(createRequest), 3);
    } catch (createError: any) {
      // Si el contacto ya existe (error 409), intentar actualizarlo
      if (
        createError.status === 409 ||
        createError.message?.includes('CONTACT_EXISTS')
      ) {
        isUpdate = true;

        // Buscar el contacto por email
        const searchUrl = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
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
                    propertyName: 'email',
                    operator: 'EQ',
                    value: input.email,
                  },
                ],
              },
            ],
            properties: [
              'email',
              'firstname',
              'lastname',
              'phone',
              'company',
              'last_form_submitted',
              'last_submission_date',
            ],
          },
        };

        const searchResponse = await withRetry(
          () => z.request(searchRequest),
          3
        );
        const existingContact = searchResponse.data?.results?.[0];

        if (existingContact) {
          // Actualizar el contacto existente
          const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${existingContact.id}`;
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

          response = await withRetry(() => z.request(updateRequest), 3);
        } else {
          throw createError; // Re-lanzar el error original si no se puede encontrar el contacto
        }
      } else {
        throw createError; // Re-lanzar otros errores
      }
    }

    const contact = response.data;
    const contactData: HubSpotContact = {
      email: contact.properties.email,
      firstname: contact.properties.firstname,
      lastname: contact.properties.lastname,
      last_form_submitted: contact.properties.last_form_submitted,
      last_submission_date: contact.properties.last_submission_date,
      phone: contact.properties.phone,
      company: contact.properties.company,
    };

    // Log de la acción exitosa
    await logZapAction(z, {
      action: isUpdate ? 'update_hubspot_contact' : 'create_hubspot_contact',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        contact_id: contact.id,
        email: contactData.email,
        operation: isUpdate ? 'update' : 'create',
      },
    });

    return contactData;
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'create_or_update_hubspot_contact',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        email: input.email,
        properties,
      },
    });

    z.console.error('Error creating/updating HubSpot contact:', error);
    throw error;
  }
};

/**
 * Configuración del create action para contactos de HubSpot
 */
const create: ZapierCreate = {
  key: 'hubspot_contact',
  noun: 'Contact',
  display: {
    label: 'Create or Update HubSpot Contact',
    description: 'Creates a new contact in HubSpot or updates an existing one',
    important: true,
  },
  operation: {
    perform: createOrUpdateHubSpotContact,
    inputFields: [
      {
        key: 'email',
        label: 'Email',
        type: 'string',
        required: true,
        helpText: 'The email address of the contact',
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
        key: 'phone',
        label: 'Phone',
        type: 'string',
        required: false,
        helpText: 'The phone number of the contact',
      },
      {
        key: 'company',
        label: 'Company',
        type: 'string',
        required: false,
        helpText: 'The company name of the contact',
      },
      {
        key: 'form_name',
        label: 'Form Name',
        type: 'string',
        required: false,
        helpText:
          'The name of the form submitted (will be mapped to last_form_submitted)',
      },
      {
        key: 'submitted_at',
        label: 'Submitted At',
        type: 'datetime',
        required: false,
        helpText:
          'When the form was submitted (will be mapped to last_submission_date)',
      },
      {
        key: 'form_values',
        label: 'Form Values',
        type: 'text',
        required: false,
        helpText: 'Additional form values as JSON array (optional)',
      },
    ],
    sample: {
      email: 'john.doe@example.com',
      firstname: 'John',
      lastname: 'Doe',
      phone: '+1234567890',
      company: 'Example Corp',
      last_form_submitted: 'Contact Form',
      last_submission_date: '2024-01-15T10:30:00Z',
    },
    outputFields: [
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'firstname', label: 'First Name', type: 'string' },
      { key: 'lastname', label: 'Last Name', type: 'string' },
      { key: 'phone', label: 'Phone', type: 'string' },
      { key: 'company', label: 'Company', type: 'string' },
      {
        key: 'last_form_submitted',
        label: 'Last Form Submitted',
        type: 'string',
      },
      {
        key: 'last_submission_date',
        label: 'Last Submission Date',
        type: 'datetime',
      },
    ],
  },
};

export default create;
