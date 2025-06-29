import { version as platformVersion } from 'zapier-platform-core';
import { version } from '../../package.json';

// Importar triggers y creates
import newFormSubmissionTrigger from './triggers/newFormSubmission';
import pageViewTrigger from './triggers/pageView';
import updatedContactPropertyTrigger from './triggers/updatedContactProperty';
import newGoogleSheetsLeadScoringTrigger from './triggers/newGoogleSheetsLeadScoring';
import hubspotContactCreate from './creates/hubspotContact';
import slackNotificationCreate from './creates/slackNotification';
import updateScoreTimestampCreate from './creates/updateScoreTimestamp';
import sendScoringNotificationCreate from './creates/sendScoringNotification';
import updateHubSpotExternalScoreCreate from './creates/updateHubSpotExternalScore';
import sendHighScoreSlackAlertCreate from './creates/sendHighScoreSlackAlert';

// Configuración principal de la app Zapier
const App = {
  // Versión de la plataforma Zapier
  version,
  platformVersion,

  // Configuración de autenticación
  authentication: {
    type: 'custom',
    fields: [
      {
        computed: false,
        key: 'hubspot_api_key',
        required: true,
        label: 'HubSpot API Key',
        type: 'string',
        helpText: 'Your HubSpot private app access token',
      },
      {
        computed: false,
        key: 'slack_webhook_url',
        required: true,
        label: 'Slack Webhook URL',
        type: 'string',
        helpText: 'Your Slack incoming webhook URL for #automations-alerts',
      },
      {
        computed: false,
        key: 'google_access_token',
        required: false,
        label: 'Google Sheets Access Token',
        type: 'string',
        helpText: 'Your Google OAuth2 access token for Google Sheets API',
      },
      {
        computed: false,
        key: 'google_spreadsheet_id',
        required: false,
        label: 'Google Spreadsheet ID',
        type: 'string',
        helpText:
          'The ID of your Google Spreadsheet containing the Lead Scoring sheet',
      },
    ],
    test: {
      url: 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
      method: 'GET',
      headers: {
        Authorization: 'Bearer {{bundle.authData.hubspot_api_key}}',
      },
    },
  },

  // Triggers disponibles
  triggers: {
    [newFormSubmissionTrigger.key]: newFormSubmissionTrigger,
    [pageViewTrigger.key]: pageViewTrigger,
    [updatedContactPropertyTrigger.key]: updatedContactPropertyTrigger,
    [newGoogleSheetsLeadScoringTrigger.key]: newGoogleSheetsLeadScoringTrigger,
  },

  // Creates (acciones) disponibles
  creates: {
    [hubspotContactCreate.key]: hubspotContactCreate,
    [slackNotificationCreate.key]: slackNotificationCreate,
    [updateScoreTimestampCreate.key]: updateScoreTimestampCreate,
    [sendScoringNotificationCreate.key]: sendScoringNotificationCreate,
    [updateHubSpotExternalScoreCreate.key]: updateHubSpotExternalScoreCreate,
    [sendHighScoreSlackAlertCreate.key]: sendHighScoreSlackAlertCreate,
  },

  // Configuración de la app
  beforeRequest: [
    // Middleware para agregar headers comunes
    (request: any, z: any, bundle: any) => {
      if (request.url.includes('hubapi.com')) {
        request.headers = request.headers || {};
        request.headers['Authorization'] =
          `Bearer ${bundle.authData.hubspot_api_key}`;
        request.headers['Content-Type'] = 'application/json';
      }
      return request;
    },
  ],

  afterResponse: [
    // Middleware para manejar errores HTTP
    (response: any, z: any) => {
      if (response.status >= 400) {
        const error = {
          status: response.status,
          message: response.content || 'Unknown error',
          url: response.request.url,
        };

        // Log del error
        z.console.error('HTTP Error:', error);

        // Reintentos para errores 5xx
        if (response.status >= 500) {
          throw new z.errors.RefreshAuthError('Server error, will retry');
        }

        throw new z.errors.Error(`HTTP ${response.status}: ${error.message}`);
      }
      return response;
    },
  ],
};

export default App;
