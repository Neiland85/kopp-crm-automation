import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { recompensasEscasezHandler } from '../../../src/zaps/recompensas-escasez/handler';
import { Logger } from '../../../src/utils/Logger';

// Mock de dependencias
jest.mock('@hubspot/api-client');
jest.mock('@slack/web-api');
jest.mock('../../../src/utils/Logger');

/**
 * 🧪 Tests de Recompensas por Escasez
 *
 * Cobertura:
 * 1. Handler principal con datos mock
 * 2. Actualización de recompensa_emocional en HubSpot
 * 3. Generación de códigos de cupón
 * 4. Envío de alertas a Slack
 * 5. Manejo de diferentes niveles de urgencia
 * 6. Manejo de errores y reintentos
 * 7. Integración con Google Sheets
 */

const mockHubSpotClient = {
  crm: {
    contacts: {
      basicApi: {
        update: jest.fn() as jest.MockedFunction<any>,
      },
      searchApi: {
        doSearch: jest.fn() as jest.MockedFunction<any>,
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
  googleSheetsApiKey: 'test-sheets-key',
  googleSheetsId: 'test-sheets-id',
  slackChannel: '#test-scoring-leads',
  stockThreshold: 20,
  isEnabled: true,
};

const mockTriggerData = {
  productId: 'PROD-001',
  productName: 'Jersey Kopp Stadium Edición Limitada',
  stockRemaining: 15,
  previousStock: 25,
  email: 'test@example.com',
  contactId: '12345',
  sheetRowId: 'row-123',
  timestamp: '2025-06-29T20:46:15.123Z',
  urgencyLevel: 'high' as const,
};

const mockSearchResponse = {
  results: [
    {
      id: '12345',
      properties: {
        email: 'user1@example.com',
        last_page_seen: 'product-page-PROD-001',
      },
    },
    {
      id: '67890',
      properties: {
        email: 'user2@example.com',
        last_page_seen: 'product-page-PROD-001',
      },
    },
  ],
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

describe('Recompensas por Escasez Handler', () => {
  describe('Procesamiento exitoso', () => {
    it('should process stock alert successfully', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockSearchResponse
      );
      mockSlackClient.chat.postMessage.mockResolvedValue({
        ok: true,
        ts: '123456789',
      });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        mockTriggerData
      );

      // Assert
      expect(result).toMatchObject({
        productId: 'PROD-001',
        productName: 'Jersey Kopp Stadium Edición Limitada',
        stockRemaining: 15,
        previousStock: 25,
        urgencyLevel: 'high',
        hubspotUpdated: true,
        slackMessageSent: true,
      });
      expect(result.executionTimeMs).toBeGreaterThan(0);
      expect(result.couponCode).toMatch(/^(URGENT|SPECIAL)/);
      expect(result.contactsUpdated).toBeGreaterThan(0);
    });

    it('should update specific contact when contactId provided', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await recompensasEscasezHandler(mockConfig, mockTriggerData);

      // Assert
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledWith('12345', {
        properties: {
          recompensa_emocional: 'Oferta especial',
          last_stock_alert: expect.any(String),
          stock_alert_product: 'Jersey Kopp Stadium Edición Limitada',
          coupon_code: expect.stringMatching(/^(URGENT|SPECIAL)/),
          stock_urgency_level: 'high',
        },
      });
    });

    it('should search and update multiple contacts when no specific contactId', async () => {
      // Arrange
      const triggerDataWithoutContactId = {
        ...mockTriggerData,
        contactId: undefined,
      };
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockSearchResponse
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        triggerDataWithoutContactId
      );

      // Assert
      expect(
        mockHubSpotClient.crm.contacts.searchApi.doSearch
      ).toHaveBeenCalled();
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledTimes(2);
      expect(result.contactsUpdated).toBe(2);
    });
  });

  describe('Generación de códigos de cupón', () => {
    it('should generate coupon codes based on urgency level', async () => {
      // Arrange
      const criticalTriggerData = {
        ...mockTriggerData,
        urgencyLevel: 'critical' as const,
      };
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        criticalTriggerData
      );

      // Assert
      expect(result.couponCode).toMatch(/^URGENT/);
    });

    it('should generate different coupon codes for medium urgency', async () => {
      // Arrange
      const mediumTriggerData = {
        ...mockTriggerData,
        urgencyLevel: 'medium' as const,
      };
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        mediumTriggerData
      );

      // Assert
      expect(result.couponCode).toMatch(/^SPECIAL/);
    });

    it('should include product ID and timestamp in coupon code', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        mockTriggerData
      );

      // Assert
      expect(result.couponCode).toContain('PROD');
      expect(result.couponCode).toMatch(/\d{6}$/); // Should end with 6 digits from timestamp
    });
  });

  describe('Mensajes de Slack', () => {
    it('should send correct Slack message format', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await recompensasEscasezHandler(mockConfig, mockTriggerData);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock.calls[0][0];
      expect(slackCall.channel).toBe('#test-scoring-leads');
      expect(slackCall.text).toContain('🎁 Recompensa Emocional');
      expect(slackCall.text).toContain('Jersey Kopp Stadium Edición Limitada');
      expect(slackCall.text).toContain('15');
      expect(slackCall.blocks).toBeDefined();
    });

    it('should include urgency-specific styling in Slack message', async () => {
      // Arrange
      const criticalTriggerData = {
        ...mockTriggerData,
        urgencyLevel: 'critical' as const,
      };
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await recompensasEscasezHandler(mockConfig, criticalTriggerData);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock
        .calls[0][0] as any;
      const messageText = JSON.stringify(slackCall.blocks);

      expect(messageText).toContain('🚨');
      expect(messageText).toContain('CRITICAL');
      expect(messageText).toContain('¡ÚLTIMAS UNIDADES! 25% OFF');
    });

    it('should include action buttons in Slack message', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      await recompensasEscasezHandler(mockConfig, mockTriggerData);

      // Assert
      const slackCall = mockSlackClient.chat.postMessage.mock
        .calls[0][0] as any;
      const messageText = JSON.stringify(slackCall.blocks);

      expect(messageText).toContain('📧 Enviar Cupones');
      expect(messageText).toContain('📊 Ver Stock Sheet');
      expect(messageText).toContain('📈 Analizar Tendencia');
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
      const result = await recompensasEscasezHandler(
        mockConfig,
        mockTriggerData
      );

      // Assert
      expect(result.hubspotUpdated).toBe(false);
      expect(result.contactsUpdated).toBe(0);
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
      const result = await recompensasEscasezHandler(
        mockConfig,
        mockTriggerData
      );

      // Assert
      expect(result.hubspotUpdated).toBe(true);
      expect(result.slackMessageSent).toBe(false);
    });

    it('should throw error when both HubSpot and Slack fail', async () => {
      // Arrange
      mockHubSpotClient.crm.contacts.basicApi.update.mockRejectedValue(
        new Error('HubSpot error')
      );
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockRejectedValue(
        new Error('Search error')
      );
      mockSlackClient.chat.postMessage.mockRejectedValue(
        new Error('Slack error')
      );

      // Act & Assert
      await expect(
        recompensasEscasezHandler(mockConfig, mockTriggerData)
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
      const result = await recompensasEscasezHandler(
        mockConfig,
        mockTriggerData
      );

      // Assert
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledTimes(3);
      expect(result.hubspotUpdated).toBe(true);
    });

    it('should handle partial failures in multiple contact updates', async () => {
      // Arrange
      const triggerDataWithoutContactId = {
        ...mockTriggerData,
        contactId: undefined,
      };
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        mockSearchResponse
      );
      mockHubSpotClient.crm.contacts.basicApi.update
        .mockResolvedValueOnce({ id: 'updated' })
        .mockRejectedValueOnce(new Error('Second contact failed'));
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        triggerDataWithoutContactId
      );

      // Assert
      expect(result.contactsUpdated).toBe(1);
      expect(result.hubspotUpdated).toBe(true);
    });
  });

  describe('Niveles de urgencia', () => {
    it('should handle critical urgency level correctly', async () => {
      // Arrange
      const criticalData = {
        ...mockTriggerData,
        stockRemaining: 3,
        urgencyLevel: 'critical' as const,
      };
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(mockConfig, criticalData);

      // Assert
      expect(result.urgencyLevel).toBe('critical');
      expect(result.couponCode).toMatch(/^URGENT/);
    });

    it('should handle medium urgency level correctly', async () => {
      // Arrange
      const mediumData = {
        ...mockTriggerData,
        stockRemaining: 18,
        urgencyLevel: 'medium' as const,
      };
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(mockConfig, mediumData);

      // Assert
      expect(result.urgencyLevel).toBe('medium');
      expect(result.couponCode).toMatch(/^SPECIAL/);
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
      const result = await recompensasEscasezHandler(
        mockConfig,
        mockTriggerData
      );
      const actualExecutionTime = Date.now() - startTime;

      // Assert
      expect(result.executionTimeMs).toBeLessThan(actualExecutionTime + 100);
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });

    it('should handle large number of contacts efficiently', async () => {
      // Arrange
      const largeMockResponse = {
        results: Array(50)
          .fill(null)
          .map((_, i) => ({
            id: `contact-${i}`,
            properties: { email: `user${i}@example.com` },
          })),
      };

      const triggerDataWithoutContactId = {
        ...mockTriggerData,
        contactId: undefined,
      };
      mockHubSpotClient.crm.contacts.searchApi.doSearch.mockResolvedValue(
        largeMockResponse
      );
      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        triggerDataWithoutContactId
      );

      // Assert
      expect(result.contactsUpdated).toBe(50);
      expect(
        mockHubSpotClient.crm.contacts.basicApi.update
      ).toHaveBeenCalledTimes(50);
    });
  });

  describe('Data Validation', () => {
    it('should handle missing or invalid trigger data', async () => {
      // Arrange
      const invalidTriggerData = {
        productId: '',
        productName: '',
        stockRemaining: 0,
        previousStock: undefined,
        email: '',
        contactId: '',
        sheetRowId: '',
        timestamp: '',
        urgencyLevel: 'medium' as const,
      };

      mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
        id: 'updated',
      });
      mockSlackClient.chat.postMessage.mockResolvedValue({ ok: true });

      // Act
      const result = await recompensasEscasezHandler(
        mockConfig,
        invalidTriggerData
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.productId).toBe('');
      expect(result.productName).toBe('');
      expect(result.stockRemaining).toBe(0);
    });
  });
});

describe('Recompensas por Escasez Integration', () => {
  it('should properly integrate with HubSpot, Slack and Google Sheets concepts', async () => {
    // Arrange
    mockHubSpotClient.crm.contacts.basicApi.update.mockResolvedValue({
      id: '12345',
      properties: {
        recompensa_emocional: 'Oferta especial',
        coupon_code: expect.stringMatching(/^(URGENT|SPECIAL)/),
      },
    });

    mockSlackClient.chat.postMessage.mockResolvedValue({
      ok: true,
      ts: '123456789',
      channel: '#test-scoring-leads',
    });

    // Act
    const result = await recompensasEscasezHandler(mockConfig, mockTriggerData);

    // Assert
    expect(result.hubspotUpdated).toBe(true);
    expect(result.slackMessageSent).toBe(true);
    expect(result.couponCode).toBeDefined();
    expect(
      mockHubSpotClient.crm.contacts.basicApi.update
    ).toHaveBeenCalledTimes(1);
    expect(mockSlackClient.chat.postMessage).toHaveBeenCalledTimes(1);
  });
});
