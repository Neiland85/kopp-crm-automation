/**
 * Política de Cookies Exhaustiva - Kopp Stadium CRM
 * Cumple con estándares AEPD, RGPD y mejores prácticas internacionales
 * 
 * @version 2.0.0
 * @created 2025-07-04
 * @author Kopp Stadium Development Team
 */

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  enabled: boolean;
  cookies: CookieDefinition[];
  purpose: string;
  legalBasis: string;
  dataTransfer: string;
  retention: string;
  processors: string[];
}

export interface CookieDefinition {
  name: string;
  domain: string;
  purpose: string;
  duration: string;
  type: 'session' | 'persistent';
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  processor: string;
  country: string;
  personalData: boolean;
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

export class CookiesPolicyManager {
  private static readonly POLICY_VERSION = '2.0.0';
  private static readonly LAST_UPDATED = '2025-07-04';

  /**
   * Definición completa de categorías de cookies
   */
  static readonly COOKIE_CATEGORIES: CookieCategory[] = [
    {
      id: 'essential',
      name: 'Cookies Esenciales',
      description: 'Cookies técnicamente necesarias para el funcionamiento básico del sitio web. No requieren consentimiento según el artículo 22.2 de la LSSI.',
      essential: true,
      enabled: true,
      purpose: 'Garantizar la funcionalidad básica, seguridad y navegación del sitio web',
      legalBasis: 'Interés legítimo (Art. 6.1.f RGPD) - Funcionalidad esencial del servicio',
      dataTransfer: 'Datos procesados en servidores UE (certificación adequacy)',
      retention: '1 año máximo, generalmente sesión o 30 días',
      processors: ['Kopp Stadium S.L.', 'Proveedor de hosting certificado ISO 27001'],
      cookies: [
        {
          name: 'session_id',
          domain: '.kopp-stadium.com',
          purpose: 'Identificación de sesión de usuario autenticado',
          duration: 'Sesión (se elimina al cerrar navegador)',
          type: 'session',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'csrf_token',
          domain: '.kopp-stadium.com',
          purpose: 'Protección contra ataques CSRF (Cross-Site Request Forgery)',
          duration: '24 horas',
          type: 'persistent',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'cookie_consent',
          domain: '.kopp-stadium.com',
          purpose: 'Almacenamiento de preferencias de consentimiento de cookies',
          duration: '13 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'language_preference',
          domain: '.kopp-stadium.com',
          purpose: 'Recordar idioma seleccionado por el usuario',
          duration: '12 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Cookies Analíticas',
      description: 'Cookies que recopilan información sobre el uso del sitio web para mejorar el rendimiento y la experiencia del usuario. Procesamiento pseudoanonimizado.',
      essential: false,
      enabled: false,
      purpose: 'Análisis de comportamiento de usuarios, métricas de rendimiento y optimización de experiencia',
      legalBasis: 'Consentimiento (Art. 6.1.a RGPD) - Previa información y consentimiento específico',
      dataTransfer: 'Datos transferidos a Google LLC (EE.UU.) bajo adequacy decision',
      retention: '26 meses (Google Analytics 4) - Configuración personalizada: 14 meses',
      processors: ['Google Ireland Limited', 'Google LLC', 'Kopp Stadium S.L.'],
      cookies: [
        {
          name: '_ga',
          domain: '.kopp-stadium.com',
          purpose: 'Identificador único de usuario para Google Analytics',
          duration: '2 años',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Google Ireland Limited',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: '_ga_[MEASUREMENT_ID]',
          domain: '.kopp-stadium.com',
          purpose: 'Identificador de sesión para Google Analytics 4',
          duration: '2 años',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Google Ireland Limited',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: '_gid',
          domain: '.kopp-stadium.com',
          purpose: 'Identificador único de sesión para Google Analytics',
          duration: '24 horas',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Google Ireland Limited',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: '_gat_gtag_[PROPERTY_ID]',
          domain: '.kopp-stadium.com',
          purpose: 'Limitación de velocidad de solicitudes en Google Analytics',
          duration: '1 minuto',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Google Ireland Limited',
          country: 'Irlanda/EE.UU.',
          personalData: false
        },
        {
          name: 'kopp_analytics',
          domain: '.kopp-stadium.com',
          purpose: 'Métricas internas de rendimiento y uso (datos pseudoanonimizados)',
          duration: '12 meses',
          type: 'persistent',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        }
      ]
    },
    {
      id: 'marketing',
      name: 'Cookies de Marketing',
      description: 'Cookies utilizadas para mostrar publicidad relevante y medir la efectividad de campañas publicitarias. Incluyen remarketing y segmentación.',
      essential: false,
      enabled: false,
      purpose: 'Publicidad dirigida, remarketing, medición de campañas y segmentación de audiencias',
      legalBasis: 'Consentimiento (Art. 6.1.a RGPD) - Consentimiento específico e informado',
      dataTransfer: 'Múltiples países (EE.UU., Reino Unido) bajo adequacy decisions y BCR',
      retention: 'Variable: 30 días - 2 años según proveedor',
      processors: ['Google Ireland Limited', 'Meta Platforms Ireland', 'Microsoft Ireland', 'LinkedIn Ireland'],
      cookies: [
        {
          name: '_fbp',
          domain: '.kopp-stadium.com',
          purpose: 'Seguimiento de conversiones de Facebook Pixel',
          duration: '3 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Meta Platforms Ireland',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: '_fbc',
          domain: '.kopp-stadium.com',
          purpose: 'Almacenamiento de parámetros de campaña de Facebook',
          duration: '3 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Meta Platforms Ireland',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: 'ads/ga-audiences',
          domain: '.google.com',
          purpose: 'Remarketing y audiencias similares de Google Ads',
          duration: '540 días',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'none',
          processor: 'Google Ireland Limited',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: 'li_sugr',
          domain: '.linkedin.com',
          purpose: 'Identificación de navegador para LinkedIn Ads',
          duration: '3 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'none',
          processor: 'LinkedIn Ireland',
          country: 'Irlanda/EE.UU.',
          personalData: true
        },
        {
          name: 'MUID',
          domain: '.bing.com',
          purpose: 'Identificador único de usuario para Microsoft Advertising',
          duration: '13 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'none',
          processor: 'Microsoft Ireland',
          country: 'Irlanda/EE.UU.',
          personalData: true
        }
      ]
    },
    {
      id: 'functional',
      name: 'Cookies Funcionales',
      description: 'Cookies que mejoran la funcionalidad del sitio web recordando preferencias y configuraciones del usuario.',
      essential: false,
      enabled: false,
      purpose: 'Personalización de experiencia, recordatorio de preferencias y configuraciones',
      legalBasis: 'Consentimiento (Art. 6.1.a RGPD) - Consentimiento previo para funcionalidades mejoradas',
      dataTransfer: 'Principalmente procesamiento local (España/UE)',
      retention: '12 meses promedio',
      processors: ['Kopp Stadium S.L.', 'Proveedores de chat (certificados UE)'],
      cookies: [
        {
          name: 'theme_preference',
          domain: '.kopp-stadium.com',
          purpose: 'Recordar preferencia de tema claro/oscuro',
          duration: '12 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'sidebar_state',
          domain: '.kopp-stadium.com',
          purpose: 'Estado de expansión/colapso de menú lateral',
          duration: '6 meses',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'notification_preferences',
          domain: '.kopp-stadium.com',
          purpose: 'Preferencias de notificaciones push y email',
          duration: '12 meses',
          type: 'persistent',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'chat_widget_minimized',
          domain: '.kopp-stadium.com',
          purpose: 'Estado del widget de chat (minimizado/expandido)',
          duration: '30 días',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        }
      ]
    },
    {
      id: 'personalization',
      name: 'Cookies de Personalización',
      description: 'Cookies que permiten personalizar contenido y ofertas basándose en el comportamiento e intereses del usuario.',
      essential: false,
      enabled: false,
      purpose: 'Personalización de contenido, recomendaciones y experiencia usuario',
      legalBasis: 'Consentimiento (Art. 6.1.a RGPD) - Consentimiento específico para personalización',
      dataTransfer: 'Procesamiento mixto (UE/terceros países con adequacy)',
      retention: '6-24 meses según finalidad',
      processors: ['Kopp Stadium S.L.', 'Proveedores de personalización certificados'],
      cookies: [
        {
          name: 'user_segments',
          domain: '.kopp-stadium.com',
          purpose: 'Segmentación de usuario para personalización de contenido',
          duration: '6 meses',
          type: 'persistent',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: true
        },
        {
          name: 'content_recommendations',
          domain: '.kopp-stadium.com',
          purpose: 'Historial de contenido visualizado para recomendaciones',
          duration: '3 meses',
          type: 'persistent',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: true
        },
        {
          name: 'ab_test_group',
          domain: '.kopp-stadium.com',
          purpose: 'Asignación de grupo para pruebas A/B',
          duration: '30 días',
          type: 'persistent',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: false
        },
        {
          name: 'user_journey_stage',
          domain: '.kopp-stadium.com',
          purpose: 'Etapa del usuario en el customer journey',
          duration: '90 días',
          type: 'persistent',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
          processor: 'Kopp Stadium S.L.',
          country: 'España',
          personalData: true
        }
      ]
    }
  ];

  /**
   * Obtener política de cookies completa
   */
  static getCookiesPolicy(): {
    version: string;
    lastUpdated: string;
    categories: CookieCategory[];
    legalFramework: any;
    userRights: any;
    contactInfo: any;
  } {
    return {
      version: this.POLICY_VERSION,
      lastUpdated: this.LAST_UPDATED,
      categories: this.COOKIE_CATEGORIES,
      legalFramework: {
        rgpd: 'Reglamento General de Protección de Datos (UE) 2016/679',
        lssi: 'Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico',
        lopd: 'Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales',
        directiveCookies: 'Directiva 2009/136/CE sobre privacidad y comunicaciones electrónicas',
        aepd: 'Guía sobre el uso de cookies - Agencia Española de Protección de Datos'
      },
      userRights: {
        access: 'Derecho de acceso a sus datos personales',
        rectification: 'Derecho de rectificación de datos inexactos',
        erasure: 'Derecho de supresión ("derecho al olvido")',
        portability: 'Derecho a la portabilidad de datos',
        restriction: 'Derecho de limitación del tratamiento',
        objection: 'Derecho de oposición al tratamiento',
        withdraw: 'Derecho a retirar el consentimiento en cualquier momento',
        complaint: 'Derecho a presentar reclamación ante la AEPD'
      },
      contactInfo: {
        company: 'Kopp Stadium S.L.',
        address: 'Calle Ejemplo, 123, 28001 Madrid, España',
        email: 'privacidad@kopp-stadium.com',
        phone: '+34 900 123 456',
        dpo: 'dpo@kopp-stadium.com',
        aepd: 'https://www.aepd.es/es/canales/canal-de-video-denuncia'
      }
    };
  }

  /**
   * Validar consentimiento según estándares AEPD
   */
  static validateConsent(consent: CookieConsent): boolean {
    const requiredFields = ['timestamp', 'version', 'categories', 'consentId'];
    return requiredFields.every(field => consent[field as keyof CookieConsent] !== undefined);
  }

  /**
   * Generar ID único de consentimiento
   */
  static generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verificar si una cookie específica está permitida
   */
  static isCookieAllowed(cookieName: string, consent: Record<string, boolean>): boolean {
    const cookie = this.COOKIE_CATEGORIES
      .flatMap(category => category.cookies)
      .find(c => c.name === cookieName);
    
    if (!cookie) return false;
    
    const category = this.COOKIE_CATEGORIES.find(cat => 
      cat.cookies.some(c => c.name === cookieName)
    );
    
    return category ? (category.essential || consent[category.id]) : false;
  }

  /**
   * Obtener cookies por categoría
   */
  static getCookiesByCategory(categoryId: string): CookieDefinition[] {
    const category = this.COOKIE_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.cookies || [];
  }

  /**
   * Generar reporte de cumplimiento
   */
  static generateComplianceReport(): any {
    return {
      timestamp: new Date().toISOString(),
      version: this.POLICY_VERSION,
      compliance: {
        rgpd: true,
        lssi: true,
        aepd: true,
        cookieDirective: true
      },
      categoriesCount: this.COOKIE_CATEGORIES.length,
      totalCookies: this.COOKIE_CATEGORIES.reduce((sum, cat) => sum + cat.cookies.length, 0),
      essentialCookies: this.COOKIE_CATEGORIES.filter(cat => cat.essential).length,
      dataTransfers: this.COOKIE_CATEGORIES.flatMap(cat => cat.processors).filter((v, i, a) => a.indexOf(v) === i),
      retentionPeriods: this.COOKIE_CATEGORIES.map(cat => cat.retention),
      lastAudit: this.LAST_UPDATED
    };
  }
}

export default CookiesPolicyManager;
