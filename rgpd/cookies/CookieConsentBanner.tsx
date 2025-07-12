/**
 * Cookie Consent Banner Component
 * Cumple con RGPD, LSSI y estándares AEPD
 * Implementa consentimiento granular por categorías
 */

import React, { useState, useEffect } from 'react';
import {
  CookiesPolicyManager,
  CookieCategory,
  CookieConsent,
} from '../../policies/cookies-policy';

interface CookieConsentBannerProps {
  onConsentChange?: (consent: Record<string, boolean>) => void;
  showAdvancedOptions?: boolean;
  position?: 'bottom' | 'top';
  theme?: 'light' | 'dark';
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onConsentChange,
  showAdvancedOptions = false,
  position = 'bottom',
  theme = 'light'
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [categories] = useState<CookieCategory[]>(CookiesPolicyManager.COOKIE_CATEGORIES);

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = () => {
    const storedConsent = localStorage.getItem('cookie_consent');
    if (!storedConsent) {
      setShowBanner(true);
      initializeDefaultConsent();
    } else {
      const parsed = JSON.parse(storedConsent);
      if (parsed.version !== CookiesPolicyManager.getCookiesPolicy().version) {
        setShowBanner(true);
        initializeDefaultConsent();
      } else {
        setConsent(parsed.categories);
      }
    }
  };

  const initializeDefaultConsent = () => {
    const defaultConsent = categories.reduce((acc, category) => {
      acc[category.id] = category.essential;
      return acc;
    }, {} as Record<string, boolean>);
    setConsent(defaultConsent);
  };

