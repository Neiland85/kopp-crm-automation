import {
  HubSpotPageView,
  ZapierTrigger,
  ZapierZ,
  ZapierBundle,
} from '../types';
import { withRetry, logZapAction } from '../utils/common';

/**
 * Obtiene las nuevas vistas de página de HubSpot
 */
const getNewPageViews = async (
  z: ZapierZ,
  bundle: ZapierBundle
): Promise<HubSpotPageView[]> => {
  const apiKey = bundle.authData.hubspot_api_key;

  // Calcular timestamp para obtener solo vistas recientes
  const since = new Date();
  since.setMinutes(since.getMinutes() - 15); // Últimos 15 minutos
  const sinceTimestamp = since.getTime();

  const url = `https://api.hubapi.com/events/v3/events`;

  const request = {
    url,
    method: 'GET' as const,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    params: {
      limit: 100,
      eventType: 'pe91000001_pageview',
      occurredAfter: sinceTimestamp.toString(),
    },
  };

  try {
    const response = await withRetry(() => z.request(request), 3);
    const pageViews = response.data?.results || [];

    // Log de la acción
    await logZapAction(z, {
      action: 'trigger_new_page_view',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        page_views_count: pageViews.length,
        since_timestamp: sinceTimestamp,
      },
    });

    // Transformar datos para Zapier
    return pageViews.map((pageView: any) => ({
      id: pageView.id || `${pageView.objectId}_${pageView.occurredAt}`,
      portal_id:
        pageView.portalId || bundle.authData.hubspot_api_key.split('.')[0],
      email: pageView.email,
      page_url:
        pageView.properties?.hs_url || pageView.properties?.page_url || '',
      page_title:
        pageView.properties?.hs_page_title ||
        pageView.properties?.page_title ||
        '',
      timestamp: pageView.occurredAt || new Date().toISOString(),
      session_id: pageView.properties?.hs_session_id,
      visitor_id: pageView.properties?.hs_visitor_id || pageView.objectId,
      raw_data: pageView,
    }));
  } catch (error: any) {
    // Log del error
    await logZapAction(z, {
      action: 'trigger_new_page_view',
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message || 'Unknown error',
      data: {
        since_timestamp: sinceTimestamp,
      },
    });

    z.console.error('Error fetching page views:', error);
    throw error;
  }
};

/**
 * Configuración del trigger para nuevas vistas de página
 */
const trigger: ZapierTrigger = {
  key: 'new_page_view',
  noun: 'Page View',
  display: {
    label: 'New Page View',
    description: 'Triggers when a new page view occurs in HubSpot',
    important: false,
  },
  operation: {
    type: 'polling',
    perform: getNewPageViews,
    sample: {
      id: 'sample-pageview-123',
      portal_id: '12345678',
      email: 'visitor@example.com',
      page_url: 'https://example.com/about',
      page_title: 'About Us - Example Company',
      timestamp: '2024-01-15T10:30:00Z',
      session_id: 'session-abc123',
      visitor_id: 'visitor-def456',
    },
    outputFields: [
      { key: 'id', label: 'Page View ID', type: 'string' },
      { key: 'portal_id', label: 'Portal ID', type: 'string' },
      { key: 'email', label: 'Visitor Email', type: 'string' },
      { key: 'page_url', label: 'Page URL', type: 'string' },
      { key: 'page_title', label: 'Page Title', type: 'string' },
      { key: 'timestamp', label: 'Timestamp', type: 'datetime' },
      { key: 'session_id', label: 'Session ID', type: 'string' },
      { key: 'visitor_id', label: 'Visitor ID', type: 'string' },
    ],
  },
};

export default trigger;
