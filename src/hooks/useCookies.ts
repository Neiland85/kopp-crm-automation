import { useState, useEffect, useCallback } from 'react';
import { CookieConsent } from '../policies/cookies-policy';

interface CookieConsentState {
  timestamp: Date;
  version: string;
  categories: Record<string, boolean>;
  consentId: string;
}

/* eslint-disable no-unused-vars */
interface UseCookiesReturn {
  hasConsent: boolean;
  consentState: CookieConsentState | null;
  updateConsent: (categories: Record<string, boolean>) => void;
  getConsentState: () => CookieConsentState | null;
  clearConsent: () => void;
  isConsentValid: () => boolean;
  checkCategoryConsent: (categoryId: string) => boolean;
}
/* eslint-enable no-unused-vars */

const CONSENT_STORAGE_KEY = 'kopp_cookie_consent';
const CONSENT_VERSION = '2.0.0';
const CONSENT_EXPIRY_DAYS = 365;

/**
 * Hook personalizado para gestionar el consentimiento de cookies
 * Cumple con RGPD y proporciona funcionalidades completas de gestión
 */
export const useCookies = (): UseCookiesReturn => {
  const [consentState, setConsentState] = useState<CookieConsentState | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  /**
   * Genera un ID único para el consentimiento
   */
  const generateConsentId = (): string => {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Obtiene la dirección IP del usuario (simulada en cliente)
   */
  const getUserIP = async (): Promise<string> => {
    // En producción, esto debería obtenerse del servidor
    return 'unknown';
  };

  /**
   * Carga el estado de consentimiento desde localStorage
   */
  const loadConsentFromStorage = useCallback((): CookieConsentState | null => {
    try {
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
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
  }, []);

  /**
   * Guarda el estado de consentimiento en localStorage
   */
  const saveConsentToStorage = (consent: CookieConsentState): void => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    } catch (error) {
      console.error('Error saving consent to storage:', error);
    }
  };

  /**
   * Verifica si el consentimiento es válido (no expirado y versión correcta)
   */
  const isConsentValid = useCallback((): boolean => {
    if (!consentState) return false;

    // Verificar versión
    if (consentState.version !== CONSENT_VERSION) return false;

    // Verificar expiración
    const expiryDate = new Date(consentState.timestamp);
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
    
    return new Date() < expiryDate;
  }, [consentState]);

  /**
   * Actualiza el consentimiento para categorías específicas
   */
  const updateConsent = useCallback(async (categories: Record<string, boolean>): Promise<void> => {
    try {
      const userIP = await getUserIP();
      const userAgent = navigator.userAgent;

      const newConsent: CookieConsentState = {
        timestamp: new Date(),
        version: CONSENT_VERSION,
        categories,
        consentId: generateConsentId()
      };

      // Crear registro completo para auditoría
      const fullConsentRecord: CookieConsent = {
        timestamp: newConsent.timestamp,
        version: newConsent.version,
        categories: newConsent.categories,
        ipAddress: userIP,
        userAgent,
        consentId: newConsent.consentId,
        method: 'banner'
      };

      // Guardar en localStorage
      saveConsentToStorage(newConsent);
      setConsentState(newConsent);
      setHasConsent(true);

      // Aplicar cookies según el consentimiento
      applyCookieConsent(categories);

      // Enviar a servidor para auditoría (opcional)
      await sendConsentToServer(fullConsentRecord);

      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
        detail: { consent: fullConsentRecord }
      }));

    } catch (error) {
      console.error('Error updating consent:', error);
    }
  }, []);

  /**
   * Aplica el consentimiento eliminando/agregando cookies según preferencias
   */
  const applyCookieConsent = (categories: Record<string, boolean>): void => {
    // Obtener todas las cookies actuales
    const cookies = document.cookie.split(';');

    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      
      // Mapear cookies a categorías (esto debería venir de la configuración)
      const categoryMapping = getCookieCategoryMapping();
      const cookieCategory = categoryMapping[name];

      // Si la categoría no tiene consentimiento, eliminar la cookie
      if (cookieCategory && !categories[cookieCategory]) {
        deleteCookie(name);
      }
    });

    // Configurar flags globales para scripts de terceros
    configureThirdPartyScripts(categories);
  };

  /**
   * Mapeo de cookies a categorías
   */
  const getCookieCategoryMapping = (): Record<string, string> => {
    return {
      // Google Analytics
      '_ga': 'analytics',
      '_ga_*': 'analytics',
      '_gid': 'analytics',
      '_gat': 'analytics',
      
      // Marketing
      '_fbp': 'marketing',
      '_fbc': 'marketing',
      
      // Funcionales
      'language': 'functional',
      'theme': 'functional',
      
      // Esenciales (nunca se eliminan)
      'session': 'essential',
      'csrf_token': 'essential'
    };
  };

  /**
   * Elimina una cookie específica
   */
  const deleteCookie = (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  };

  /**
   * Configura scripts de terceros según el consentimiento
   */
  const configureThirdPartyScripts = (categories: Record<string, boolean>): void => {
    // Google Analytics
    if (categories.analytics) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    // Marketing/Advertising
    if (categories.marketing) {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    } else {
      window.gtag?.('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  };

  /**
   * Envía el consentimiento al servidor para auditoría
   */
  const sendConsentToServer = async (consent: CookieConsent): Promise<void> => {
    try {
      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(consent)
      });
    } catch (error) {
      console.warn('Could not send consent to server:', error);
      // No es crítico si falla, el consentimiento se guarda localmente
    }
  };

  /**
   * Obtiene el estado actual de consentimiento
   */
  const getConsentState = useCallback((): CookieConsentState | null => {
    return consentState;
  }, [consentState]);

  /**
   * Limpia todo el consentimiento
   */
  const clearConsent = useCallback((): void => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsentState(null);
    setHasConsent(false);

    // Eliminar todas las cookies no esenciales
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      const categoryMapping = getCookieCategoryMapping();
      const cookieCategory = categoryMapping[name];
      
      if (cookieCategory && cookieCategory !== 'essential') {
        deleteCookie(name);
      }
    });
  }, []);

  /**
   * Verifica si una categoría específica tiene consentimiento
   */
  const checkCategoryConsent = useCallback((categoryId: string): boolean => {
    if (!consentState || !isConsentValid()) return false;
    return consentState.categories[categoryId] || false;
  }, [consentState, isConsentValid]);

  // Cargar consentimiento al montar el componente
  useEffect(() => {
    const loadedConsent = loadConsentFromStorage();
    
    if (loadedConsent) {
      setConsentState(loadedConsent);
      
      // Verificar si el consentimiento es válido
      const valid = loadedConsent.version === CONSENT_VERSION && (() => {
        const expiryDate = new Date(loadedConsent.timestamp);
        expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);
        return new Date() < expiryDate;
      })();
      
      if (valid) {
        setHasConsent(true);
        applyCookieConsent(loadedConsent.categories);
      } else {
        // Consentimiento expirado o versión antigua
        clearConsent();
      }
    }
  }, [loadConsentFromStorage, clearConsent]);

  return {
    hasConsent,
    consentState,
    updateConsent,
    getConsentState,
    clearConsent,
    isConsentValid,
    checkCategoryConsent
  };
};

// Declaración de tipos globales para gtag
/* eslint-disable no-unused-vars */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
/* eslint-enable no-unused-vars */
