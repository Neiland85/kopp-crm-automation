import { describe, it, expect, beforeAll, jest } from '@jest/globals';

// Importar las funciones de Zapier
import newGoogleSheetsLeadScoringTrigger from '../src/zapier/triggers/newGoogleSheetsLeadScoring';
import updateHubSpotExternalScoreCreate from '../src/zapier/creates/updateHubSpotExternalScore';
import sendHighScoreSlackAlertCreate from '../src/zapier/creates/sendHighScoreSlackAlert';

// Mock para request
const mockRequest = jest.fn();

// Mock para las utilidades comunes
jest.mock('../src/zapier/utils/common', () => ({
  withRetry: jest.fn(),
  logZapAction: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Importar los mocks después de la configuración
import { withRetry, logZapAction } from '../src/zapier/utils/common';
const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>;
const mockLogZapAction = logZapAction as jest.MockedFunction<
  typeof logZapAction
>;

/**
 * Test suite para la integración completa de Google Sheets Lead Scoring
 */
describe('Google Sheets Lead Scoring Integration', () => {
  const mockZapierZ = {
    console: {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
    errors: {
      Error: Error,
      RefreshAuthError: Error,
      HaltedError: Error,
    },
    request: mockRequest,
    JSON: {
      parse: JSON.parse,
      stringify: JSON.stringify,
    },
    cursor: {
      get: jest.fn().mockReturnValue(null),
      store: jest.fn(),
    },
    dehydrate: jest.fn(),
    stashFile: jest.fn(),
  } as any;

  const mockBundle = {
    authData: {
      hubspot_api_key: 'test-hubspot-key',
      slack_webhook_url: 'https://hooks.slack.com/test',
      google_access_token: 'test-google-token',
      google_spreadsheet_id: 'test-spreadsheet-id',
    },
    inputData: {},
    cleanedRequest: {},
    rawRequest: {},
    targetUrl: 'https://test.com',
  } as any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar el mock por defecto de withRetry para que ejecute la función pasada
    mockWithRetry.mockImplementation(async (fn: any) => {
      // Llamar a la función original (que es z.request en la mayoría de casos)
      return await fn();
    });
  });

  describe('Google Sheets Trigger', () => {
    it('should fetch new lead scoring rows from Google Sheets', async () => {
      // Usar timestamp actual para que las filas sean consideradas "nuevas"
      const currentTime = new Date();
      const recentTime = new Date(currentTime.getTime() - 5 * 60 * 1000); // 5 minutos atrás

      // Mock de respuesta de Google Sheets API
      const mockSheetsResponse = {
        status: 200,
        data: {
          values: [
            [
              'Email',
              'External Score',
              'Timestamp',
              'Name',
              'Company',
              'Source',
            ],
            [
              'john.doe@example.com',
              '75',
              recentTime.toISOString(),
              'John Doe',
              'Example Corp',
              'Website',
            ],
            [
              'jane.smith@example.com',
              '45',
              currentTime.toISOString(),
              'Jane Smith',
              'Test Inc',
              'Referral',
            ],
          ],
        },
      };

      (mockRequest as any).mockResolvedValueOnce(mockSheetsResponse);

      const result = await newGoogleSheetsLeadScoringTrigger.operation.perform(
        mockZapierZ,
        mockBundle
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        email: 'john.doe@example.com',
        external_score: 75,
        name: 'John Doe',
        company: 'Example Corp',
      });
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('sheets.googleapis.com'),
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-google-token',
          }),
        })
      );
    });

    it('should handle empty Google Sheets response', async () => {
      const mockEmptyResponse = {
        status: 200,
        data: { values: [] },
      };

      (mockRequest as any).mockResolvedValueOnce(mockEmptyResponse);

      const result = await newGoogleSheetsLeadScoringTrigger.operation.perform(
        mockZapierZ,
        mockBundle
      );

      expect(result).toHaveLength(0);
    });

    it('should handle Google Sheets API errors', async () => {
      (mockRequest as any).mockRejectedValueOnce(new Error('API Error'));

      await expect(
        newGoogleSheetsLeadScoringTrigger.operation.perform(
          mockZapierZ,
          mockBundle
        )
      ).rejects.toThrow('API Error');
    });
  });

  describe('HubSpot External Score Update', () => {
    it('should update external_score for existing contact', async () => {
      const inputData = {
        email: 'john.doe@example.com',
        external_score: 75,
      };

      // Mock search response
      const mockSearchResponse = {
        status: 200,
        data: {
          results: [
            {
              id: '12345',
              properties: {
                email: 'john.doe@example.com',
                external_score: '50',
              },
            },
          ],
        },
      };

      // Mock update response
      const mockUpdateResponse = {
        status: 200,
        data: {
          id: '12345',
          updatedAt: '2024-01-15T10:30:00Z',
          properties: {
            external_score: '75',
          },
        },
      };

      (mockRequest as any)
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockUpdateResponse);

      const bundleWithInput = { ...mockBundle, inputData };
      const result = await updateHubSpotExternalScoreCreate.operation.perform(
        mockZapierZ,
        bundleWithInput
      );

      expect(result).toMatchObject({
        id: '12345',
        properties: {
          email: 'john.doe@example.com',
          external_score: '75',
        },
      });

      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(mockRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: 'https://api.hubapi.com/crm/v3/objects/contacts/search',
          method: 'POST',
        })
      );
      expect(mockRequest).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: 'https://api.hubapi.com/crm/v3/objects/contacts/12345',
          method: 'PATCH',
        })
      );
    });

    it('should handle contact not found error', async () => {
      const inputData = {
        email: 'nonexistent@example.com',
        external_score: 75,
      };

      const mockSearchResponse = {
        status: 200,
        data: { results: [] },
      };

      (mockRequest as any).mockResolvedValueOnce(mockSearchResponse);

      const bundleWithInput = { ...mockBundle, inputData };

      await expect(
        updateHubSpotExternalScoreCreate.operation.perform(
          mockZapierZ,
          bundleWithInput
        )
      ).rejects.toThrow(
        'Contact with email nonexistent@example.com not found in HubSpot'
      );
    });

    it('should validate required input fields', async () => {
      const bundleWithInput = { ...mockBundle, inputData: {} };

      await expect(
        updateHubSpotExternalScoreCreate.operation.perform(
          mockZapierZ,
          bundleWithInput
        )
      ).rejects.toThrow('Email is required');
    });
  });

  describe('Slack High Score Alert', () => {
    it('should send alert for high scores (> 50)', async () => {
      const inputData = {
        email: 'john.doe@example.com',
        external_score: 75,
        name: 'John Doe',
        company: 'Example Corp',
      };

      const mockSlackResponse = {
        status: 200,
        content: 'ok',
      };

      (mockRequest as any).mockResolvedValueOnce(mockSlackResponse);

      const bundleWithInput = { ...mockBundle, inputData };
      const result = await sendHighScoreSlackAlertCreate.operation.perform(
        mockZapierZ,
        bundleWithInput
      );

      expect(result).toMatchObject({
        ok: true,
        channel: '#scoring-leads',
      });

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://hooks.slack.com/test',
          method: 'POST',
          json: expect.objectContaining({
            blocks: expect.arrayContaining([
              expect.objectContaining({
                type: 'header',
                text: expect.objectContaining({
                  text: '🚨 High Lead Score Alert',
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should skip alert for low scores (<= 50)', async () => {
      const inputData = {
        email: 'jane.smith@example.com',
        external_score: 30,
      };

      const bundleWithInput = { ...mockBundle, inputData };
      const result = await sendHighScoreSlackAlertCreate.operation.perform(
        mockZapierZ,
        bundleWithInput
      );

      expect(result).toMatchObject({
        ok: true,
        message: {
          text: 'Alert skipped - score not greater than 50',
        },
      });

      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should handle Slack webhook errors', async () => {
      const inputData = {
        email: 'john.doe@example.com',
        external_score: 75,
      };

      (mockRequest as any).mockResolvedValueOnce({
        status: 400,
        content: 'Invalid request',
      });

      const bundleWithInput = { ...mockBundle, inputData };

      await expect(
        sendHighScoreSlackAlertCreate.operation.perform(
          mockZapierZ,
          bundleWithInput
        )
      ).rejects.toThrow('Slack webhook returned: Invalid request');
    });
  });

  describe('End-to-End Integration Flow', () => {
    it('should complete full workflow: Google Sheets → HubSpot → Slack', async () => {
      // Usar timestamp actual para que las filas sean consideradas "nuevas"
      const currentTime = new Date();

      // 1. Simular trigger de Google Sheets
      const mockSheetsResponse = {
        status: 200,
        data: {
          values: [
            ['Email', 'External Score', 'Timestamp', 'Name', 'Company'],
            [
              'john.doe@example.com',
              '85',
              currentTime.toISOString(),
              'John Doe',
              'Example Corp',
            ],
          ],
        },
      };

      // 2. Mock respuestas de HubSpot
      const mockSearchResponse = {
        status: 200,
        data: {
          results: [
            {
              id: '12345',
              properties: {
                email: 'john.doe@example.com',
                external_score: '60',
              },
            },
          ],
        },
      };

      const mockUpdateResponse = {
        status: 200,
        data: {
          id: '12345',
          updatedAt: '2024-01-15T10:30:00Z',
          properties: { external_score: '85' },
        },
      };

      // 3. Mock respuesta de Slack
      const mockSlackResponse = {
        status: 200,
        content: 'ok',
      };

      (mockRequest as any)
        .mockResolvedValueOnce(mockSheetsResponse) // Google Sheets
        .mockResolvedValueOnce(mockSearchResponse) // HubSpot search
        .mockResolvedValueOnce(mockUpdateResponse) // HubSpot update
        .mockResolvedValueOnce(mockSlackResponse); // Slack webhook

      // Ejecutar el flujo completo
      // 1. Trigger de Google Sheets
      const triggerResult =
        await newGoogleSheetsLeadScoringTrigger.operation.perform(
          mockZapierZ,
          mockBundle
        );
      expect(triggerResult).toHaveLength(1);

      const leadData = triggerResult[0];
      expect(leadData.external_score).toBe(85);
      expect(leadData.email).toBe('john.doe@example.com');

      // 2. Actualizar HubSpot
      const hubspotBundle = { ...mockBundle, inputData: leadData };
      const hubspotResult =
        await updateHubSpotExternalScoreCreate.operation.perform(
          mockZapierZ,
          hubspotBundle
        );
      expect(hubspotResult.properties.external_score).toBe('85');

      // 3. Enviar alerta de Slack (score > 50)
      const slackBundle = { ...mockBundle, inputData: leadData };
      const slackResult = await sendHighScoreSlackAlertCreate.operation.perform(
        mockZapierZ,
        slackBundle
      );
      expect(slackResult.ok).toBe(true);

      // Verificar que se realizaron todas las llamadas
      expect(mockRequest).toHaveBeenCalledTimes(4);
    });

    it('should handle partial failures gracefully', async () => {
      // Simular fallo en HubSpot pero éxito en Google Sheets
      const mockSheetsResponse = {
        status: 200,
        data: {
          values: [
            ['Email', 'External Score'],
            ['test@example.com', '90'],
          ],
        },
      };

      (mockRequest as any)
        .mockResolvedValueOnce(mockSheetsResponse) // Google Sheets success
        .mockRejectedValueOnce(new Error('HubSpot API Error')); // HubSpot failure

      // 1. Google Sheets debería funcionar
      const triggerResult =
        await newGoogleSheetsLeadScoringTrigger.operation.perform(
          mockZapierZ,
          mockBundle
        );
      expect(triggerResult).toHaveLength(1);

      // 2. HubSpot debería fallar
      const hubspotBundle = { ...mockBundle, inputData: triggerResult[0] };
      await expect(
        updateHubSpotExternalScoreCreate.operation.perform(
          mockZapierZ,
          hubspotBundle
        )
      ).rejects.toThrow('HubSpot API Error');
    });
  });
});
