import fs from 'fs/promises';
import path from 'path';

/**
 * Interface para los logs de acciones de Zap
 */
export interface ZapLogEntry {
  action: string;
  timestamp: string;
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Función de reintento exponencial para operaciones HTTP
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calcular delay exponencial: baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt);

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Función para loguear acciones de Zap en formato JSON
 */
export async function logZapAction(
  z: any,
  logEntry: ZapLogEntry
): Promise<void> {
  try {
    // Crear directorio de logs si no existe
    const logsDir = path.join(process.cwd(), 'logs', 'zaps');
    await fs.mkdir(logsDir, { recursive: true });

    // Crear nombre de archivo con fecha
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${date}.json`);

    // Leer logs existentes o crear array vacío
    let existingLogs: ZapLogEntry[] = [];
    try {
      const existingContent = await fs.readFile(logFile, 'utf-8');
      existingLogs = JSON.parse(existingContent);
    } catch {
      // Archivo no existe o está vacío, usar array vacío
      existingLogs = [];
    }

    // Agregar nuevo log
    existingLogs.push(logEntry);

    // Escribir de vuelta al archivo
    await fs.writeFile(logFile, JSON.stringify(existingLogs, null, 2));

    // También loguear a la consola de Zapier para debugging
    if (z && z.console) {
      z.console.log('Zap Action Logged:', logEntry);
    }
  } catch (error) {
    // Si falla el logging, no fallar la operación principal
    console.error('Failed to log zap action:', error);
    if (z && z.console) {
      z.console.error('Failed to log zap action:', error);
    }
  }
}

/**
 * Función para validar email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Regex para validar emails - más permisiva pero segura
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;

  // Verificar que no tenga dobles puntos consecutivos
  if (email.includes('..')) {
    return false;
  }

  // Verificar que no empiece o termine con punto antes del @
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const localPart = parts[0];
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  return emailRegex.test(email);
}

/**
 * Función para limpiar y formatear nombres
 */
export function cleanName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Función para formatear número de teléfono
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remover todos los caracteres no numéricos excepto +
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Función para mapear campos de formulario a propiedades de HubSpot
 */
export function mapFormFieldsToHubSpot(formValues: any[]): Record<string, any> {
  const mapping: Record<string, string> = {
    email: 'email',
    firstname: 'firstname',
    first_name: 'firstname',
    lastname: 'lastname',
    last_name: 'lastname',
    phone: 'phone',
    company: 'company',
    website: 'website',
    jobtitle: 'jobtitle',
    job_title: 'jobtitle',
    city: 'city',
    state: 'state',
    country: 'country',
    zip: 'zip',
    postal_code: 'zip',
  };

  const properties: Record<string, any> = {};

  formValues.forEach((field: any) => {
    if (field.name && field.value) {
      const hubspotProperty = mapping[field.name.toLowerCase()];
      if (hubspotProperty) {
        let value = field.value;

        // Aplicar validaciones y formateo específico
        if (hubspotProperty === 'email' && !isValidEmail(value)) {
          return; // Skip invalid emails
        }

        if (hubspotProperty === 'firstname' || hubspotProperty === 'lastname') {
          value = cleanName(value);
        }

        if (hubspotProperty === 'phone') {
          value = formatPhoneNumber(value);
        }

        properties[hubspotProperty] = value;
      }
    }
  });

  return properties;
}
