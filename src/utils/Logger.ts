/**
 * Sistema de logging para Kopp CRM Automation
 */

import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private context: string;
  private logDir: string;

  constructor(context: string) {
    this.context = context;
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    if (data) {
      return `${logMessage} ${JSON.stringify(data)}`;
    }

    return logMessage;
  }

  private writeToFile(message: string): void {
    // Escribir a archivos específicos basado en el contexto
    if (
      this.context === 'reputometro' ||
      this.context === 'reputometro-index'
    ) {
      const logFile = path.join(this.logDir, 'reputometro.log');
      fs.appendFileSync(logFile, message + '\n');
    } else if (
      this.context === 'hot-leads' ||
      this.context === 'hot-leads-index'
    ) {
      const logFile = path.join(this.logDir, 'hot_leads.log');
      fs.appendFileSync(logFile, message + '\n');
    } else if (
      this.context === 'recompensas-escasez' ||
      this.context === 'recompensas-escasez-index'
    ) {
      const logFile = path.join(this.logDir, 'recompensas.log');
      fs.appendFileSync(logFile, message + '\n');
    } else {
      // Archivo general para otros contextos
      const logFile = path.join(this.logDir, 'general.log');
      fs.appendFileSync(logFile, message + '\n');
    }
  }

  info(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('INFO', message, data);
    console.log(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  error(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('ERROR', message, data);
    console.error(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  warn(message: string, data?: any): void {
    const formattedMessage = this.formatMessage('WARN', message, data);
    console.warn(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.debug(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }
}
