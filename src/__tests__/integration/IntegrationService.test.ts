/**
 * Tests de integración para IntegrationService
 */

import { IntegrationService } from '../../integrations/IntegrationService';
import { ConfigManager } from '../../config/ConfigManager';

// Mock external dependencies
jest.mock('../../integrations/ZapierSlackService');
jest.mock('../../integrations/SlackHubspotService');
jest.mock('../../utils/Logger');

describe('Integration Service', () => {
  let integrationService: IntegrationService;
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
    integrationService = new IntegrationService(configManager);
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      expect(integrationService).toBeDefined();
      expect(integrationService).toBeInstanceOf(IntegrationService);
    });

    it('should have proper service methods', () => {
      expect(typeof integrationService.initialize).toBe('function');
      expect(typeof integrationService.setupWebhookRoutes).toBe('function');
      expect(typeof integrationService.testIntegrations).toBe('function');
    });
  });

  describe('Test Integration Endpoint', () => {
    it('should complete test integrations without errors', async () => {
      // testIntegrations devuelve void, solo verificamos que no arroje error
      await expect(
        integrationService.testIntegrations()
      ).resolves.not.toThrow();
    });

    it('should have testIntegrations method defined', () => {
      expect(typeof integrationService.testIntegrations).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should use provided config manager', () => {
      expect(configManager).toBeDefined();
      expect(configManager.getEnvironment()).toBe('test'); // En tests, NODE_ENV es 'test'
    });

    it('should handle webhook route setup', () => {
      const mockApp = {
        post: jest.fn(),
        get: jest.fn(),
      };

      expect(() => {
        integrationService.setupWebhookRoutes(mockApp as any);
      }).not.toThrow();
    });
  });
});
