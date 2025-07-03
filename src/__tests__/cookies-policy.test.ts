/**
 * Tests para Cookie Policy Manager
 * Valida cumplimiento con estándares AEPD y RGPD
 */

import { CookiesPolicyManager } from '../policies/cookies-policy';

describe('CookiesPolicyManager', () => {
  describe('Estructura de Política', () => {
    it('debe tener todas las categorías requeridas', () => {
      const policy = CookiesPolicyManager.getCookiesPolicy();
      
      expect(policy.categories).toHaveLength(5);
      
      const categoryIds = policy.categories.map(cat => cat.id);
      expect(categoryIds).toContain('essential');
      expect(categoryIds).toContain('analytics');
      expect(categoryIds).toContain('marketing');
      expect(categoryIds).toContain('functional');
      expect(categoryIds).toContain('personalization');
    });

    it('debe incluir información legal completa', () => {
      const policy = CookiesPolicyManager.getCookiesPolicy();
      
      expect(policy.legalFramework).toBeDefined();
      expect(policy.legalFramework.rgpd).toContain(
        'Reglamento General de Protección de Datos'
      );
      expect(policy.legalFramework.lssi).toContain('Ley 34/2002');
      expect(policy.legalFramework.aepd).toContain('Agencia Española');
      
      expect(policy.userRights).toBeDefined();
      expect(policy.contactInfo).toBeDefined();
    });

    it('debe tener versión y fecha de actualización', () => {
      const policy = CookiesPolicyManager.getCookiesPolicy();
      
      expect(policy.version).toBeDefined();
      expect(policy.lastUpdated).toBeDefined();
      expect(policy.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Categorías de Cookies', () => {
    it('debe tener exactamente una categoría esencial', () => {
      const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
      const essentialCategories = categories.filter(cat => cat.essential);
      
      expect(essentialCategories).toHaveLength(1);
      expect(essentialCategories[0].id).toBe('essential');
    });

    it('debe incluir información completa para cada categoría', () => {
      const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
      
      categories.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.purpose).toBeDefined();
        expect(category.legalBasis).toBeDefined();
        expect(category.dataTransfer).toBeDefined();
        expect(category.retention).toBeDefined();
        expect(category.processors).toBeDefined();
        expect(category.cookies).toBeDefined();
        expect(Array.isArray(category.cookies)).toBe(true);
      });
    });

    it('debe incluir cookies con información técnica completa', () => {
      const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
      
      categories.forEach(category => {
        category.cookies.forEach(cookie => {
          expect(cookie.name).toBeDefined();
          expect(cookie.domain).toBeDefined();
          expect(cookie.purpose).toBeDefined();
          expect(cookie.duration).toBeDefined();
          expect(cookie.type).toMatch(/^(session|persistent)$/);
          expect(typeof cookie.secure).toBe('boolean');
          expect(typeof cookie.httpOnly).toBe('boolean');
          expect(cookie.sameSite).toMatch(/^(strict|lax|none)$/);
          expect(cookie.processor).toBeDefined();
          expect(cookie.country).toBeDefined();
          expect(typeof cookie.personalData).toBe('boolean');
        });
      });
    });
  });

  describe('Validación de Consentimiento', () => {
    it('debe validar consentimiento válido', () => {
      const validConsent = {
        timestamp: new Date(),
        version: '2.0.0',
        categories: { essential: true, analytics: false },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        consentId: 'consent_123',
        method: 'banner' as const
      };

      const isValid = CookiesPolicyManager.validateConsent(validConsent);
      expect(isValid).toBe(true);
    });

    it('debe rechazar consentimiento inválido', () => {
      const invalidConsent = {
        timestamp: new Date(),
        version: '2.0.0',
        // Falta categories
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        consentId: 'consent_123',
        method: 'banner' as const
      };

      const isValid = CookiesPolicyManager.validateConsent(invalidConsent as any);
      expect(isValid).toBe(false);
    });
  });

  describe('Gestión de Cookies', () => {
    it('debe generar IDs únicos de consentimiento', () => {
      const id1 = CookiesPolicyManager.generateConsentId();
      const id2 = CookiesPolicyManager.generateConsentId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^consent_\d+_[a-z0-9]+$/);
    });

    it('debe verificar permisos de cookies correctamente', () => {
      const consent = {
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
        personalization: false
      };

      // Cookie esencial debe estar siempre permitida
      expect(CookiesPolicyManager.isCookieAllowed('session_id', consent)).toBe(true);
      
      // Cookie de analytics debe estar permitida
      expect(CookiesPolicyManager.isCookieAllowed('_ga', consent)).toBe(true);
      
      // Cookie de marketing debe estar bloqueada
      expect(CookiesPolicyManager.isCookieAllowed('_fbp', consent)).toBe(false);
    });

    it('debe obtener cookies por categoría', () => {
      const essentialCookies = CookiesPolicyManager.getCookiesByCategory('essential');
      const analyticsCookies = CookiesPolicyManager.getCookiesByCategory('analytics');
      
      expect(essentialCookies.length).toBeGreaterThan(0);
      expect(analyticsCookies.length).toBeGreaterThan(0);
      
      // Verificar que son cookies de la categoría correcta
      expect(essentialCookies.find(c => c.name === 'session_id')).toBeDefined();
      expect(analyticsCookies.find(c => c.name === '_ga')).toBeDefined();
    });
  });

  describe('Reporte de Cumplimiento', () => {
    it('debe generar reporte de cumplimiento completo', () => {
      const report = CookiesPolicyManager.generateComplianceReport();
      
      expect(report.timestamp).toBeDefined();
      expect(report.version).toBeDefined();
      expect(report.compliance).toBeDefined();
      expect(report.compliance.rgpd).toBe(true);
      expect(report.compliance.lssi).toBe(true);
      expect(report.compliance.aepd).toBe(true);
      expect(report.compliance.cookieDirective).toBe(true);
      
      expect(report.categoriesCount).toBe(5);
      expect(report.totalCookies).toBeGreaterThan(0);
      expect(report.essentialCookies).toBe(1);
      expect(Array.isArray(report.dataTransfers)).toBe(true);
      expect(Array.isArray(report.retentionPeriods)).toBe(true);
    });

    it('debe incluir información de transferencias internacionales', () => {
      const report = CookiesPolicyManager.generateComplianceReport();
      
      expect(report.dataTransfers).toContain('Google Ireland Limited');
      expect(report.dataTransfers).toContain('Meta Platforms Ireland');
      expect(report.dataTransfers).toContain('Microsoft Ireland');
      expect(report.dataTransfers).toContain('LinkedIn Ireland');
    });
  });

  describe('Cumplimiento AEPD', () => {
    it('debe cumplir con requisitos de información de AEPD', () => {
      const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
      
      categories.forEach(category => {
        // Debe especificar finalidad clara
        expect(category.purpose.length).toBeGreaterThan(10);
        
        // Debe especificar base legal
        expect(category.legalBasis).toContain('RGPD');
        
        // Debe especificar período de retención
        expect(category.retention.length).toBeGreaterThan(0);
        
        // Debe especificar transferencias internacionales
        expect(category.dataTransfer.length).toBeGreaterThan(0);
        
        // Debe listar procesadores
        expect(category.processors.length).toBeGreaterThan(0);
      });
    });

    it('debe distinguir correctamente cookies esenciales y opcionales', () => {
      const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
      
      const essentialCategory = categories.find(cat => cat.id === 'essential');
      const optionalCategories = categories.filter(cat => cat.id !== 'essential');
      
      expect(essentialCategory?.essential).toBe(true);
      expect(essentialCategory?.legalBasis).toContain('Interés legítimo');
      
      optionalCategories.forEach(category => {
        expect(category.essential).toBe(false);
        expect(category.legalBasis).toContain('Consentimiento');
      });
    });

    it('debe incluir información de derechos del usuario', () => {
      const policy = CookiesPolicyManager.getCookiesPolicy();
      
      expect(policy.userRights.access).toBeDefined();
      expect(policy.userRights.rectification).toBeDefined();
      expect(policy.userRights.erasure).toBeDefined();
      expect(policy.userRights.portability).toBeDefined();
      expect(policy.userRights.restriction).toBeDefined();
      expect(policy.userRights.objection).toBeDefined();
      expect(policy.userRights.withdraw).toBeDefined();
      expect(policy.userRights.complaint).toBeDefined();
    });
  });

  describe('Información de Contacto', () => {
    it('debe incluir información de contacto completa', () => {
      const policy = CookiesPolicyManager.getCookiesPolicy();
      
      expect(policy.contactInfo.company).toBeDefined();
      expect(policy.contactInfo.address).toBeDefined();
      expect(policy.contactInfo.email).toBeDefined();
      expect(policy.contactInfo.phone).toBeDefined();
      expect(policy.contactInfo.dpo).toBeDefined();
      expect(policy.contactInfo.aepd).toBeDefined();
      
      // Verificar formato de email
      expect(policy.contactInfo.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(policy.contactInfo.dpo).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      // Verificar URL de AEPD
      expect(policy.contactInfo.aepd).toMatch(/^https?:\/\//);
    });
  });
});

describe('Comparación con Estándares', () => {
  it('debe superar estándares básicos de AEPD', () => {
    const categories = CookiesPolicyManager.COOKIE_CATEGORIES;
    const totalCookies = categories.reduce((sum, cat) => sum + cat.cookies.length, 0);
    
    // Debe tener más de 10 cookies clasificadas
    expect(totalCookies).toBeGreaterThan(10);
    
    // Debe tener al menos 5 categorías
    expect(categories.length).toBeGreaterThanOrEqual(5);
    
    // Debe especificar información técnica detallada
    categories.forEach(category => {
      category.cookies.forEach(cookie => {
        expect(cookie.secure).toBeDefined();
        expect(cookie.httpOnly).toBeDefined();
        expect(cookie.sameSite).toBeDefined();
        expect(cookie.personalData).toBeDefined();
      });
    });
  });

  it('debe incluir más información que implementaciones estándar', () => {
    const policy = CookiesPolicyManager.getCookiesPolicy();
    
    // Debe incluir información de transferencias internacionales
    policy.categories.forEach(category => {
      expect(category.dataTransfer.length).toBeGreaterThan(0);
      expect(category.processors.length).toBeGreaterThan(0);
    });
    
    // Debe incluir información técnica avanzada
    policy.categories.forEach(category => {
      category.cookies.forEach(cookie => {
        expect(cookie.processor).toBeDefined();
        expect(cookie.country).toBeDefined();
        expect(typeof cookie.personalData).toBe('boolean');
      });
    });
  });
});
