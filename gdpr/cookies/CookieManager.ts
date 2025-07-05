/**
 * Cookie Management Service
 * Servicio para gestionar consentimiento de cookies y cumplimiento RGPD
 */

import { CookiesPolicyManager, CookieConsent, CookieCategory } from '../policies/cookies-policy';

export interface CookieManagerConfig {
  domain: string;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  autoClean: boolean;
  debugMode: boolean;
}

export class CookieManager {
  private static instance: CookieManager;
  private config: CookieManagerConfig;
  private consentCallbacks: Array<(consent: Record<string, boolean>) => void> = [];

  private constructor(config: Partial<CookieManagerConfig> = {}) {
    this.config = {
      domain: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
      sameSite: 'strict',
      path: '/',
      autoClean: true,
      debugMode: false,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  static getInstance(config?: Partial<CookieManagerConfig>): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager(config);
    }
    return CookieManager.instance;
  }

  private initialize(): void {
    this.log('Inicializando Cookie Manager');
    
    // Verificar consentimiento existente
    const existingConsent = this.getStoredConsent();
    if (existingConsent) {
      this.enforceConsent(existingConsent.categories);
    }

    // Limpiar cookies no consentidas al inicializar
    if (this.config.autoClean) {
      this.cleanUnconsentedCookies();
    }
  }

  /**
   * Obtener consentimiento almacenado
   */
  getStoredConsent(): CookieConsent | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('cookie_consent');
      if (!stored) return null;
      
      const consent: CookieConsent = JSON.parse(stored);
      
      // Verificar si el consentimiento está actualizado
      const currentVersion = CookiesPolicyManager.getCookiesPolicy().version;
      if (consent.version !== currentVersion) {
        this.log('Consentimiento desactualizado, requiere renovación');
        return null;
      }
      
