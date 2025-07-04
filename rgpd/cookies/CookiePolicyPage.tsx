/**
 * Página de Política de Cookies Detallada
 * Cumple con RGPD, LSSI y estándares AEPD
 * Generada automáticamente desde CookiesPolicyManager
 */

import React, { useState, useEffect } from 'react';
import { CookiesPolicyManager, CookieCategory } from '../policies/cookies-policy';

interface CookiePolicyPageProps {
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  interactive?: boolean;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({
  showPrintButton = true,
  showDownloadButton = true,
  interactive = true
}) => {
  const [policyData, setPolicyData] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const policy = CookiesPolicyManager.getCookiesPolicy();
    setPolicyData(policy);
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = policyData?.categories?.filter((category: CookieCategory) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.cookies.some(cookie => 
      cookie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cookie.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatePolicyText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'politica-cookies-kopp-stadium.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePolicyText = (): string => {
    if (!policyData) return '';
    
    let text = `POLÍTICA DE COOKIES - KOPP STADIUM\n`;
    text += `Versión: ${policyData.version}\n`;
    text += `Última actualización: ${policyData.lastUpdated}\n\n`;
    
    text += `MARCO LEGAL\n`;
    Object.entries(policyData.legalFramework).forEach(([key, value]) => {
      text += `- ${value}\n`;
    });
    
    text += `\nCATEGORÍAS DE COOKIES\n\n`;
    policyData.categories.forEach((category: CookieCategory) => {
      text += `${category.name.toUpperCase()}\n`;
      text += `Descripción: ${category.description}\n`;
      text += `Finalidad: ${category.purpose}\n`;
      text += `Base Legal: ${category.legalBasis}\n`;
      text += `Transferencias: ${category.dataTransfer}\n`;
      text += `Retención: ${category.retention}\n`;
      text += `Procesadores: ${category.processors.join(', ')}\n`;
      text += `Cookies:\n`;
      category.cookies.forEach(cookie => {
        text += `  - ${cookie.name}: ${cookie.purpose} (${cookie.duration})\n`;
      });
      text += `\n`;
    });
    
    text += `TUS DERECHOS\n`;
    Object.entries(policyData.userRights).forEach(([key, value]) => {
      text += `- ${value}\n`;
    });
    
    text += `\nCONTACTO\n`;
    Object.entries(policyData.contactInfo).forEach(([key, value]) => {
      text += `${key}: ${value}\n`;
    });
    
    return text;
  };

  if (!policyData) {
    return <div className="loading">Cargando política de cookies...</div>;
  }

  return (
    <div className="cookie-policy-page">
      <header className="policy-header">
        <h1>🍪 Política de Cookies</h1>
        <div className="policy-meta">
          <span className="version">Versión {policyData.version}</span>
          <span className="last-updated">Actualizada: {policyData.lastUpdated}</span>
        </div>
        
        {interactive && (
          <div className="policy-actions">
            {showPrintButton && (
              <button className="btn btn-outline" onClick={handlePrint}>
                🖨️ Imprimir
              </button>
            )}
            {showDownloadButton && (
              <button className="btn btn-outline" onClick={handleDownload}>
                📥 Descargar
              </button>
            )}
          </div>
        )}
      </header>

      <div className="policy-content">
        <section className="policy-intro">
          <h2>Introducción</h2>
          <p>
            Esta Política de Cookies explica cómo <strong>Kopp Stadium S.L.</strong> utiliza cookies y tecnologías similares 
            en nuestro sitio web. Cumplimos con todas las regulaciones aplicables incluidas el RGPD, LSSI y las directrices 
            de la Agencia Española de Protección de Datos (AEPD).
          </p>
          <p>
            Al usar nuestro sitio web, aceptas el uso de cookies esenciales. Para el resto de cookies, requerimos tu 
            consentimiento explícito que puedes gestionar en cualquier momento.
          </p>
        </section>

        <section className="policy-legal">
          <h2>Marco Legal</h2>
          <div className="legal-framework">
            {Object.entries(policyData.legalFramework).map(([key, value]) => (
              <div key={key} className="legal-item">
                <strong>{key.toUpperCase()}:</strong> {value as string}
              </div>
            ))}
          </div>
        </section>

        {interactive && (
          <section className="policy-search">
            <h2>Buscar en la Política</h2>
            <input
              type="text"
              placeholder="Buscar cookies, categorías o finalidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <div className="search-results">
                Mostrando {filteredCategories.length} de {policyData.categories.length} categorías
              </div>
            )}
          </section>
        )}

        <section className="policy-categories">
          <h2>Categorías de Cookies</h2>
          <div className="categories-summary">
            <div className="summary-item">
              <strong>{policyData.categories.length}</strong> categorías
            </div>
            <div className="summary-item">
              <strong>{policyData.categories.reduce((sum: number, cat: CookieCategory) => sum + cat.cookies.length, 0)}</strong> cookies
            </div>
            <div className="summary-item">
              <strong>{policyData.categories.filter((cat: CookieCategory) => cat.essential).length}</strong> esenciales
            </div>
            <div className="summary-item">
              <strong>{policyData.categories.filter((cat: CookieCategory) => !cat.essential).length}</strong> opcionales
            </div>
          </div>

          <div className="categories-list">
            {filteredCategories.map((category: CookieCategory) => (
              <div key={category.id} className="category-card">
                <div 
                  className="category-header"
                  onClick={() => interactive && toggleCategory(category.id)}
                  style={{ cursor: interactive ? 'pointer' : 'default' }}
                >
                  <div className="category-title">
                    <h3>{category.name}</h3>
                    <div className="category-badges">
                      <span className={`badge ${category.essential ? 'essential' : 'optional'}`}>
                        {category.essential ? 'Esencial' : 'Opcional'}
                      </span>
                      <span className="badge cookie-count">
                        {category.cookies.length} cookies
                      </span>
                    </div>
                  </div>
                  {interactive && (
                    <span className="expand-icon">
                      {expandedCategories.has(category.id) ? '▼' : '▶'}
                    </span>
                  )}
                </div>

                <div className="category-description">
                  {category.description}
                </div>

                <div className={`category-details ${!interactive || expandedCategories.has(category.id) ? 'expanded' : ''}`}>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Finalidad:</strong>
                      <span>{category.purpose}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Base Legal:</strong>
                      <span>{category.legalBasis}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Transferencias Internacionales:</strong>
                      <span>{category.dataTransfer}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Período de Retención:</strong>
                      <span>{category.retention}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Procesadores:</strong>
                      <span>{category.processors.join(', ')}</span>
                    </div>
                  </div>

                  <div className="cookies-table">
                    <h4>Cookies Específicas</h4>
                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Dominio</th>
                            <th>Finalidad</th>
                            <th>Duración</th>
                            <th>Tipo</th>
                            <th>Procesador</th>
                            <th>País</th>
                            <th>Datos Personales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.cookies.map(cookie => (
                            <tr key={cookie.name}>
                              <td className="cookie-name">{cookie.name}</td>
                              <td>{cookie.domain}</td>
                              <td>{cookie.purpose}</td>
                              <td>{cookie.duration}</td>
                              <td>
                                <span className={`type-badge ${cookie.type}`}>
                                  {cookie.type}
                                </span>
                              </td>
                              <td>{cookie.processor}</td>
                              <td>{cookie.country}</td>
                              <td>
                                <span className={`personal-data ${cookie.personalData ? 'yes' : 'no'}`}>
                                  {cookie.personalData ? 'Sí' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="policy-rights">
          <h2>Tus Derechos</h2>
          <p>
            Según el Reglamento General de Protección de Datos (RGPD) y la legislación española aplicable, 
            tienes los siguientes derechos:
          </p>
          <div className="rights-grid">
            {Object.entries(policyData.userRights).map(([key, value]) => (
              <div key={key} className="right-item">
                <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                <p>{value as string}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="policy-management">
          <h2>Gestión de Cookies</h2>
          <div className="management-options">
            <div className="management-item">
              <h4>🔧 Configuración del Sitio</h4>
              <p>
                Puedes gestionar tus preferencias de cookies en cualquier momento haciendo clic en el botón 
                "Configurar Cookies" en la parte inferior de cualquier página.
              </p>
            </div>
            <div className="management-item">
              <h4>🌐 Configuración del Navegador</h4>
              <p>
                También puedes configurar tu navegador para que bloquee o elimine cookies. Ten en cuenta que 
                esto puede afectar la funcionalidad del sitio.
              </p>
            </div>
            <div className="management-item">
              <h4>🔄 Retirada de Consentimiento</h4>
              <p>
                Puedes retirar tu consentimiento en cualquier momento. Esto no afectará la legalidad del 
                procesamiento basado en el consentimiento previo a su retirada.
              </p>
            </div>
          </div>
        </section>

        <section className="policy-contact">
          <h2>Contacto</h2>
          <div className="contact-grid">
            {Object.entries(policyData.contactInfo).map(([key, value]) => (
              <div key={key} className="contact-item">
                <strong>{key.toUpperCase()}:</strong>
                {key === 'email' || key === 'dpo' ? (
                  <a href={`mailto:${value}`}>{value as string}</a>
                ) : key === 'aepd' ? (
                  <a href={value as string} target="_blank" rel="noopener noreferrer">
                    Agencia Española de Protección de Datos
                  </a>
                ) : (
                  <span>{value as string}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="policy-updates">
          <h2>Actualizaciones de la Política</h2>
          <p>
            Esta política puede ser actualizada periódicamente. Te notificaremos sobre cambios significativos 
            mediante un aviso en nuestro sitio web o por email si tienes una cuenta con nosotros.
          </p>
          <p>
            <strong>Última actualización:</strong> {policyData.lastUpdated}
          </p>
        </section>
      </div>

      <style jsx>{`
        .cookie-policy-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
        }

        .policy-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }

        .policy-header h1 {
          font-size: 2.5rem;
          margin: 0 0 16px 0;
          color: #1a1a1a;
        }

        .policy-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .version, .last-updated {
          background: #f8f9fa;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #666;
        }

        .policy-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 20px;
          border: 2px solid #007bff;
          background: transparent;
          color: #007bff;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn:hover {
          background: #007bff;
          color: white;
        }

        .policy-content {
          margin-top: 40px;
        }

        .policy-content section {
          margin-bottom: 40px;
        }

        .policy-content h2 {
          font-size: 1.8rem;
          margin: 0 0 20px 0;
          color: #1a1a1a;
          border-bottom: 2px solid #007bff;
          padding-bottom: 8px;
        }

        .policy-intro p {
          margin: 16px 0;
          font-size: 1.1rem;
        }

        .legal-framework {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .legal-item {
          margin: 12px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .legal-item:last-child {
          border-bottom: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .search-results {
          margin-top: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        .categories-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .summary-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .summary-item strong {
          display: block;
          font-size: 1.5rem;
          color: #007bff;
          margin-bottom: 4px;
        }

        .category-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          margin-bottom: 20px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .category-header {
          padding: 20px;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-title {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .category-title h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #1a1a1a;
        }

        .category-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge.essential {
          background: #28a745;
          color: white;
        }

        .badge.optional {
          background: #ffc107;
          color: #212529;
        }

        .badge.cookie-count {
          background: #6c757d;
          color: white;
        }

        .expand-icon {
          font-size: 1.2rem;
          color: #666;
          transition: transform 0.2s;
        }

        .category-description {
          padding: 0 20px 20px 20px;
          font-size: 1rem;
          color: #555;
        }

        .category-details {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .category-details.expanded {
          max-height: none;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item strong {
          color: #1a1a1a;
          font-size: 0.9rem;
        }

        .detail-item span {
          color: #666;
          font-size: 0.9rem;
        }

        .cookies-table {
          padding: 20px;
          border-top: 1px solid #e9ecef;
        }

        .cookies-table h4 {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          color: #1a1a1a;
        }

        .table-responsive {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        th, td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #1a1a1a;
        }

        .cookie-name {
          font-family: monospace;
          font-weight: 600;
          color: #007bff;
        }

        .type-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .type-badge.session {
          background: #17a2b8;
          color: white;
        }

        .type-badge.persistent {
          background: #fd7e14;
          color: white;
        }

        .personal-data {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .personal-data.yes {
          background: #dc3545;
          color: white;
        }

        .personal-data.no {
          background: #28a745;
          color: white;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .right-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .right-item h4 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
        }

        .right-item p {
          margin: 0;
          color: #666;
        }

        .management-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .management-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .management-item h4 {
          margin: 0 0 12px 0;
          color: #1a1a1a;
        }

        .management-item p {
          margin: 0;
          color: #666;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .contact-item {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .contact-item strong {
          display: block;
          margin-bottom: 4px;
          color: #1a1a1a;
        }

        .contact-item a {
          color: #007bff;
          text-decoration: none;
        }

        .contact-item a:hover {
          text-decoration: underline;
        }

        .policy-updates {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 1.2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .cookie-policy-page {
            padding: 10px;
          }

          .policy-header h1 {
            font-size: 2rem;
          }

          .policy-meta {
            flex-direction: column;
            align-items: center;
          }

          .category-title {
            flex-direction: column;
            align-items: flex-start;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .rights-grid {
            grid-template-columns: 1fr;
          }

          .management-options {
            grid-template-columns: 1fr;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          .policy-actions {
            display: none;
          }
          
          .expand-icon {
            display: none;
          }
          
          .category-details {
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CookiePolicyPage;
