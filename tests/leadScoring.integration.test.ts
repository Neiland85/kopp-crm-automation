import App from '../src/zapier/index';
import { withRetry } from '../src/zapier/utils/common';

// Mock del logger
jest.mock('fs/promises');

// Helper para crear mock bundle
const createMockBundle = (overrides = {}) => ({
  authData: {
    hubspot_api_key: 'test-hubspot-api-key',
    slack_webhook_url: 'https://hooks.slack.com/services/test/webhook/url',
  },
  inputData: {},
  cleanedRequest: {},
  rawRequest: {},
  ...overrides,
});

// Mock del objeto z (Zapier)
const createMockZ = () => ({
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
  request: jest.fn(),
  JSON: {
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
  cursor: {
    get: jest.fn().mockReturnValue(null),
    store: jest.fn(),
  },
});

describe('Lead Scoring Integration Tests', () => {
  let mockZ: any;

  beforeEach(() => {
    mockZ = createMockZ();
    jest.clearAllMocks();
  });

  describe('Updated Contact Property Trigger', () => {
    test('should detect contacts with updated lead_score', async () => {
      // Mock de respuesta de HubSpot API
      const mockContactsResponse = {
        status: 200,
        data: {
          results: [
            {
              id: 'contact-123',
              properties: {
                email: 'john.doe@example.com',
                firstname: 'John',
                lastname: 'Doe',
                lead_score: '75',
                last_score_update: '2024-01-15T09:00:00Z',
                hs_lastmodifieddate: '2024-01-15T10:30:00Z',
                company: 'Example Corp',
                phone: '+1234567890',
              },
            },
            {
              id: 'contact-456',
              properties: {
                email: 'jane.smith@example.com',
                firstname: 'Jane',
                lastname: 'Smith',
                lead_score: '45',
                last_score_update: '2024-01-15T11:00:00Z',
                hs_lastmodifieddate: '2024-01-15T10:30:00Z', // Older than last_score_update
                company: 'Test Corp',
              },
            },
          ],
        },
      };

      mockZ.request.mockResolvedValue(mockContactsResponse);

      const bundle = createMockBundle();
      const trigger = App.triggers.updated_contact_property;

      const results = await trigger.operation.perform(mockZ, bundle);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Solo debería retornar contact-123 porque su score fue actualizado después de last_score_update
      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({
        id: 'contact-123',
        email: 'john.doe@example.com',
        lead_score: 75,
        firstname: 'John',
        lastname: 'Doe',
      });

      expect(mockZ.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.hubapi.com/crm/v3/objects/contacts/search',
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-hubspot-api-key',
          }),
        })
      );
    });

    test('should handle empty results gracefully', async () => {
      mockZ.request.mockResolvedValue({
        status: 200,
        data: { results: [] },
      });

      const bundle = createMockBundle();
      const trigger = App.triggers.updated_contact_property;

      const results = await trigger.operation.perform(mockZ, bundle);

      expect(results).toEqual([]);
    });

    test('should retry on network failures', async () => {
      mockZ.request
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValue({
          status: 200,
          data: { results: [] },
        });

      const bundle = createMockBundle();
      const trigger = App.triggers.updated_contact_property;

      const results = await trigger.operation.perform(mockZ, bundle);

      expect(results).toEqual([]);
      expect(mockZ.request).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });
  });

  describe('Update Score Timestamp Create Action', () => {
    test('should update last_score_update timestamp', async () => {
      const mockUpdateResponse = {
        status: 200,
        data: {
          id: 'contact-123',
          properties: {
            email: 'john.doe@example.com',
            lead_score: '75',
            last_score_update: '2024-01-15T12:00:00Z',
          },
        },
      };

      mockZ.request.mockResolvedValue(mockUpdateResponse);

      const bundle = createMockBundle({
        inputData: {
          contact_id: 'contact-123',
          email: 'john.doe@example.com',
          lead_score: 75,
        },
      });

      const create = App.creates.update_score_timestamp;
      const result = await create.operation.perform(mockZ, bundle);

      expect(result).toMatchObject({
        contact_id: 'contact-123',
        email: 'john.doe@example.com',
        lead_score: 75,
        updated_properties: ['last_score_update'],
      });

      expect(mockZ.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.hubapi.com/crm/v3/objects/contacts/contact-123',
          method: 'PATCH',
          json: expect.objectContaining({
            properties: expect.objectContaining({
              last_score_update: expect.any(String),
            }),
          }),
        })
      );
    });

    test('should fail without contact_id', async () => {
      const bundle = createMockBundle({
        inputData: {
          email: 'john.doe@example.com',
          lead_score: 75,
        },
      });

      const create = App.creates.update_score_timestamp;

      await expect(create.operation.perform(mockZ, bundle)).rejects.toThrow(
        'Contact ID is required'
      );
    });
  });

  describe('Send Scoring Notification Create Action', () => {
    test('should send notification for score >= 50', async () => {
      const mockSlackResponse = {
        status: 200,
        data: { ok: true },
      };

      mockZ.request.mockResolvedValue(mockSlackResponse);

      const bundle = createMockBundle({
        inputData: {
          email: 'john.doe@example.com',
          lead_score: 75,
          firstname: 'John',
          lastname: 'Doe',
          company: 'Example Corp',
          contact_id: 'contact-123',
        },
      });

      const create = App.creates.send_scoring_notification;
      const result = await create.operation.perform(mockZ, bundle);

      expect(result.blocks).toBeDefined();
      expect(result.blocks.length).toBeGreaterThan(0);
      expect(result.channel).toBe('#scoring-leads');

      // Verificar estructura del mensaje
      expect(result.blocks[0]).toMatchObject({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '📈 *Lead Score Actualizado*',
        },
      });

      expect(result.blocks[1].fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining('john.doe@example.com'),
          }),
          expect.objectContaining({
            text: expect.stringContaining('75'),
          }),
        ])
      );

      expect(mockZ.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://hooks.slack.com/services/test/webhook/url',
          method: 'POST',
          json: expect.objectContaining({
            blocks: expect.any(Array),
            channel: '#scoring-leads',
          }),
        })
      );
    });

    test('should skip notification for score < 50', async () => {
      const bundle = createMockBundle({
        inputData: {
          email: 'john.doe@example.com',
          lead_score: 35,
          firstname: 'John',
          lastname: 'Doe',
        },
      });

      const create = App.creates.send_scoring_notification;
      const result = (await create.operation.perform(mockZ, bundle)) as any;

      expect(result.skipped).toBe(true);
      expect(result.reason).toContain('below threshold');
      expect(mockZ.request).not.toHaveBeenCalled();
    });

    test('should include score level for high scores', async () => {
      const mockSlackResponse = {
        status: 200,
        data: { ok: true },
      };

      mockZ.request.mockResolvedValue(mockSlackResponse);

      const bundle = createMockBundle({
        inputData: {
          email: 'hot.lead@example.com',
          lead_score: 85,
          firstname: 'Hot',
          lastname: 'Lead',
        },
      });

      const create = App.creates.send_scoring_notification;
      const result = await create.operation.perform(mockZ, bundle);

      // Buscar el bloque que contiene "HOT LEAD"
      const scoreBlock = result.blocks.find((block: any) =>
        block.text?.text?.includes('🔥 *HOT LEAD*')
      );

      expect(scoreBlock).toBeDefined();
    });

    test('should retry on Slack API failures', async () => {
      mockZ.request
        .mockRejectedValueOnce(new Error('Slack API timeout'))
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockResolvedValue({
          status: 200,
          data: { ok: true },
        });

      const bundle = createMockBundle({
        inputData: {
          email: 'test@example.com',
          lead_score: 60,
        },
      });

      const create = App.creates.send_scoring_notification;
      const result = await create.operation.perform(mockZ, bundle);

      expect(result.blocks).toBeDefined();
      expect(mockZ.request).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration Workflow Tests', () => {
    test('should complete full lead scoring workflow', async () => {
      // Mock responses for the complete workflow
      const mockSearchResponse = {
        status: 200,
        data: {
          results: [
            {
              id: 'contact-123',
              properties: {
                email: 'workflow@example.com',
                firstname: 'Workflow',
                lastname: 'Test',
                lead_score: '65',
                last_score_update: '2024-01-15T09:00:00Z',
                hs_lastmodifieddate: '2024-01-15T10:30:00Z',
                company: 'Test Company',
              },
            },
          ],
        },
      };

      const mockUpdateResponse = {
        status: 200,
        data: {
          id: 'contact-123',
          properties: {
            email: 'workflow@example.com',
            lead_score: '65',
            last_score_update: '2024-01-15T12:00:00Z',
          },
        },
      };

      const mockSlackResponse = {
        status: 200,
        data: { ok: true },
      };

      // Step 1: Trigger - Get updated contacts
      mockZ.request.mockResolvedValueOnce(mockSearchResponse);

      const bundle = createMockBundle();
      const trigger = App.triggers.updated_contact_property;
      const contacts = await trigger.operation.perform(mockZ, bundle);

      expect(contacts.length).toBe(1);
      const contact = contacts[0];

      // Step 2: Update timestamp
      mockZ.request.mockResolvedValueOnce(mockUpdateResponse);

      const updateBundle = createMockBundle({
        inputData: {
          contact_id: contact.id,
          email: contact.email,
          lead_score: contact.lead_score,
        },
      });

      const updateCreate = App.creates.update_score_timestamp;
      const updateResult = await updateCreate.operation.perform(
        mockZ,
        updateBundle
      );

      expect(updateResult.contact_id).toBe('contact-123');

      // Step 3: Send notification (score >= 50)
      mockZ.request.mockResolvedValueOnce(mockSlackResponse);

      const notificationBundle = createMockBundle({
        inputData: {
          email: contact.email,
          lead_score: contact.lead_score,
          firstname: contact.firstname,
          lastname: contact.lastname,
          company: contact.company,
          contact_id: contact.id,
        },
      });

      const notificationCreate = App.creates.send_scoring_notification;
      const notificationResult = await notificationCreate.operation.perform(
        mockZ,
        notificationBundle
      );

      expect(notificationResult.blocks).toBeDefined();
      expect(notificationResult.channel).toBe('#scoring-leads');

      // Verify all API calls were made
      expect(mockZ.request).toHaveBeenCalledTimes(3);
    });
  });

  describe('Utility Function Tests', () => {
    test('withRetry should handle exponential backoff', async () => {
      const startTime = Date.now();
      let attempts = 0;

      const failingOperation = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Network failure');
        }
        return 'success';
      });

      const result = await withRetry(failingOperation, 3, 50); // 50ms base delay

      expect(result).toBe('success');
      expect(attempts).toBe(3);
      expect(failingOperation).toHaveBeenCalledTimes(3);

      // Verify exponential backoff timing (approximate)
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeGreaterThan(100); // At least 50ms + 100ms delays
    });

    test('withRetry should fail after max retries', async () => {
      const alwaysFailOperation = jest.fn(async () => {
        throw new Error('Persistent failure');
      });

      await expect(withRetry(alwaysFailOperation, 2, 10)).rejects.toThrow(
        'Persistent failure'
      );

      expect(alwaysFailOperation).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('App Configuration Tests', () => {
    test('should have correct trigger configuration', () => {
      const trigger = App.triggers.updated_contact_property;

      expect(trigger).toBeDefined();
      expect(trigger.key).toBe('updated_contact_property');
      expect(trigger.display.label).toBe(
        'Updated Contact Property (Lead Score)'
      );
      expect(trigger.operation.type).toBe('polling');
    });

    test('should have correct create configurations', () => {
      const updateCreate = App.creates.update_score_timestamp;
      const notificationCreate = App.creates.send_scoring_notification;

      expect(updateCreate.key).toBe('update_score_timestamp');
      expect(notificationCreate.key).toBe('send_scoring_notification');

      expect(updateCreate.display.label).toContain('Update Score Timestamp');
      expect(notificationCreate.display.label).toContain(
        'Lead Scoring Notification'
      );
    });

    test('should have authentication configuration', () => {
      expect(App.authentication).toBeDefined();
      expect(App.authentication.type).toBe('custom');
      expect(App.authentication.fields.length).toBeGreaterThan(0);

      const apiKeyField = App.authentication.fields.find(
        (f) => f.key === 'hubspot_api_key'
      );
      const webhookField = App.authentication.fields.find(
        (f) => f.key === 'slack_webhook_url'
      );

      expect(apiKeyField).toBeDefined();
      expect(webhookField).toBeDefined();
      expect(apiKeyField?.required).toBe(true);
      expect(webhookField?.required).toBe(true);
    });
  });
});