      return consent;
    } catch (error) {
      this.log('Error al obtener consentimiento almacenado:', error);
      return null;
    }
  }

  /**
   * Guardar consentimiento
   */
  saveConsent(categories: Record<string, boolean>, method: 'banner' | 'settings' | 'api' = 'banner'): void {
    const consent: CookieConsent = {
      timestamp: new Date(),
      version: CookiesPolicyManager.getCookiesPolicy().version,
      categories,
      ipAddress: '', // Se obtendría del servidor en producción
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      consentId: CookiesPolicyManager.generateConsentId(),
      method
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cookie_consent', JSON.stringify(consent));
    }

    this.enforceConsent(categories);
    this.notifyConsentChange(categories);
    this.log('Consentimiento guardado:', consent);
  }

  /**
   * Verificar si el consentimiento es requerido
   */
  isConsentRequired(): boolean {
    const consent = this.getStoredConsent();
    return !consent || !CookiesPolicyManager.validateConsent(consent);
  }

  /**
   * Verificar si una cookie específica está permitida
   */
  isCookieAllowed(cookieName: string): boolean {
    const consent = this.getStoredConsent();
    if (!consent) return false;
    
    return CookiesPolicyManager.isCookieAllowed(cookieName, consent.categories);
  }

  /**
   * Obtener consentimiento por categoría
   */
  getCategoryConsent(categoryId: string): boolean {
    const consent = this.getStoredConsent();
    if (!consent) return false;
    
    const category = CookiesPolicyManager.COOKIE_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? (category.essential || consent.categories[categoryId]) : false;
  }

  /**
   * Aplicar consentimiento eliminando cookies no permitidas
   */
  private enforceConsent(categories: Record<string, boolean>): void {
    if (typeof document === 'undefined') return;

    CookiesPolicyManager.COOKIE_CATEGORIES.forEach(category => {
      if (!category.essential && !categories[category.id]) {
        category.cookies.forEach(cookie => {
          this.deleteCookie(cookie.name, cookie.domain);
        });
      }
    });
  }

  /**
   * Eliminar cookie específica
   */
  deleteCookie(name: string, domain?: string): void {
    if (typeof document === 'undefined') return;

    const expires = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    const path = `path=${this.config.path}`;
    const domainStr = domain ? `domain=${domain}` : '';
    
    document.cookie = `${name}=; ${expires}; ${path}; ${domainStr}`;
    this.log(`Cookie eliminada: ${name}`);
  }

  /**
   * Limpiar cookies no consentidas
   */
  private cleanUnconsentedCookies(): void {
    const consent = this.getStoredConsent();
    if (!consent) return;

    this.enforceConsent(consent.categories);
  }

  /**
   * Establecer cookie respetando consentimiento
   */
  setCookie(name: string, value: string, options: {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    httpOnly?: boolean;
  } = {}): boolean {
    if (typeof document === 'undefined') return false;

    if (!this.isCookieAllowed(name)) {
      this.log(`Cookie ${name} no permitida por consentimiento`);
      return false;
    }

    const cookieOptions = {
      domain: this.config.domain,
      path: this.config.path,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      ...options
    };

    let cookieString = `${name}=${value}`;
    
    if (cookieOptions.expires) {
      cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
    }
    
    if (cookieOptions.maxAge) {
      cookieString += `; max-age=${cookieOptions.maxAge}`;
    }
    
    if (cookieOptions.domain) {
      cookieString += `; domain=${cookieOptions.domain}`;
    }
    
    if (cookieOptions.path) {
      cookieString += `; path=${cookieOptions.path}`;
    }
    
    if (cookieOptions.secure) {
      cookieString += `; secure`;
    }
    
    if (cookieOptions.sameSite) {
      cookieString += `; samesite=${cookieOptions.sameSite}`;
    }

    document.cookie = cookieString;
    this.log(`Cookie establecida: ${name}`);
    return true;
  }

  /**
   * Obtener cookie
   */
  getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  }

  /**
   * Suscribirse a cambios de consentimiento
   */
  onConsentChange(callback: (consent: Record<string, boolean>) => void): void {
    this.consentCallbacks.push(callback);
  }

  /**
   * Notificar cambios de consentimiento
   */
  private notifyConsentChange(consent: Record<string, boolean>): void {
    this.consentCallbacks.forEach(callback => {
      try {
        callback(consent);
      } catch (error) {
        this.log('Error en callback de consentimiento:', error);
      }
    });
  }

  /**
   * Retirar consentimiento
   */
  withdrawConsent(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('cookie_consent');
    }
    
    // Mantener solo cookies esenciales
    const essentialOnly = CookiesPolicyManager.COOKIE_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = category.essential;
      return acc;
    }, {} as Record<string, boolean>);

    this.enforceConsent(essentialOnly);
    this.notifyConsentChange(essentialOnly);
    this.log('Consentimiento retirado');
  }

  /**
   * Obtener estadísticas de cookies
   */
  getCookieStats(): {
    totalCookies: number;
    allowedCookies: number;
    blockedCookies: number;
    categories: Array<{
      id: string;
      name: string;
      allowed: boolean;
      cookieCount: number;
    }>;
  } {
    const consent = this.getStoredConsent();
    const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
    
    const stats = {
      totalCookies: 0,
      allowedCookies: 0,
      blockedCookies: 0,
      categories: categories.map(category => {
        const allowed = category.essential || (consent?.categories[category.id] ?? false);
        const cookieCount = category.cookies.length;
        
        return {
          id: category.id,
          name: category.name,
          allowed,
          cookieCount
        };
      })
    };

    stats.categories.forEach(category => {
      stats.totalCookies += category.cookieCount;
      if (category.allowed) {
        stats.allowedCookies += category.cookieCount;
      } else {
        stats.blockedCookies += category.cookieCount;
      }
    });

    return stats;
  }

  /**
   * Generar reporte de cumplimiento
   */
  getComplianceReport(): {
    consentStatus: 'required' | 'given' | 'partial' | 'withdrawn';
    lastUpdated: string | null;
    version: string;
    categories: Record<string, boolean>;
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
    nextReviewDate: string;
  } {
    const consent = this.getStoredConsent();
    const stats = this.getCookieStats();
    
    let consentStatus: 'required' | 'given' | 'partial' | 'withdrawn' = 'required';
    
    if (consent) {
      const totalOptional = CookiesPolicyManager.COOKIE_CATEGORIES.filter(cat => !cat.essential).length;
      const acceptedOptional = Object.entries(consent.categories).filter(([id, accepted]) => {
        const category = CookiesPolicyManager.COOKIE_CATEGORIES.find(cat => cat.id === id);
        return category && !category.essential && accepted;
      }).length;
      
      if (acceptedOptional === 0) {
        consentStatus = 'withdrawn';
      } else if (acceptedOptional === totalOptional) {
        consentStatus = 'given';
      } else {
        consentStatus = 'partial';
      }
    }

    // Calcular próxima fecha de revisión (13 meses desde el consentimiento)
    const nextReviewDate = consent ? 
      new Date(consent.timestamp.getTime() + 13 * 30 * 24 * 60 * 60 * 1000).toISOString() : 
      new Date().toISOString();

    return {
      consentStatus,
      lastUpdated: consent?.timestamp.toISOString() || null,
      version: CookiesPolicyManager.getCookiesPolicy().version,
      categories: consent?.categories || {},
      cookieStats: stats,
      nextReviewDate
    };
  }

  /**
   * Logging interno
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.debugMode) {
      console.log(`[CookieManager] ${message}`, ...args);
    }
  }
}

export default CookieManager;
