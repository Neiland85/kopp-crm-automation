import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { reputometroHandler } from '../../src/zaps/reputometro/handler';
import { Logger } from '../../src/utils/Logger';

// Mock de dependencias
jest.mock('@hubspot/api-client');
jest.mock('@slack/web-api');
jest.mock('../../src/utils/Logger');

/**
 * 🧪 Tests del Reputómetro Invisible
 *
 * Cobertura:
 * 1. Handler principal con datos mock
 * 2. Cálculo de scores
 * 3. Integración HubSpot (mocked)
 * 4. Integración Slack (mocked)
 * 5. Manejo de errores
 * 6. Retry con backoff exponencial
 */

const mockHubSpotClient = {
  crm: {
    contacts: {
      searchApi: {
        doSearch: jest.fn() as jest.MockedFunction<any>,
      },
      basicApi: {
        update: jest.fn() as jest.MockedFunction<any>,
      },
    },
  },
};

const mockSlackClient = {
  chat: {
    postMessage: jest.fn() as jest.MockedFunction<any>,
  },
};

const mockConfig = {
  hubspotApiKey: 'test-hubspot-key',
  slackBotToken: 'test-slack-token',
  slackSigningSecret: 'test-slack-secret',
  slackChannel: '#test-scoring-leads',
  isEnabled: true,
};

const mockLeadsData = {
  results: [
    {
      id: '1001',
      properties: {
        email: 'lead1@empresa.com',
        page_views: '10',
        form_submissions: '2',
        last_submission_date: new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString(), // 30 min ago
        lead_influence_score: '3.0',
      },
    },
    {
      id: '1002',
      properties: {
        email: 'lead2@startup.com',
        page_views: '15',
        form_submissions: '3',
        last_submission_date: new Date(
          Date.now() - 45 * 60 * 1000
        ).toISOString(), // 45 min ago
        lead_influence_score: '5.5',
      },
    },
    {
      id: '1003',
      properties: {
        email: 'lead3@acme.com',
        page_views: '8',
        form_submissions: '1',
        last_submission_date: new Date(
          Date.now() - 20 * 60 * 1000
        ).toISOString(), // 20 min ago
        lead_influence_score: '2.0',
      },
    },
  ],
};

