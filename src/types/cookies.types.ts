/**
 * Tipos relacionados con la gestión de cookies y consentimiento RGPD
 */

export interface CookieConsentState {
  timestamp: Date;
  version: string;
  categories: Record<string, boolean>;
  consentId: string;
}

export interface CookieConsent {
  timestamp: Date;
  version: string;
  categories: Record<string, boolean>;
  ipAddress: string;
  userAgent: string;
  consentId: string;
  method: 'banner' | 'settings' | 'api';
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  cookies: CookieInfo[];
}

export interface CookieInfo {
  name: string;
  description: string;
  duration: string;
  provider: string;
  purpose: string;
}

export interface ConsentConfiguration {
  version: string;
  expiryDays: number;
  storageKey: string;
  serverEndpoint?: string;
}

export interface ThirdPartyConsent {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  essential: boolean;
}

export interface CookieMapping {
  [cookieName: string]: string; // cookieName -> categoryId
}

export interface ConsentEventDetail {
  consent: CookieConsent;
  previousConsent?: CookieConsentState;
}

export type ConsentMethod = 'banner' | 'settings' | 'api' | 'withdrawal';

export interface ConsentAuditLog {
  consentId: string;
  timestamp: Date;
  method: ConsentMethod;
  categories: Record<string, boolean>;
  ipAddress: string;
  userAgent: string;
  previousConsentId?: string;
}
