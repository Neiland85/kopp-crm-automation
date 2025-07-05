import { Request, Response } from 'express';

type ServiceStatus = 'up' | 'down' | 'unknown';
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: ServiceStatus;
    hubspot: ServiceStatus;
    slack: ServiceStatus;
    zapier: ServiceStatus;
    notion: ServiceStatus;
  };
  metrics: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    requestsCount: number;
    errorsCount: number;
  };
}

// Global counters for metrics
let requestsCount = 0;
let errorsCount = 0;

export const incrementRequestCount = () => requestsCount++;
export const incrementErrorCount = () => errorsCount++;

// Health check endpoint
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  incrementRequestCount();

  try {
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'up', // Placeholder - implement actual DB check
        hubspot: await checkHubSpotHealth(),
        slack: await checkSlackHealth(),
        zapier: await checkZapierHealth(),
        notion: await checkNotionHealth(),
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        requestsCount,
        errorsCount,
      }
    };

    // Determine overall health status
    const servicesDown = Object.values(healthResult.services).filter(status => status === 'down');

    if (servicesDown.length === 0) {
      healthResult.status = 'healthy';
    } else if (servicesDown.length <= 2) {
      healthResult.status = 'degraded';
    } else {
      healthResult.status = 'unhealthy';
    }

    let httpStatus: number;
    if (healthResult.status === 'healthy') {
      httpStatus = 200;
    } else if (healthResult.status === 'degraded') {
      httpStatus = 206;
    } else {
      httpStatus = 503;
    }

    res.status(httpStatus).json(healthResult);

  } catch (error) {
    incrementErrorCount();
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Individual service health checks
async function checkHubSpotHealth(): Promise<ServiceStatus> {
  try {
    if (!process.env.HUBSPOT_API_KEY) return 'unknown';

    // Quick API call to verify HubSpot connectivity
    const response = await fetch('https://api.hubapi.com/contacts/v1/lists/all/contacts/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      },
    });

    return response.ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

async function checkSlackHealth(): Promise<ServiceStatus> {
  try {
    if (!process.env.SLACK_BOT_TOKEN) return 'unknown';

    // Quick API call to verify Slack connectivity
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

async function checkZapierHealth(): Promise<ServiceStatus> {
  try {
    if (!process.env.ZAPIER_WEBHOOK_URL) return 'unknown';

    // Zapier webhooks are typically always "up" if configured
    // We can't really test without triggering actual workflows
    return 'up';
  } catch {
    return 'down';
  }
}

async function checkNotionHealth(): Promise<ServiceStatus> {
  try {
    if (!process.env.NOTION_TOKEN) return 'unknown';

    // Quick API call to verify Notion connectivity
    const response = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
    });

    return response.ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

// Readiness check - simpler version for load balancers
export const readinessCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
