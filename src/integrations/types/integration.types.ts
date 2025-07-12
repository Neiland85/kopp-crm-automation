/**
 * Tipos e interfaces para servicios de integración
 * @version 2.0.0
 * @created 2025-07-04
 */

/**
 * Configuración base para servicios de integración
 */
export interface IntegrationConfig {
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  enabled: boolean;
}

/**
 * Resultado de operación de integración
 */
export interface IntegrationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Datos de contacto unificados
 */
export interface ContactData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  hubspotContactId?: string;
  properties?: Record<string, any>;
}

/**
 * Evento de webhook genérico
 */
export interface WebhookEvent {
  type: string;
  source: 'zapier' | 'slack' | 'hubspot';
  timestamp: Date;
  data: Record<string, any>;
  signature?: string;
}

/**
 * Configuración de notificación
 */
export interface NotificationConfig {
  channel: string;
  template: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryPolicy?: {
    maxAttempts: number;
    backoffMultiplier: number;
  };
}

/**
 * Resultado de mensaje enviado
 */
export interface MessageResult {
  messageId?: string;
  channel: string;
  success: boolean;
  error?: string;
  deliveredAt?: Date;
}

/**
 * Configuración de canal de Slack
 */
export interface SlackChannelConfig {
  id: string;
  name: string;
  monitored: boolean;
  syncToHubspot: boolean;
  notificationLevel: 'all' | 'mentions' | 'none';
}

/**
 * Datos de ritual silencioso
 */
export interface RitualSilenciosoData extends ContactData {
  ritual_silencioso: boolean;
  detectedAt: Date;
  source: string;
}

/**
 * Datos de avance de etapa
 */
export interface StageAdvancementData extends ContactData {
  previousStage: string;
  newStage: string;
  stageChangedAt: Date;
  automated: boolean;
}

/**
 * Configuración de HubSpot
 */
export interface HubSpotConfig extends IntegrationConfig {
  apiKey: string;
  baseUrl: string;
  rateLimitRpm: number;
  defaultProperties: string[];
}

/**
 * Configuración de Slack
 */
export interface SlackConfig extends IntegrationConfig {
  botToken: string;
  appToken?: string;
  signingSecret?: string;
  channels: SlackChannelConfig[];
}

/**
 * Configuración de Zapier
 */
export interface ZapierConfig extends IntegrationConfig {
  webhookUrl: string;
  apiKey?: string;
  subscriptions: string[];
}

/**
 * Interface base para servicios de integración
 */
export interface IIntegrationService {
  initialize(): Promise<void>;
  isHealthy(): Promise<boolean>;
  getStatus(): Promise<IntegrationResult>;
  cleanup(): Promise<void>;
}

/**
 * Interface para proveedores de notificaciones
 */
export interface INotificationProvider {
  sendNotification(config: NotificationConfig, data: any): Promise<MessageResult>;
  validateConfig(config: NotificationConfig): boolean;
}

/**
 * Interface para sincronizadores de datos
 */
export interface IDataSynchronizer {
  sync(source: any, target: any): Promise<IntegrationResult>;
  validate(data: any): boolean;
}

/**
 * Métricas de integración
 */
export interface IntegrationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastActivity: Date;
  uptime: number;
}

/**
 * Log de auditoría
 */
export interface AuditLog {
  id: string;
  service: string;
  action: string;
  userId?: string;
  contactId?: string;
  timestamp: Date;
  data: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
  error?: string;
}
