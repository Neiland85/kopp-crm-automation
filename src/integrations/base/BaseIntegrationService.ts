import { Logger } from '../../utils/Logger';
import { ConfigManager } from '../../config/ConfigManager';
import { 
  IIntegrationService, 
  IntegrationConfig, 
  IntegrationResult, 
  IntegrationMetrics,
  AuditLog 
} from '../types/integration.types';

/**
 * Servicio base abstracto para todas las integraciones
 * Proporciona funcionalidad común como logging, métricas, retry logic, etc.
 */
export abstract class BaseIntegrationService implements IIntegrationService {
  protected logger: Logger;
  protected config: ConfigManager;
  protected metrics: IntegrationMetrics;
  protected auditLogs: AuditLog[] = [];
  protected isInitialized = false;

  constructor(
    protected serviceName: string,
    config: ConfigManager,
    protected integrationConfig: IntegrationConfig
  ) {
    this.config = config;
    this.logger = new Logger(serviceName);
    this.metrics = this.initializeMetrics();
  }

  /**
   * Inicialización del servicio (debe ser implementado por cada servicio)
   */
  abstract initialize(): Promise<void>;

  /**
   * Verificación de salud del servicio
   */
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      // Verificar si el servicio ha tenido actividad reciente
      const lastActivity = this.metrics.lastActivity;
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      const maxInactivityTime = 30 * 60 * 1000; // 30 minutos

