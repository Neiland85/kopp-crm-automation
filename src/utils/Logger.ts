/**
 * Sistema de logging para Kopp CRM Automation
 */

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    if (data) {
      return `${logMessage} ${JSON.stringify(data)}`;
    }
    
    return logMessage;
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage('INFO', message, data));
  }

  error(message: string, data?: any): void {
    console.error(this.formatMessage('ERROR', message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('WARN', message, data));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }
}
