import {
  HubSpotFormSubmission,
  ZapierTrigger,
  ZapierZ,
  ZapierBundle,
} from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Obtiene las nuevas entregas de formularios de HubSpot
 */
const getNewFormSubmissions = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<HubSpotFormSubmission[]> => {
  const apiKey = bundle.authData.hubspot_api_key;

  // Calcular timestamp para obtener solo entregas recientes
  const since = new Date();
  since.setMinutes(since.getMinutes() - 15); // Últimos 15 minutos
  const sinceTimestamp = since.getTime();

  const url = `https://api.hubapi.com/form-integrations/v1/submissions/forms`;

  const request = {
    url,
    method: 'GET' as const,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    params: {
      limit: 100,
      after: sinceTimestamp.toString(),
    },
  };

  try {
    const response = await withRetry(() => z.request(request), 3);
    const submissions = response.data?.results || [];

    // Log de la acción
    await logZapAction(z, {
      action: 'trigger_new_form_submission',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        submissions_count: submissions.length,
        since_timestamp: sinceTimestamp,
      },
    });

    // Transformar datos para Zapier
    return submissions.map((submission: any) => ({
      id: submission.submissionId || submission.id,
      form_id: submission.formId,
      portal_id: submission.portalId,
      submitted_at: submission.submittedAt,
      page_url: submission.pageUrl,
      page_title: submission.pageTitle,
      values: submission.values || [],
      contact_email:
        submission.values?.find((v: any) => v.name === 'email')?.value || '',
      contact_firstname:
        submission.values?.find((v: any) => v.name === 'firstname')?.value ||
        '',
      contact_lastname:
        submission.values?.find((v: any) => v.name === 'lastname')?.value || '',
      contact_phone:
        submission.values?.find((v: any) => v.name === 'phone')?.value || '',
      contact_company:
        submission.values?.find((v: any) => v.name === 'company')?.value || '',
      raw_data: submission,
    }));
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'trigger_new_form_submission',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        since_timestamp: sinceTimestamp,
      },
    });

    z.console.error('Error fetching form submissions:', error);
    throw error;
  }
};

/**
 * Configuración del trigger para nuevas entregas de formulario
 */
const trigger: ZapierTrigger = {
  key: 'new_form_submission',
  noun: 'Form Submission',
  display: {
    label: 'New Form Submission',
    description: 'Triggers when a new form is submitted in HubSpot',
    important: true,
  },
  operation: {
    type: 'polling',
    perform: getNewFormSubmissions,
    sample: {
      id: 'sample-submission-123',
      form_id: 'sample-form-456',
      portal_id: '12345678',
      submitted_at: '2024-01-15T10:30:00Z',
      page_url: 'https://example.com/contact',
      page_title: 'Contact Us - Example Company',
      values: [
        { name: 'email', value: 'john.doe@example.com' },
        { name: 'firstname', value: 'John' },
        { name: 'lastname', value: 'Doe' },
      ],
      contact_email: 'john.doe@example.com',
      contact_firstname: 'John',
      contact_lastname: 'Doe',
      contact_phone: '+1234567890',
      contact_company: 'Example Corp',
    },
    outputFields: [
      { key: 'id', label: 'Submission ID', type: 'string' },
      { key: 'form_id', label: 'Form ID', type: 'string' },
      { key: 'portal_id', label: 'Portal ID', type: 'string' },
      { key: 'submitted_at', label: 'Submitted At', type: 'datetime' },
      { key: 'page_url', label: 'Page URL', type: 'string' },
      { key: 'page_title', label: 'Page Title', type: 'string' },
      { key: 'contact_email', label: 'Contact Email', type: 'string' },
      { key: 'contact_firstname', label: 'Contact First Name', type: 'string' },
      { key: 'contact_lastname', label: 'Contact Last Name', type: 'string' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'string' },
      { key: 'contact_company', label: 'Contact Company', type: 'string' },
    ],
  },
};

export default trigger;
