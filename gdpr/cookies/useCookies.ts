/**
 * React Hook para gestión de cookies
 * Proporciona una interfaz sencilla para manejar consentimiento de cookies
 */

import { useState, useEffect, useCallback } from 'react';
import { CookieManager } from '../services/CookieManager';
import { CookiesPolicyManager } from '../policies/cookies-policy';

export interface UseCookiesReturn {
  // Estado del consentimiento
  isConsentRequired: boolean;
  isLoading: boolean;
  consent: Record<string, boolean>;
  
  // Acciones
  acceptAllCookies: () => void;
  rejectAllCookies: () => void;
  updateConsent: (categories: Record<string, boolean>) => void;
  withdrawConsent: () => void;
  
  // Utilidades
  isCookieAllowed: (cookieName: string) => boolean;
  getCategoryConsent: (categoryId: string) => boolean;
  
  // Estadísticas
  cookieStats: {
    totalCookies: number;
    allowedCookies: number;
    blockedCookies: number;
    categories: Array<{
      id: string;
      name: string;
      allowed: boolean;
      cookieCount: number;
    }>;
  };
  
  // Información de políticas
  categories: any[];
  policyVersion: string;
  lastUpdated: string | null;
}

export const useCookies = (): UseCookiesReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConsentRequired, setIsConsentRequired] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [cookieStats, setCookieStats] = useState<{
    totalCookies: number;
    allowedCookies: number;
    blockedCookies: number;
    categories: Array<{
      id: string;
      name: string;
      allowed: boolean;
      cookieCount: number;
    }>;
  }>({
    totalCookies: 0,
    allowedCookies: 0,
    blockedCookies: 0,
    categories: []
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const cookieManager = CookieManager.getInstance();
  const policyData = CookiesPolicyManager.getCookiesPolicy();

  // Inicializar estado
  useEffect(() => {
    const initializeCookieState = async () => {
      try {
        const isRequired = cookieManager.isConsentRequired();
        setIsConsentRequired(isRequired);

        const storedConsent = cookieManager.getStoredConsent();
        if (storedConsent) {
          setConsent(storedConsent.categories);
          setLastUpdated(storedConsent.timestamp.toISOString());
        } else {
          // Inicializar con cookies esenciales
          const essentialConsent = policyData.categories.reduce((acc, category) => {
            acc[category.id] = category.essential;
            return acc;
          }, {} as Record<string, boolean>);
          setConsent(essentialConsent);
        }

        // Actualizar estadísticas
        const stats = cookieManager.getCookieStats();
        setCookieStats(stats);

        setIsLoading(false);
      } catch (error) {
        console.error('Error inicializando estado de cookies:', error);
        setIsLoading(false);
      }
    };

    initializeCookieState();
  }, []);

  // Suscribirse a cambios de consentimiento
  useEffect(() => {
    const handleConsentChange = (newConsent: Record<string, boolean>) => {
      setConsent(newConsent);
      setIsConsentRequired(false);
      setLastUpdated(new Date().toISOString());
      
      // Actualizar estadísticas
      const stats = cookieManager.getCookieStats();
      setCookieStats(stats);
    };

    cookieManager.onConsentChange(handleConsentChange);
  }, []);

  // Aceptar todas las cookies
  const acceptAllCookies = useCallback(() => {
    const allConsent = policyData.categories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>);

    cookieManager.saveConsent(allConsent, 'banner');
  }, [policyData]);

  // Rechazar cookies opcionales
  const rejectAllCookies = useCallback(() => {
    const essentialOnly = policyData.categories.reduce((acc, category) => {
      acc[category.id] = category.essential;
      return acc;
    }, {} as Record<string, boolean>);

    cookieManager.saveConsent(essentialOnly, 'banner');
  }, [policyData]);

  // Actualizar consentimiento personalizado
  const updateConsent = useCallback((categories: Record<string, boolean>) => {
    cookieManager.saveConsent(categories, 'settings');
  }, []);

  // Retirar consentimiento
  const withdrawConsent = useCallback(() => {
    cookieManager.withdrawConsent();
    setIsConsentRequired(true);
    setLastUpdated(null);
    
    // Resetear a solo esenciales
    const essentialOnly = policyData.categories.reduce((acc, category) => {
      acc[category.id] = category.essential;
      return acc;
    }, {} as Record<string, boolean>);
    setConsent(essentialOnly);
  }, [policyData]);

  // Verificar si una cookie específica está permitida
  const isCookieAllowed = useCallback((cookieName: string) => {
    return cookieManager.isCookieAllowed(cookieName);
  }, [consent]);

  // Obtener consentimiento por categoría
  const getCategoryConsent = useCallback((categoryId: string) => {
    return cookieManager.getCategoryConsent(categoryId);
  }, [consent]);

  return {
    // Estado
    isConsentRequired,
    isLoading,
    consent,
    
    // Acciones
    acceptAllCookies,
    rejectAllCookies,
    updateConsent,
    withdrawConsent,
    
    // Utilidades
    isCookieAllowed,
    getCategoryConsent,
    
    // Estadísticas
    cookieStats,
    
    // Información de políticas
    categories: policyData.categories,
    policyVersion: policyData.version,
    lastUpdated
  };
};

export default useCookies;
