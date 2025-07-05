import { CookieConsentState, ConsentConfiguration } from '../types/cookies.types';

/**
 * Servicio para gestionar el almacenamiento del consentimiento de cookies
 */
export class ConsentStorageService {
  private readonly config: ConsentConfiguration;

  constructor(config: ConsentConfiguration) {
    this.config = config;
  }

  /**
   * Carga el consentimiento desde localStorage
   */
  load(): CookieConsentState | null {
    try {
      const storedConsent = localStorage.getItem(this.config.storageKey);
      if (!storedConsent) return null;

      const parsed = JSON.parse(storedConsent);
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp)
      };
    } catch (error) {
      console.error('Error loading consent from storage:', error);
      return null;
    }
  }

  /**
   * Guarda el consentimiento en localStorage
   */
  save(consent: CookieConsentState): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(consent));
    } catch (error) {
      console.error('Error saving consent to storage:', error);
      throw new Error('Failed to save consent to storage');
    }
  }

  /**
   * Elimina el consentimiento del almacenamiento
   */
  clear(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.error('Error clearing consent from storage:', error);
    }
  }

  /**
   * Verifica si el consentimiento es válido (no expirado y versión correcta)
   */
  isValid(consent: CookieConsentState): boolean {
    if (!consent) return false;

    // Verificar versión
    if (consent.version !== this.config.version) return false;

    // Verificar expiración
    const expiryDate = new Date(consent.timestamp);
    expiryDate.setDate(expiryDate.getDate() + this.config.expiryDays);

    return new Date() < expiryDate;
  }

  /**
   * Obtiene información sobre el estado del almacenamiento
   */
  getStorageInfo(): {
    hasConsent: boolean;
    isValid: boolean;
    version?: string;
    timestamp?: Date;
    expiresAt?: Date;
  } {
    const consent = this.load();

    if (!consent) {
      return { hasConsent: false, isValid: false };
    }

    const isValid = this.isValid(consent);
    const expiresAt = new Date(consent.timestamp);
    expiresAt.setDate(expiresAt.getDate() + this.config.expiryDays);

    return {
      hasConsent: true,
      isValid,
      version: consent.version,
      timestamp: consent.timestamp,
      expiresAt
    };
  }
}
