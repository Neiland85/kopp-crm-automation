/**
 * Configuración de Ejemplo para Política de Cookies
 * Adaptable para diferentes organizaciones
 */

export const CookieConfigExample = {
  // Configuración básica de la organización
  organization: {
    name: 'Kopp Stadium S.L.',
    address: 'Calle Ejemplo, 123, 28001 Madrid, España',
    email: 'privacidad@kopp-stadium.com',
    phone: '+34 900 123 456',
    dpo: 'dpo@kopp-stadium.com',
    website: 'https://kopp-stadium.com'
  },

  // Configuración técnica de cookies
  technical: {
    domain: '.kopp-stadium.com',
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
    debugMode: false
  },

  // Configuración de servicios terceros
  services: {
    analytics: {
      googleAnalytics: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX',
        anonymizeIP: true,
        cookieExpires: 63072000, // 2 años
        dataRetention: 14 // meses
      }
    },
    marketing: {
      facebookPixel: {
        enabled: true,
        pixelId: 'XXXXXXXXXX',
        cookieExpires: 7776000 // 3 meses
      },
      googleAds: {
        enabled: true,
        conversionId: 'AW-XXXXXXXXXX',
        cookieExpires: 46656000 // 18 meses
      },
      linkedInAds: {
        enabled: true,
        partnerId: 'XXXXXXXXXX',
        cookieExpires: 7776000 // 3 meses
      }
    },
    functional: {
      chatWidget: {
        enabled: true,
        provider: 'Zendesk',
        cookieExpires: 2592000 // 30 días
      },
      videoPlayer: {
        enabled: true,
        provider: 'YouTube',
        cookieExpires: 15552000 // 6 meses
      }
    }
  },

  // Configuración de UI/UX
  ui: {
    banner: {
      position: 'bottom' as const,
      theme: 'light' as const,
      showAdvancedOptions: true,
      autoShow: true,
      showOnlyForEU: true
    },
    policyPage: {
      interactive: true,
      showPrintButton: true,
      showDownloadButton: true,
      enableSearch: true,
      showCompliance: true
    }
  },

  // Configuración de cumplimiento
  compliance: {
    autoRenewal: {
      enabled: true,
      intervalMonths: 13,
      showRenewalBanner: true
    },
    dataRetention: {
      consentRecords: 36, // meses
      auditLogs: 24, // meses
      userRequests: 12 // meses
    },
    notifications: {
      email: 'privacy-alerts@kopp-stadium.com',
      slack: '#privacy-alerts',
      webhook: 'https://hooks.slack.com/services/...'
    }
  },

  // Configuración de idiomas
  localization: {
    defaultLanguage: 'es',
    supportedLanguages: ['es', 'en', 'fr', 'de'],
    translations: {
      es: {
        cookieBanner: {
          title: '🍪 Configuración de Cookies',
          description: 'Utilizamos cookies para mejorar tu experiencia...',
          acceptAll: 'Aceptar Todas',
          rejectAll: 'Solo Esenciales',
          configure: 'Configurar'
        }
      },
      en: {
        cookieBanner: {
          title: '🍪 Cookie Settings',
          description: 'We use cookies to enhance your experience...',
          acceptAll: 'Accept All',
          rejectAll: 'Essential Only',
          configure: 'Configure'
        }
      }
    }
  },

  // Configuración de monitoreo
  monitoring: {
    analytics: {
      trackConsentChanges: true,
      trackCookieBlocking: true,
      trackUserPreferences: true
    },
    logging: {
      level: 'info',
      includeUserAgent: true,
      includeIPAddress: false, // Por privacidad
      includeTimestamp: true
    },
    alerts: {
      failedConsent: true,
      unusualActivity: true,
      complianceIssues: true
    }
  }
};

// Validador de configuración
export const validateCookieConfig = (config: typeof CookieConfigExample): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar información organizacional
  if (!config.organization.name) {
    errors.push('Nombre de organización requerido');
  }
  if (!config.organization.email || !config.organization.email.includes('@')) {
    errors.push('Email de contacto válido requerido');
  }
  if (!config.organization.dpo || !config.organization.dpo.includes('@')) {
    errors.push('Email de DPO válido requerido');
  }

  // Validar configuración técnica
  if (!config.technical.domain) {
    errors.push('Dominio requerido');
  }
  if (!config.technical.domain.startsWith('.')) {
    warnings.push('Dominio debe comenzar con . para subdominios');
  }
  if (!config.technical.secure && config.technical.domain.includes('https')) {
    warnings.push('Configuración segura recomendada para HTTPS');
  }

  // Validar servicios
  if (config.services.analytics.googleAnalytics.enabled) {
    if (!config.services.analytics.googleAnalytics.measurementId) {
      errors.push('Measurement ID de Google Analytics requerido');
    }
    if (config.services.analytics.googleAnalytics.dataRetention > 38) {
      warnings.push('Retención de datos de GA superior a límite recomendado');
    }
  }

  // Validar cumplimiento
  if (config.compliance.autoRenewal.intervalMonths < 12) {
    warnings.push('Intervalo de renovación menor a 12 meses');
  }
  if (config.compliance.dataRetention.consentRecords < 24) {
    warnings.push('Retención de consentimientos menor a 2 años');
  }

  // Validar localización
  if (!config.localization.supportedLanguages.includes(config.localization.defaultLanguage)) {
    errors.push('Idioma por defecto debe estar en idiomas soportados');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Generador de configuración personalizada
export const generateCustomConfig = (overrides: Partial<typeof CookieConfigExample>) => {
  return {
    ...CookieConfigExample,
    ...overrides,
    organization: {
      ...CookieConfigExample.organization,
      ...overrides.organization
    },
    technical: {
      ...CookieConfigExample.technical,
      ...overrides.technical
    },
    services: {
      ...CookieConfigExample.services,
      ...overrides.services
    },
    ui: {
      ...CookieConfigExample.ui,
      ...overrides.ui
    },
    compliance: {
      ...CookieConfigExample.compliance,
      ...overrides.compliance
    },
    localization: {
      ...CookieConfigExample.localization,
      ...overrides.localization
    },
    monitoring: {
      ...CookieConfigExample.monitoring,
      ...overrides.monitoring
    }
  };
};

export default CookieConfigExample;
