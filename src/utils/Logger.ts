/**
 * Sistema de logging para Kopp CRM Automation
 */

import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogData {
  [key: string]: any;
}

export interface LogContext {
  component?: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export class Logger {
  private context: string;
  private logDir: string;
  private logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = 'info') {
    this.context = context;
    this.logLevel = logLevel;
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData | LogContext): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;

    if (data) {
      return `${logMessage} ${JSON.stringify(data, null, 2)}`;
    }

    return logMessage;
  }

  private writeToFile(message: string): void {
    try {
      // Escribir a archivos específicos basado en el contexto
      const logFileName = this.getLogFileName();
      const logFile = path.join(this.logDir, logFileName);
      fs.appendFileSync(logFile, message + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private getLogFileName(): string {
    if (this.context.includes('reputometro')) {
      return 'reputometro.log';
    } else if (this.context.includes('hot-leads')) {
      return 'hot_leads.log';
    } else if (this.context.includes('recompensas-escasez') || this.context.includes('dropout')) {
      return 'recompensas.log';
    } else if (this.context.includes('integration')) {
      return 'integrations.log';
    } else {
      return 'general.log';
    }
  }

  info(message: string, data?: LogData | LogContext): void {
    if (!this.shouldLog('info')) return;
    const formattedMessage = this.formatMessage('info', message, data);
    console.log(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  error(message: string, data?: LogData | LogContext): void {
    if (!this.shouldLog('error')) return;
    const formattedMessage = this.formatMessage('error', message, data);
    console.error(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  warn(message: string, data?: LogData | LogContext): void {
    if (!this.shouldLog('warn')) return;
    const formattedMessage = this.formatMessage('warn', message, data);
    console.warn(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  debug(message: string, data?: LogData | LogContext): void {
    if (!this.shouldLog('debug')) return;
    const formattedMessage = this.formatMessage('debug', message, data);
    console.debug(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  // Método auxiliar para crear logger con contexto específico
  static create(context: string, logLevel?: LogLevel): Logger {
    return new Logger(context, logLevel);
  }

  // Método para logging de performance
  time(label: string): void {
    console.time(`[${this.context}] ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`[${this.context}] ${label}`);
  }
}
