import React, { useState, useEffect } from 'react';
import { CookiesPolicyManager, CookieCategory } from '../policies/cookies-policy';
import { useCookies } from '../hooks/useCookies';
import './CookieConsentBanner.css';

interface CookieConsentBannerProps {
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onCustomize?: () => void;
  position?: 'bottom' | 'top';
  theme?: 'light' | 'dark';
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onAcceptAll,
  onRejectAll,
  onCustomize,
  position = 'bottom',
  theme = 'light'
}) => {
  const { hasConsent, updateConsent, getConsentState } = useCookies();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] = useState<CookieCategory[]>([]);
  const [customConsent, setCustomConsent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Mostrar banner solo si no hay consentimiento previo
    const consentState = getConsentState();
    if (!consentState) {
      setIsVisible(true);
      loadCookieCategories();
    }
  }, [getConsentState]);

  const loadCookieCategories = () => {
    const cookiePolicy = CookiesPolicyManager.getCookiesPolicy();
    const cookieCategories = cookiePolicy.categories;
    setCategories(cookieCategories);
    
    // Inicializar estado de consentimiento personalizado
    const initialConsent: Record<string, boolean> = {};
    cookieCategories.forEach((category: CookieCategory) => {
      initialConsent[category.id] = category.essential; // Esenciales siempre activadas
    });
    setCustomConsent(initialConsent);
  };

  const handleAcceptAll = () => {
    const consentData: Record<string, boolean> = {};
    categories.forEach(category => {
      consentData[category.id] = true;
    });
    
    updateConsent(consentData);
    setIsVisible(false);
    onAcceptAll?.();
  };

  const handleRejectAll = () => {
    const consentData: Record<string, boolean> = {};
    categories.forEach(category => {
      consentData[category.id] = category.essential; // Solo esenciales
    });
    
    updateConsent(consentData);
    setIsVisible(false);
    onRejectAll?.();
  };

  const handleCustomSave = () => {
    updateConsent(customConsent);
    setIsVisible(false);
    onCustomize?.();
  };

  const handleCategoryToggle = (categoryId: string, enabled: boolean) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category?.essential) return; // No permitir desactivar esenciales
    
    setCustomConsent(prev => ({
      ...prev,
      [categoryId]: enabled
    }));
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`cookie-consent-banner cookie-consent-banner--${position} cookie-consent-banner--${theme}`}
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div className="cookie-consent-banner__overlay" onClick={() => setIsVisible(false)} />
      
      <div className="cookie-consent-banner__content">
        <div className="cookie-consent-banner__header">
          <h2 id="cookie-banner-title" className="cookie-consent-banner__title">
            🍪 Configuración de Cookies
          </h2>
          <button 
            className="cookie-consent-banner__close"
            onClick={() => setIsVisible(false)}
            aria-label="Cerrar banner de cookies"
          >
            ✕
          </button>
        </div>

        <div className="cookie-consent-banner__body">
          <p id="cookie-banner-description" className="cookie-consent-banner__description">
            Utilizamos cookies para mejorar tu experiencia de navegación, analizar el tráfico del sitio web 
            y personalizar el contenido. Al hacer clic en "Aceptar todas", consientes el uso de todas las cookies. 
            Puedes gestionar tus preferencias en cualquier momento.
          </p>

          {!showDetails ? (
            <div className="cookie-consent-banner__actions">
              <button 
                className="cookie-consent-banner__button cookie-consent-banner__button--secondary"
                onClick={handleRejectAll}
              >
                Rechazar todas
              </button>
              
              <button 
                className="cookie-consent-banner__button cookie-consent-banner__button--tertiary"
                onClick={() => setShowDetails(true)}
              >
                Personalizar
              </button>
              
              <button 
                className="cookie-consent-banner__button cookie-consent-banner__button--primary"
                onClick={handleAcceptAll}
              >
                Aceptar todas
              </button>
            </div>
          ) : (
            <div className="cookie-consent-banner__details">
              <h3 className="cookie-consent-banner__subtitle">
                Personalizar preferencias de cookies
              </h3>
              
              <div className="cookie-consent-banner__categories">
                {categories.map(category => (
                  <div key={category.id} className="cookie-consent-banner__category">
                    <div className="cookie-consent-banner__category-header">
                      <label className="cookie-consent-banner__category-label">
                        <input
                          type="checkbox"
                          checked={customConsent[category.id] || false}
                          disabled={category.essential}
                          onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                          className="cookie-consent-banner__checkbox"
                        />
                        <span className="cookie-consent-banner__category-name">
                          {category.name}
                          {category.essential && (
                            <span className="cookie-consent-banner__essential-badge">
                              Esencial
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                    
                    <p className="cookie-consent-banner__category-description">
                      {category.description}
                    </p>
                    
                    <details className="cookie-consent-banner__category-details">
                      <summary className="cookie-consent-banner__category-toggle">
                        Ver cookies ({category.cookies.length})
                      </summary>
                      <div className="cookie-consent-banner__cookies-list">
                        {category.cookies.map(cookie => (
                          <div key={cookie.name} className="cookie-consent-banner__cookie">
                            <div className="cookie-consent-banner__cookie-header">
                              <strong>{cookie.name}</strong>
                              <span className="cookie-consent-banner__cookie-duration">
                                {cookie.duration}
                              </span>
                            </div>
                            <p className="cookie-consent-banner__cookie-purpose">
                              {cookie.purpose}
                            </p>
                            <div className="cookie-consent-banner__cookie-meta">
                              <span>Dominio: {cookie.domain}</span>
                              <span>Tipo: {cookie.type}</span>
                              <span>Procesador: {cookie.processor}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
              
              <div className="cookie-consent-banner__custom-actions">
                <button 
                  className="cookie-consent-banner__button cookie-consent-banner__button--secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Volver
                </button>
                
                <button 
                  className="cookie-consent-banner__button cookie-consent-banner__button--primary"
                  onClick={handleCustomSave}
                >
                  Guardar preferencias
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="cookie-consent-banner__footer">
          <p className="cookie-consent-banner__legal">
            Para más información, consulta nuestra{' '}
            <a 
              href="/politica-cookies" 
              className="cookie-consent-banner__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Cookies
            </a>
            {' '}y{' '}
            <a 
              href="/politica-privacidad" 
              className="cookie-consent-banner__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