      return timeSinceLastActivity < maxInactivityTime;
    } catch (error) {
      this.logger.error('Error verificando salud del servicio:', { error });
      return false;
    }
  }

  /**
   * Obtener estado actual del servicio
   */
  async getStatus(): Promise<IntegrationResult> {
    return {
      success: this.isInitialized,
      data: {
        service: this.serviceName,
        initialized: this.isInitialized,
        healthy: await this.isHealthy(),
        metrics: this.metrics,
        config: {
          enabled: this.integrationConfig.enabled,
          retryAttempts: this.integrationConfig.retryAttempts,
          timeout: this.integrationConfig.timeout
        }
      },
      timestamp: new Date()
    };
  }

  /**
   * Limpieza de recursos
   */
  async cleanup(): Promise<void> {
    this.logger.info(`🧹 Limpiando recursos de ${this.serviceName}...`);
    this.isInitialized = false;
    this.auditLogs = [];
  }

  /**
   * Ejecutar operación con retry logic y métricas
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxAttempts?: number
  ): Promise<IntegrationResult<T>> {
    const attempts = maxAttempts || this.integrationConfig.retryAttempts;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const result = await this.executeAttempt(operation, operationName, attempt, attempts, startTime);
      if (result) return result;
    }

    return this.createFailureResult('Error inesperado en retry logic');
  }

  /**
   * Ejecutar un intento individual
   */
  private async executeAttempt<T>(
    operation: () => Promise<T>,
    operationName: string,
    attempt: number,
    totalAttempts: number,
    startTime: number
  ): Promise<IntegrationResult<T> | null> {
    try {
      this.recordRequest();
      const result = await this.withTimeout(operation(), this.integrationConfig.timeout);
      return this.handleSuccessfulAttempt(result, operationName, attempt, startTime);
    } catch (error) {
      return await this.handleFailedAttempt(error, operationName, attempt, totalAttempts, startTime);
    }
  }

  /**
   * Manejar intento exitoso
   */
  private handleSuccessfulAttempt<T>(
    result: T,
    operationName: string,
    attempt: number,
    startTime: number
  ): IntegrationResult<T> {
    const duration = Date.now() - startTime;
    this.recordSuccess(duration);
    this.updateLastActivity();
    
    this.addAuditLog({
      service: this.serviceName,
      action: operationName,
      result: 'success',
      data: { attempt, duration }
    });

    return {
      success: true,
      data: result,
      timestamp: new Date(),
      metadata: { attempts: attempt, duration }
    };
  }

  /**
   * Manejar intento fallido
   */
  private async handleFailedAttempt(
    error: unknown,
    operationName: string,
    attempt: number,
    totalAttempts: number,
    startTime: number
  ): Promise<IntegrationResult<any> | null> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    this.logger.warn(
      `Intento ${attempt}/${totalAttempts} falló para ${operationName}:`,
      { error: errorMessage }
    );

    if (attempt === totalAttempts) {
      return this.createFinalFailureResult(operationName, errorMessage, totalAttempts, startTime);
    }

    await this.performBackoff(attempt);
    return null;
  }

  /**
   * Crear resultado de falla final
   */
  private createFinalFailureResult(
    operationName: string,
    errorMessage: string,
    totalAttempts: number,
    startTime: number
  ): IntegrationResult<any> {
    const duration = Date.now() - startTime;
    this.recordFailure();
    
    this.addAuditLog({
      service: this.serviceName,
      action: operationName,
      result: 'failure',
      error: errorMessage,
      data: { totalAttempts, duration }
    });

    return this.createFailureResult(errorMessage, { attempts: totalAttempts, duration });
  }

  /**
   * Crear resultado de falla genérico
   */
  private createFailureResult(error: string, metadata?: Record<string, any>): IntegrationResult<any> {
    return {
      success: false,
      error,
      timestamp: new Date(),
      metadata
    };
  }

  /**
   * Realizar backoff exponencial
   */
  private async performBackoff(attempt: number): Promise<void> {
    const delay = this.integrationConfig.retryDelay * Math.pow(2, attempt - 1);
    await this.sleep(delay);
  }

  /**
   * Wrapper para timeout de operaciones
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operación timeout después de ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Validar configuración del servicio
   */
  protected validateConfig(): void {
    if (!this.integrationConfig.enabled) {
      throw new Error(`Servicio ${this.serviceName} está deshabilitado`);
    }

    if (this.integrationConfig.retryAttempts < 1) {
      throw new Error('retryAttempts debe ser mayor a 0');
    }

    if (this.integrationConfig.timeout < 1000) {
      throw new Error('timeout debe ser mayor a 1000ms');
    }
  }

  /**
   * Inicializar métricas
   */
  private initializeMetrics(): IntegrationMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastActivity: new Date(),
      uptime: Date.now()
    };
  }

  /**
   * Registrar nueva solicitud
   */
  private recordRequest(): void {
    this.metrics.totalRequests++;
  }

  /**
   * Registrar solicitud exitosa
   */
  private recordSuccess(responseTime: number): void {
    this.metrics.successfulRequests++;
    this.updateAverageResponseTime(responseTime);
  }

  /**
   * Registrar solicitud fallida
   */
  private recordFailure(): void {
    this.metrics.failedRequests++;
  }

  /**
   * Actualizar tiempo promedio de respuesta
   */
  private updateAverageResponseTime(responseTime: number): void {
    const total = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1);
    this.metrics.averageResponseTime = (total + responseTime) / this.metrics.successfulRequests;
  }

  /**
   * Actualizar última actividad
   */
  private updateLastActivity(): void {
    this.metrics.lastActivity = new Date();
  }

  /**
   * Agregar log de auditoría
   */
  protected addAuditLog(log: Partial<AuditLog>): void {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      service: this.serviceName,
      action: 'unknown',
      result: 'success',
      data: {},
      ...log
    } as AuditLog;

    this.auditLogs.push(auditLog);

    // Mantener solo los últimos 100 logs
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(-100);
    }
  }

  /**
   * Obtener logs de auditoría
   */
  public getAuditLogs(limit?: number): AuditLog[] {
    return limit ? this.auditLogs.slice(-limit) : this.auditLogs;
  }

  /**
   * Generar ID único
   */
  private generateId(): string {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener métricas del servicio
   */
  public getMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  /**
   * Resetear métricas
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }
}
