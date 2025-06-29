/**
 * Tests unitarios para ConfigManager
 */

import { ConfigManager } from '../../config/ConfigManager';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // Limpiar variables de entorno
    delete process.env.NODE_ENV;
    configManager = new ConfigManager();
  });

  describe('get', () => {
    it('should return configuration value for valid key', () => {
      const appName = configManager.get('app.name');
      expect(appName).toBe('Kopp CRM Automation');
    });

    it('should return default value when key does not exist', () => {
      const nonExistent = configManager.get('non.existent.key', 'default');
      expect(nonExistent).toBe('default');
    });

    it('should return undefined when key does not exist and no default provided', () => {
      const nonExistent = configManager.get('non.existent.key');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('getEnvironment', () => {
    it('should return current environment', () => {
      const env = configManager.getEnvironment();
      expect(env).toBe('development');
    });

    it('should return production when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      const prodConfigManager = new ConfigManager();
      const env = prodConfigManager.getEnvironment();
      expect(env).toBe('production');
    });
  });

  describe('isProduction', () => {
    it('should return false for development environment', () => {
      expect(configManager.isProduction()).toBe(false);
    });

    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      const prodConfigManager = new ConfigManager();
      expect(prodConfigManager.isProduction()).toBe(true);
    });
  });

  describe('isDevelopment', () => {
    it('should return true for development environment', () => {
      expect(configManager.isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      const prodConfigManager = new ConfigManager();
      expect(prodConfigManager.isDevelopment()).toBe(false);
    });
  });
});
