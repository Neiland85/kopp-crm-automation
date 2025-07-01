import * as fs from 'fs';
import * as path from 'path';

/**
 * Interfaces para configuración tipada
 */
interface AppConfig {
  name: string;
  version: string;
  environment: string;
  port: number;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
}

interface Config {
  app: AppConfig;
  logging: LoggingConfig;
  [key: string]: any;
}

/**
 * Gestor de configuración para Kopp CRM Automation
 */

export class ConfigManager {
  private config: Config;
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.getDefaultConfig();
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    try {
      // Cargar configuración base
      const configPath = path.join(process.cwd(), 'config', 'app.json');
      if (fs.existsSync(configPath)) {
        const baseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = { ...this.config, ...baseConfig };
      }

      // Cargar configuración específica del entorno
      // const envConfigPath = path.join(process.cwd(), 'config', `${this.environment}.yml`);
      // TODO: Implementar parser YAML si es necesario

      console.log(`📋 Configuración cargada para entorno: ${this.environment}`);
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      // Mantener configuración por defecto
    }
  }

  private getDefaultConfig(): Config {
    return {
      app: {
        name: 'Kopp CRM Automation',
        version: '1.0.0',
        environment: this.environment,
        port: 3000,
      },
      logging: {
        level: 'info',
      },
    };
  }

  get(key: string, defaultValue?: any): any {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  getEnvironment(): string {
    return this.environment;
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.environment === 'development';
  }
}