  const handleConsentChange = (categoryId: string, value: boolean) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category?.essential) return; // No se puede cambiar cookies esenciales

    const newConsent = { ...consent, [categoryId]: value };
    setConsent(newConsent);
  };

  const saveConsent = (consentData: Record<string, boolean>) => {
    const consentRecord: CookieConsent = {
      timestamp: new Date(),
      version: CookiesPolicyManager.getCookiesPolicy().version,
      categories: consentData,
      ipAddress: '', // Se obtendría del servidor
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      consentId: CookiesPolicyManager.generateConsentId(),
      method: 'banner'
    };

    localStorage.setItem('cookie_consent', JSON.stringify(consentRecord));
    setShowBanner(false);
    onConsentChange?.(consentData);
    
    // Activar/desactivar cookies según consentimiento
    applyCookieSettings(consentData);
  };

  const applyCookieSettings = (consentData: Record<string, boolean>) => {
    categories.forEach(category => {
      if (!category.essential && !consentData[category.id]) {
        // Eliminar cookies de categorías no consentidas
        category.cookies.forEach(cookie => {
          if (typeof document !== 'undefined') {
            document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookie.domain}`;
          }
        });
      }
    });
  };

  const handleAcceptAll = () => {
    const allConsent = categories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    saveConsent(allConsent);
  };

  const handleRejectAll = () => {
    const essentialOnly = categories.reduce((acc, category) => {
      acc[category.id] = category.essential;
      return acc;
    }, {} as Record<string, boolean>);
    saveConsent(essentialOnly);
  };

  const handleSaveSettings = () => {
    saveConsent(consent);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className={`cookie-consent-banner ${position} ${theme}`}>
      <div className="cookie-consent-overlay" />
      
      <div className="cookie-consent-content">
        {!showSettings ? (
          <div className="cookie-consent-main">
            <div className="cookie-consent-header">
              <h3>🍪 Configuración de Cookies</h3>
              <p>
                Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
                Puedes aceptar todas las cookies o configurarlas según tus preferencias.
              </p>
            </div>

            <div className="cookie-consent-summary">
              <div className="cookie-info">
                <strong>Cookies Esenciales:</strong> Siempre activas (necesarias para el funcionamiento básico)
              </div>
              <div className="cookie-info">
                <strong>Cookies Opcionales:</strong> Requieren tu consentimiento explícito
              </div>
            </div>

            <div className="cookie-consent-actions">
              <button 
                className="btn btn-primary"
                onClick={handleAcceptAll}
              >
                Aceptar Todas
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={handleRejectAll}
              >
                Solo Esenciales
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => setShowSettings(true)}
              >
                Configurar
              </button>
            </div>

            <div className="cookie-consent-links">
              <a href="/privacy-policy" target="_blank">Política de Privacidad</a>
              <a href="/cookie-policy" target="_blank">Política de Cookies</a>
              <a href="/legal-notice" target="_blank">Aviso Legal</a>
            </div>
          </div>
        ) : (
          <div className="cookie-consent-settings">
            <div className="cookie-settings-header">
              <h3>Configuración Detallada de Cookies</h3>
              <button 
                className="btn-close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>

            <div className="cookie-categories">
              {categories.map(category => (
                <div key={category.id} className="cookie-category">
                  <div className="cookie-category-header">
                    <div className="cookie-category-title">
                      <h4>{category.name}</h4>
                      <span className={`badge ${category.essential ? 'essential' : 'optional'}`}>
                        {category.essential ? 'Esencial' : 'Opcional'}
                      </span>
                    </div>
                    
                    <div className="cookie-category-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={consent[category.id] || false}
                          onChange={(e) => handleConsentChange(category.id, e.target.checked)}
                          disabled={category.essential}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="cookie-category-content">
                    <p className="cookie-category-description">
                      {category.description}
                    </p>

                    <div className="cookie-category-details">
                      <div className="detail-item">
                        <strong>Finalidad:</strong> {category.purpose}
                      </div>
                      <div className="detail-item">
                        <strong>Base Legal:</strong> {category.legalBasis}
                      </div>
                      <div className="detail-item">
                        <strong>Transferencias:</strong> {category.dataTransfer}
                      </div>
                      <div className="detail-item">
                        <strong>Retención:</strong> {category.retention}
                      </div>
                      <div className="detail-item">
                        <strong>Procesadores:</strong> {category.processors.join(', ')}
                      </div>
                    </div>

                    <details className="cookie-list-details">
                      <summary>Ver cookies específicas ({category.cookies.length})</summary>
                      <div className="cookie-list">
                        {category.cookies.map(cookie => (
                          <div key={cookie.name} className="cookie-item">
                            <div className="cookie-name">{cookie.name}</div>
                            <div className="cookie-details">
                              <div><strong>Dominio:</strong> {cookie.domain}</div>
                              <div><strong>Finalidad:</strong> {cookie.purpose}</div>
                              <div><strong>Duración:</strong> {cookie.duration}</div>
                              <div><strong>Tipo:</strong> {cookie.type}</div>
                              <div><strong>Procesador:</strong> {cookie.processor}</div>
                              <div><strong>País:</strong> {cookie.country}</div>
                              <div><strong>Datos Personales:</strong> {cookie.personalData ? 'Sí' : 'No'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>

            <div className="cookie-settings-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSaveSettings}
              >
                Guardar Configuración
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={handleAcceptAll}
              >
                Aceptar Todas
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={handleRejectAll}
              >
                Solo Esenciales
              </button>
            </div>

            <div className="cookie-legal-info">
              <h4>Tus Derechos</h4>
              <p>
                Según el RGPD, tienes derecho a acceder, rectificar, suprimir, portar, limitar y oponerte al tratamiento 
                de tus datos personales. Para ejercer estos derechos, contacta con nosotros en 
                <a href="mailto:privacidad@kopp-stadium.com">privacidad@kopp-stadium.com</a>
              </p>
              <p>
                También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) 
                en <a href="https://www.aepd.es" target="_blank">www.aepd.es</a>
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cookie-consent-banner {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .cookie-consent-banner.bottom {
          bottom: 0;
        }
        
        .cookie-consent-banner.top {
          top: 0;
        }
        
        .cookie-consent-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
        }
        
        .cookie-consent-content {
          position: relative;
          background: white;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .cookie-consent-banner.dark .cookie-consent-content {
          background: #1a1a1a;
          color: #ffffff;
        }
        
        .cookie-consent-main {
          padding: 24px;
        }
        
        .cookie-consent-header h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .cookie-consent-banner.dark .cookie-consent-header h3 {
          color: #ffffff;
        }
        
        .cookie-consent-header p {
          margin: 0 0 20px 0;
          line-height: 1.6;
          color: #666;
        }
        
        .cookie-consent-banner.dark .cookie-consent-header p {
          color: #ccc;
        }
        
        .cookie-consent-summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin: 0 0 20px 0;
        }
        
        .cookie-consent-banner.dark .cookie-consent-summary {
          background: #2a2a2a;
        }
        
        .cookie-info {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .cookie-consent-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary {
          background: #007bff;
          color: white;
        }
        
        .btn-primary:hover {
          background: #0056b3;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #545b62;
        }
        
        .btn-outline {
          background: transparent;
          border: 2px solid #007bff;
          color: #007bff;
        }
        
        .btn-outline:hover {
          background: #007bff;
          color: white;
        }
        
        .cookie-consent-links {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 14px;
        }
        
        .cookie-consent-links a {
          color: #007bff;
          text-decoration: none;
        }
        
        .cookie-consent-links a:hover {
          text-decoration: underline;
        }
        
        .cookie-consent-settings {
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .cookie-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .cookie-settings-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          color: #666;
        }
        
        .btn-close:hover {
          color: #000;
        }
        
        .cookie-categories {
          margin-bottom: 24px;
        }
        
        .cookie-category {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }
        
        .cookie-consent-banner.dark .cookie-category {
          border-color: #444;
        }
        
        .cookie-category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
        }
        
        .cookie-consent-banner.dark .cookie-category-header {
          background: #2a2a2a;
        }
        
        .cookie-category-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .cookie-category-title h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .badge {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        
        .badge.essential {
          background: #28a745;
          color: white;
        }
        
        .badge.optional {
          background: #ffc107;
          color: #212529;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #007bff;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
        
        input:disabled + .toggle-slider {
          background-color: #28a745;
          cursor: not-allowed;
        }
        
        .cookie-category-content {
          padding: 16px;
        }
        
        .cookie-category-description {
          margin: 0 0 16px 0;
          line-height: 1.6;
          color: #666;
        }
        
        .cookie-consent-banner.dark .cookie-category-description {
          color: #ccc;
        }
        
        .cookie-category-details {
          margin-bottom: 16px;
        }
        
        .detail-item {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .cookie-list-details {
          margin-top: 16px;
        }
        
        .cookie-list-details summary {
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 12px;
        }
        
        .cookie-list {
          border: 1px solid #e9ecef;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .cookie-item {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .cookie-item:last-child {
          border-bottom: none;
        }
        
        .cookie-name {
          font-weight: 600;
          margin-bottom: 8px;
          color: #007bff;
        }
        
        .cookie-details {
          font-size: 12px;
          color: #666;
        }
        
        .cookie-details div {
          margin: 4px 0;
        }
        
        .cookie-settings-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin: 24px 0;
        }
        
        .cookie-legal-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
        }
        
        .cookie-consent-banner.dark .cookie-legal-info {
          background: #2a2a2a;
        }
        
        .cookie-legal-info h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .cookie-legal-info p {
          margin: 8px 0;
          line-height: 1.6;
          font-size: 14px;
          color: #666;
        }
        
        .cookie-consent-banner.dark .cookie-legal-info p {
          color: #ccc;
        }
        
        .cookie-legal-info a {
          color: #007bff;
          text-decoration: none;
        }
        
        .cookie-legal-info a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .cookie-consent-content {
            margin: 0;
            border-radius: 0;
          }
          
          .cookie-consent-actions {
            flex-direction: column;
          }
          
          .cookie-category-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CookieConsentBanner;
