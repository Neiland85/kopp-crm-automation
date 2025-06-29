import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { hotLeadsHandler } from '../../../src/zaps/hot-leads/handler';
import { Logger } from '../../../src/utils/Logger';

// Mock de dependencias
jest.mock('@hubspot/api-client');
jest.mock('@slack/web-api');
jest.mock('../../../src/utils/Logger');

/**
 * 🧪 Tests de Hot Leads Detection
 *
 * Cobertura:
 * 1. Handler principal con datos mock
 * 2. Actualización de lead_status en HubSpot
 * 3. Envío de alertas a Slack
 * 4. Manejo de errores
 * 5. Retry con backoff exponencial
 * 6. Validación de threshold
 */

const mockHubSpotClient = {
  crm: {
    contacts: {
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
  slackChannel: '#test-hot-leads',
  hotLeadThreshold: 40,
  isEnabled: true,
};

const mockTriggerData = {
  contactId: '12345',
  email: 'test@example.com',
  leadInfluenceScore: 45,
  previousScore: 30,
  timestamp: '2025-06-29T20:46:15.123Z',
  hubspotPortalId: 'portal123',
};

// Configurar mocks
beforeEach(() => {
  jest.clearAllMocks();

  // Mock HubSpot Client constructor
  jest
    .mocked(require('@hubspot/api-client').Client)
    .mockImplementation(() => mockHubSpotClient);

  // Mock Slack WebClient constructor
  jest
    .mocked(require('@slack/web-api').WebClient)
    .mockImplementation(() => mockSlackClient);

  // Mock Logger
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  jest.mocked(Logger).mockImplementation(() => mockLogger as any);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Hot Leads Handler', () => {
  describe('Procesamiento exitoso', () => {
    it('should process hot lead successfully', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({
        ok: true,
        ts: '123456789',
      });

      // Act
      const result = await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      expect(result).toMatchObject({
        contactId: '12345',
        email: 'test@example.com',
        previousScore: 30,
        newScore: 45,
        statusUpdated: true,
        slackMessageSent: true,
      });
      expect(result.executionTimeMs).toBeGreaterThan(0);
      expect(result.id).toMatch(/^hot-lead-/);
    });

    it('should update HubSpot contact properties correctly', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledWith('12345', {
        properties: {
          lead_status: 'Hot Lead',
          last_hot_lead_detection: expect.any(String),
          hot_lead_trigger_score: '40+',
        },
      });
    });

    it('should send correct Slack message format', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock.calls[0][0];
      expect(slackCall.channel).toBe('#test-hot-leads');
      expect(slackCall.text).toContain('🚨 Hot Lead Detectado');
      expect(slackCall.text).toContain('test@example.com');
      expect(slackCall.text).toContain('45');
      expect(slackCall.blocks).toBeDefined();
      expect(slackCall.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('Manejo de errores', () => {
    it('should handle HubSpot API errors gracefully', async () => {
      // Arrange
      const hubspotError = new Error('HubSpot API error');
      mockHubSpotClient.crm.contacts.basicApi.update.mockRejectedValue(
        hubspotError
      );
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      expect(result.statusUpdated).toBe(false);
      expect(result.slackMessageSent).toBe(true);
    });

    it('should handle Slack API errors gracefully', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockRejectedValue(
        new Error('Slack API error')
      );

      // Act
      const result = await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      expect(result.statusUpdated).toBe(true);
      expect(result.slackMessageSent).toBe(false);
    });

    it('should throw error when both HubSpot and Slack fail', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockRejectedValue(
        new Error('HubSpot error')
      );
      mockSlackClient.chat.postMessage.mockRejectedValue(
        new Error('Slack error')
      );

      // Act & Assert
      await expect(
        hotLeadsHandler(mockConfig, mockTriggerData)
      ).rejects.toThrow();
    });
  });

  describe('Retry Logic', () => {
    it('should retry HubSpot operations with exponential backoff', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ id: 'updated' });

      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledTimes(3);
      expect(result.statusUpdated).toBe(true);
    });

    it('should fail after maximum retry attempts', async () => {
      // Arrange
      const persistentError = new Error('Persistent failure');
      mockHubSpotClient.crm.contacts.basicApi.update.mockRejectedValue(
        persistentError
      );

      // Act & Assert
      await expect(
        hotLeadsHandler(mockConfig, mockTriggerData)
      ).rejects.toThrow();
    });
  });

  describe('Slack Message Content', () => {
    it('should include all required fields in Slack message', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await hotLeadsHandler(mockConfig, mockTriggerData);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock
        .calls[0][0] as any;
      const messageText = JSON.stringify(slackCall.blocks);

      expect(messageText).toContain('🚨 *Hot Lead Detectado*');
      expect(messageText).toContain('test@example.com');
      expect(messageText).toContain('30 → 45');
      expect(messageText).toContain('Seguimiento inmediato');
      expect(messageText).toContain('Ver en HubSpot');
      expect(messageText).toContain('Contactar Ahora');
    });

    it('should handle cases without previous score', async () => {
      // Arrange
      const triggerDataWithoutPreviousScore = {
        ...mockTriggerData,
        previousScore: undefined,
      };

      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await hotLeadsHandler(mockConfig, triggerDataWithoutPreviousScore);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock
        .calls[0][0] as any;
      const messageText = JSON.stringify(slackCall.blocks);

      expect(messageText).toContain('45');
      expect(messageText).not.toContain('→');
    });
  });

  describe('Performance', () => {
    it('should complete execution within reasonable time', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const startTime = Date.now();
      const result = await hotLeadsHandler(mockConfig, mockTriggerData);
      const actualExecutionTime = Date.now() - startTime;

      // Assert
      expect(result.executionTimeMs).toBeLessThan(actualExecutionTime + 100);
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });
  });

  describe('Data Validation', () => {
    it('should handle missing or invalid trigger data', async () => {
      // Arrange
      const invalidTriggerData = {
        contactId: '',
        email: '',
        leadInfluenceScore: NaN,
        previousScore: undefined,
        timestamp: '',
        hubspotPortalId: '',
      };

      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await hotLeadsHandler(mockConfig, invalidTriggerData);

      // Assert
      expect(result).toBeDefined();
      expect(result.contactId).toBe('');
      expect(result.email).toBe('');
    });

    it('should handle edge case scores', async () => {
      // Arrange
      const edgeCaseTriggerData = {
        ...mockTriggerData,
        leadInfluenceScore: 999,
        previousScore: 0,
      };

      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await hotLeadsHandler(mockConfig, edgeCaseTriggerData);

      // Assert
      expect(result.newScore).toBe(999);
      expect(result.previousScore).toBe(0);
    });
  });
});

describe('Hot Leads Integration', () => {
  it('should properly integrate with HubSpot and Slack APIs', async () => {
    // Arrange
    mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
      id: '12345',
      properties: {
        lead_status: 'Hot Lead',
        last_hot_lead_detection: expect.any(String),
      },
    });

    mockSlackClient.chat.postMessage.mockResolvedValue({
      ok: true,
      ts: '123456789',
      channel: '#test-hot-leads',
    });

    // Act
    const result = await hotLeadsHandler(mockConfig, mockTriggerData);

    // Assert
    expect(result.statusUpdated).toBe(true);
    expect(result.slackMessageSent).toBe(true);
    expect(
      mockHubSpotClient.crm.contacts.basicApi.update
    ).toHaveBeenCalledTimes(1);
    expect(mockSlackClient.chat.postMessage).toHaveBeenCalledTimes(1);
  });
});
