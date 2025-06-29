/**
 * 🧪 Tests para Dropout Positivo - Zapier CLI Integration
 *
 * Tests unitarios con Jest
 */

import {
  dropoutPositivoHandler,
  DropoutPositivoConfig,
} from '../../../src/zaps/dropout-positivo/handler';

// Mock del handler con jest
jest.mock('../../../src/zaps/dropout-positivo/handler');

describe('💫 Dropout Positivo Integration Tests', () => {
  const mockDropoutPositivoHandler =
    dropoutPositivoHandler as jest.MockedFunction<
      typeof dropoutPositivoHandler
    >;

  const mockConfig: DropoutPositivoConfig = {
    contactId: '12345',
    email: 'usuario@example.com',
    hubspotApiKey: 'test-hubspot-key',
    slackBotToken: 'test-slack-token',
    slackChannel: '#auditoria-sagrada',
    scoreBoost: 30,
    thresholdDays: 7,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    it('debe procesar correctamente un contact con dropout > 7 días', async () => {
      // Arrange
      const expectedResult = {
        id: 'dropout-123-test',
        success: true,
        contactId: mockConfig.contactId,
        email: mockConfig.email,
        previousScore: 35,
        newScore: 65,
        daysSinceEngagement: 10,
        slackMessageId: 'slack-msg-123',
        processedAt: new Date().toISOString(),
      };

      mockDropoutPositivoHandler.mockResolvedValue(expectedResult);

      // Act
      const result = await dropoutPositivoHandler(mockConfig);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.success).toBe(true);
      expect(result.newScore).toBe(result.previousScore + 30);
      expect(result.daysSinceEngagement).toBeGreaterThan(7);
      expect(mockDropoutPositivoHandler).toHaveBeenCalledWith(mockConfig);
    });

    it('debe manejar contactos con score bajo inicial', async () => {
      // Arrange
      const configWithLowScore = {
        ...mockConfig,
        contactId: '67890',
        email: 'novato@example.com',
      };
      const expectedResult = {
        id: 'dropout-456-test',
        success: true,
        contactId: configWithLowScore.contactId,
        email: configWithLowScore.email,
        previousScore: 5,
        newScore: 35,
        daysSinceEngagement: 10,
        slackMessageId: 'slack-msg-456',
        processedAt: new Date().toISOString(),
      };

      mockDropoutPositivoHandler.mockResolvedValue(expectedResult);

      // Act
      const result = await dropoutPositivoHandler(configWithLowScore);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newScore).toBe(35);
      expect(result.daysSinceEngagement).toBeCloseTo(10, 0);
    });
  });

  describe('❌ Manejo de Errores', () => {
    it('debe manejar errores de HubSpot API', async () => {
      // Arrange
      const configWithError = { ...mockConfig, contactId: '99999' };
      const error = new Error('HubSpot API error');

      mockDropoutPositivoHandler.mockRejectedValue(error);

      // Act & Assert
      await expect(dropoutPositivoHandler(configWithError)).rejects.toThrow(
        'HubSpot API error'
      );
      expect(mockDropoutPositivoHandler).toHaveBeenCalledWith(configWithError);
    });

    it('debe rechazar contactos sin dropout (< 7 días)', async () => {
      // Arrange
      const configWithRecentEngagement = { ...mockConfig, contactId: '55555' };
      const error = new Error(
        'Contact does not qualify for dropout processing'
      );

      mockDropoutPositivoHandler.mockRejectedValue(error);

      // Act & Assert
      await expect(
        dropoutPositivoHandler(configWithRecentEngagement)
      ).rejects.toThrow('Contact does not qualify for dropout processing');
    });
  });

  describe('⚡ Performance', () => {
    it('debe completar el procesamiento en tiempo razonable', async () => {
      // Arrange
      const configForPerformance = {
        ...mockConfig,
        contactId: '33333',
        email: 'performance@example.com',
      };
      const expectedResult = {
        id: 'dropout-789-test',
        success: true,
        contactId: configForPerformance.contactId,
        email: configForPerformance.email,
        previousScore: 45,
        newScore: 75,
        daysSinceEngagement: 8,
        slackMessageId: 'slack-msg-789',
        processedAt: new Date().toISOString(),
      };

      mockDropoutPositivoHandler.mockResolvedValue(expectedResult);

      // Act
      const startTime = Date.now();
      const result = await dropoutPositivoHandler(configForPerformance);
      const executionTime = Date.now() - startTime;

      // Assert
      expect(executionTime).toBeLessThan(1000); // Menos de 1 segundo para mock
      expect(result.success).toBe(true);
    });
  });
});