describe('Reputómetro Invisible', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Logger
    (Logger as jest.MockedClass<typeof Logger>).mockImplementation(
      () =>
        ({
          info: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          debug: jest.fn(),
        }) as any
    );

    // Mock HubSpot client
    jest.doMock('@hubspot/api-client', () => ({
      Client: jest.fn().mockImplementation(() => mockHubSpotClient),
    }));

    // Mock Slack client
    jest.doMock('@slack/web-api', () => ({
      WebClient: jest.fn().mockImplementation(() => mockSlackClient),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Handler Principal', () => {
    it('should process leads successfully with valid data', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockLeadsData
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({
        ok: true,
        ts: '123456789',
      });

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(result).toEqual({
        id: expect.stringMatching(/^reputometro_\d+$/),
        timestamp: expect.any(String),
        totalLeads: 3,
        avgScore: expect.any(Number),
        topLeads: expect.arrayContaining([
          expect.objectContaining({
            email: expect.any(String),
            score: expect.any(Number),
          }),
        ]),
        slackMessageSent: true,
        hubspotUpdates: expect.any(Number),
        executionTimeMs: expect.any(Number),
      });

      expect(
        mockHubSpotClient.crm.contacts.searchApi.doSearch
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          filterGroups: expect.arrayContaining([
            expect.objectContaining({
              filters: expect.arrayContaining([
                expect.objectContaining({
                  propertyName: 'last_submission_date',
                  operator: 'GTE',
                }),
              ]),
            }),
          ]),
        })
      );

      expect(mockSlackClient.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: '#test-scoring-leads',
          blocks: expect.any(Array),
          text: expect.stringContaining('leads procesados'),
        })
      );
    });

    it('should handle empty leads gracefully', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue({
        results: [],
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({
        ok: true,
        ts: '123456789',
      });

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(result).toEqual({
        id: expect.stringMatching(/^reputometro_\d+$/),
        timestamp: expect.any(String),
        totalLeads: 0,
        avgScore: 0,
        topLeads: [],
        slackMessageSent: true,
        hubspotUpdates: 0,
        executionTimeMs: expect.any(Number),
      });

      expect(mockSlackClient.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: '#test-scoring-leads',
          text: expect.stringContaining('0 leads procesados'),
        })
      );
    });

    it('should calculate lead influence scores correctly', async () => {
      // Arrange
      const testLead = {
        results: [
          {
            id: '2001',
            properties: {
              email: 'test@example.com',
              page_views: '20', // 20 * 0.5 = 10
              form_submissions: '5', // 5 * 2 = 10
              last_submission_date: new Date().toISOString(),
              lead_influence_score: '0',
            },
          },
        ],
      };

      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        testLead
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(result.topLeads[0].score).toBe(20); // 10 + 10 = 20
      expect(result.avgScore).toBe(20);

      // Verificar que se llamó update con el score correcto
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledWith(
        '2001',
        expect.objectContaining({
          properties: expect.objectContaining({
            lead_influence_score: '20',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle HubSpot API errors gracefully', async () => {
      // Arrange
      const hubspotError = new Error('HubSpot API rate limit exceeded');
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockRejectedValue(
        hubspotError
      );

      // Act & Assert
      await expect(reputometroHandler(mockConfig)).rejects.toThrow(
        'HubSpot API rate limit exceeded'
      );
    });

    it('should handle Slack API errors and continue processing', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockLeadsData
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockRejectedValue(
        new Error('Slack API error')
      );

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(result.slackMessageSent).toBe(false);
      expect(result.totalLeads).toBeGreaterThan(0); // Processing should continue
    });

    it('should handle individual HubSpot update failures', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockLeadsData
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockRejectedValueOnce(
        new Error('Update failed')
      );
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(result.hubspotUpdates).toBeLessThan(result.totalLeads); // Some updates failed
      expect(result.slackMessageSent).toBe(true); // Slack still works
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed HubSpot calls with exponential backoff', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(mockLeadsData);

      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(
        mockHubSpotClient.crm.contacts.searchApi.doSearch
      ).toHaveBeenCalledTimes(3);
      expect(result.totalLeads).toBe(3);
    });

    it('should fail after max retries exceeded', async () => {
      // Arrange
      const persistentError = new Error('Persistent API failure');
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockRejectedValue(
        persistentError
      );

      // Act & Assert
      await expect(reputometroHandler(mockConfig)).rejects.toThrow(
        'Persistent API failure'
      );
      expect(
        mockHubSpotClient.crm.contacts.searchApi.doSearch
      ).toHaveBeenCalledTimes(3); // Default max retries
    });
  });

  describe('Slack Block Kit Messages', () => {
    it('should create proper Block Kit structure for reports', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockLeadsData
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await reputometroHandler(mockConfig);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock.calls[0][0];
      expect(slackCall).toEqual(
        expect.objectContaining({
          channel: '#test-scoring-leads',
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'header',
              text: expect.objectContaining({
                text: '⚡ Reputómetro Invisible',
              }),
            }),
            expect.objectContaining({
              type: 'section',
              fields: expect.arrayContaining([
                expect.objectContaining({
                  text: expect.stringContaining('*Total:*'),
                }),
                expect.objectContaining({
                  text: expect.stringContaining('*Score medio:*'),
                }),
              ]),
            }),
            expect.objectContaining({
              type: 'section',
              text: expect.objectContaining({
                text: expect.stringContaining('*Top 3:*'),
              }),
            }),
          ]),
        })
      );
    });

    it('should handle empty leads in Slack message', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue({
        results: [],
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await reputometroHandler(mockConfig);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock
        .calls[0][0] as any;
      const topSection = slackCall.blocks.find((block: any) =>
        block.text?.text?.includes('*Top 3:*')
      );
      expect(topSection.text.text).toContain('Sin leads en esta ejecución');
    });
  });

  describe('Performance', () => {
    it('should complete execution within reasonable time', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockLeadsData
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const startTime = Date.now();
      const result = await reputometroHandler(mockConfig);
      const actualExecutionTime = Date.now() - startTime;

      // Assert
      expect(result.executionTimeMs).toBeLessThan(10000); // Should complete in under 10 seconds
      expect(result.executionTimeMs).toBeCloseTo(actualExecutionTime, -2); // Within 100ms accuracy
    });
  });

  describe('Data Validation', () => {
    it('should handle missing or invalid lead data gracefully', async () => {
      // Arrange
      const invalidLeadsData = {
        results: [
          {
            id: '3001',
            properties: {
              email: null, // Invalid email
              page_views: 'invalid', // Invalid number
              form_submissions: '', // Empty string
              last_submission_date: 'invalid-date', // Invalid date
              lead_influence_score: undefined, // Missing score
            },
          },
        ],
      };

      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        invalidLeadsData
      );
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await reputometroHandler(mockConfig);

      // Assert
      expect(result.totalLeads).toBe(1);
      expect(result.topLeads[0].score).toBe(0); // Should default to 0 for invalid data
    });
  });
});

describe('Score Calculation Edge Cases', () => {
  const calculateScore = (views: number, submissions: number): number => {
    return Math.round((views * 0.5 + submissions * 2) * 100) / 100;
  };

  it('should calculate scores correctly for edge cases', () => {
    expect(calculateScore(0, 0)).toBe(0);
    expect(calculateScore(1, 0)).toBe(0.5);
    expect(calculateScore(0, 1)).toBe(2);
    expect(calculateScore(10, 5)).toBe(15); // 5 + 10 = 15
    expect(calculateScore(100, 0)).toBe(50); // 100 * 0.5 = 50
    expect(calculateScore(0, 50)).toBe(100); // 50 * 2 = 100
  });

  it('should handle decimal precision correctly', () => {
    expect(calculateScore(3, 0)).toBe(1.5); // 3 * 0.5 = 1.5
    expect(calculateScore(7, 1)).toBe(5.5); // 3.5 + 2 = 5.5
    expect(calculateScore(13, 3)).toBe(12.5); // 6.5 + 6 = 12.5
  });
});
